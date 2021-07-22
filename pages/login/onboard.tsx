import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { requestApi } from "utils/axios/request"
import { saveToken } from "utils/axios/getToken"
import storage from "utils/localStorage"
import { Avatar, Box, Button, Center, Flex, Heading, HStack, Input, Text, useToast, VStack, Wrap } from "@chakra-ui/react"
import Card from "components/card"
import { config } from "configs/config"
import Link from "next/link"
import { ReserveUrls } from "src/data/reserve-urls"
import { Tag } from "src/types/tag"
import Follow from "components/interaction/follow"
import { validateUsername } from "utils/user"
import useSession from "hooks/use-session"

const OnboardPage = () => {
    const {useLogin} = useSession()
    const [step,setStep] = useState(1)
    const [email,setEmail] = useState('')
    const [nickname,setNickname] = useState('')
    const [username,setUsername] = useState('')
    const [tags,setTags]:[Tag[],any] = useState([])
    const router = useRouter()
    const toast = useToast()
    const code = router.query.code
    useEffect(() => {
        if (code) {
            getEmailByCode(code)
        }
    }, [code])

    const getEmailByCode = async (code) => {
        const res = await requestApi.get(`/user/email/byCode?code=${code}`)
        if (!res.data) {
            toast({
                description: "code不存在或者已失效",
                status: "error",
                duration: 2000,
                isClosable: true,
            })
            setTimeout(() => router.push('/login'),2000)
        }
        setEmail(res.data)
    }

    const register = async () => {
        if (nickname === "" || username === "") {
            toast({
                description: "nickname or username can't be empty",
                status: "error",
                duration: 2000,
                isClosable: true,
            })
            return 
        }
        const res0 = await validateUsername(username)
        if (res0) {
            toast({
                description: res0,
                status: "error",
                duration: 2000,
                isClosable: true,
            })
            return 
        }
        const res = await requestApi.post("/user/register", { code: code, nickname: nickname,username: username })
        saveToken(res.data.token)

        setStep(2)
        const res1 = await requestApi.get(`/tag/all`)
        setTags(res1.data)
    }

    const finish = async () => {
        useLogin()
        const oldPage = storage.get('current-page')
        if (oldPage) {
            storage.remove('current-page')
            router.push(oldPage)
        } else {
            router.push('/')
        }
    }

    return (
        <Center h="100vh" mt="-8">
            <Card p="6" width="800px">
                {step === 1 ? <>
                <Text layerStyle="textSecondary" fontWeight="bold">CREATE YOUR ACCOUNT</Text>
                <Heading size="md" mt="2">🤘 Let's start your {config.appName} journey</Heading>
 
                <VStack alignItems="left" mt="8" spacing="4">
                    <HStack>
                        <Text width="150px">Nick name</Text>
                        <Input value={nickname} onChange={e => setNickname(e.currentTarget.value)} size="lg" width="auto" placeholder="enter your nick name" _focus={null}></Input>
                    </HStack>
                    <HStack>
                        <Text width="150px">User name</Text>
                        <Input value={username} onChange={e => setUsername(e.currentTarget.value)}   size="lg" width="auto" placeholder="user name is unique, and cant be changed anymore" _focus={null}></Input>
                    </HStack>
                    <HStack>
                        <Text width="150px">Email address</Text>
                        <Input  size="lg" width="auto" value={email} _focus={null} disabled></Input>
                    </HStack>
                </VStack>

                <Button colorScheme="teal" size="lg" mt="6" float="right" onClick={register}>Next</Button>
                </> : 
                <>
                    <Text layerStyle="textSecondary" fontWeight="bold">(OPTIONAL) PERSONALIZE YOUR HASHNODE FEED</Text>
                    <Heading size="md" mt="2">Follow technologies you care about.</Heading>
                    <Text mt="2" layerStyle="textSecondary" fontSize=".9rem">Hashnode is a platform for independent bloggers. By following the right tags you can personalize your feed and discover content you care about.</Text>
                    <Wrap mt="4" p="1">
                    {
                      tags.map(tag =>
                        <HStack key={tag.id} mr="4" mb="4">
                          <HStack spacing="1" mr="3"  cursor="pointer" width="120px">
                            <Avatar src={tag.icon} size="sm" />
                            <Text>{tag.title}</Text>
                          </HStack>

                          <Follow targetID={tag.id} followed={false} buttonIcon={false}/>
                        </HStack>)
                    }
                  </Wrap>

                  <Button colorScheme="teal" size="lg" mt="6" float="right" onClick={finish}>Finish</Button>
                </>
            }
            </Card>
        </Center>
    )
}

export default OnboardPage


