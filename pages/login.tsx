import React, { useState } from "react"
import {
    Text,
    Box,
    VStack,
    Button,
    Image,
    useColorModeValue,
    Link,
    Center,
    Flex,
    IconButton,
    HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    useDisclosure,
    Input,
    useToast
} from "@chakra-ui/react"
import Logo from "components/logo"
import { FaEnvelope, FaGithub } from "react-icons/fa"
import { requestApi } from "utils/axios/request"
import { saveToken } from "utils/axios/getToken"
import storage from "utils/localStorage"
import { useRouter } from "next/router"
import { validateEmail } from "utils/user"


const LoginPage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const router = useRouter()
    const [email,setEmail] = useState('')
    const login = async (email:string) => {
        const res = await requestApi.post("/user/login",{email: email})
        saveToken(res.data.token)
        storage.set('session', res.data)
        const oldPage = storage.get('current-page')
        if (oldPage) {
            storage.remove('current-page')
            router.push(oldPage)
        } else {
            router.push('/')
        }
    }

    const onEmailLogin = async () => {
        const err = await validateEmail(email,false)
        if (err) {
            toast({
                description: err,
                status: "error",
                duration: 2000,
                isClosable: true,
            })
            return 
        }

        login(email)
    }

    return (
        <Box height="100vh" width="100%" display="flex" alignItems="center" justifyContent="center">
            <Image src="/login-bg.svg" height="100%" position="absolute" />
            <Box textAlign="center" display="flex" alignItems="center" flexDirection="column">
                <Logo width="12rem" />
                <Text mt="8" fontSize="1.1rem" fontWeight="500">欢迎加入im.dev，一起打造全世界最好的开发者社区</Text>
                <VStack mt="2" p="5" align="left" spacing="2" fontSize="15px">
                    <Box display="flex" flexDirection="row" alignItems="center">
                        <svg width="48px" height="48px" fill={useColorModeValue("teal", "white")} version="1.1" viewBox="0 0 24 24"><path d="M7.036 14.836a1.003 1.003 0 01-1.418 0l-.709-.709a6.518 6.518 0 119.218-9.218l.71.71a1.003 1.003 0 010 1.417l-.71.71a1.003 1.003 0 01-1.418 0L12 7.035A3.51 3.51 0 007.036 12l.71.71a1.003 1.003 0 010 1.417l-.71.71zm2.128 3.546a1.003 1.003 0 010-1.418l.709-.71a1.003 1.003 0 011.418 0l.709.71A3.51 3.51 0 0016.964 12l-.71-.71a1.003 1.003 0 010-1.417l.71-.71a1.003 1.003 0 011.418 0l.709.71a6.518 6.518 0 11-9.218 9.218l-.71-.71zm0-9.218a1.504 1.504 0 012.127 0l3.545 3.545a1.504 1.504 0 01-2.127 2.127l-3.545-3.545a1.504 1.504 0 010-2.127z" fillRule="evenodd"></path></svg>
                        <Text ml="4" layerStyle="textSecondary">从世界各地精选最优秀的内容</Text>
                    </Box>
                    <Box display="flex" flexDirection="row" alignItems="center">
                        <svg width="48px" height="48px" fill={useColorModeValue("teal", "white")} version="1.1" viewBox="0 0 24 24"><path d="M9 2v1a1 1 0 001 1h4a1 1 0 001-1V2h1a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2h1zm1 16a1 1 0 000 2h4a1 1 0 000-2h-4z" fillRule="evenodd"></path></svg>
                        <Text ml="4" layerStyle="textSecondary">丰富的功能特性等待你的探索</Text>
                    </Box>
                    <Box display="flex" flexDirection="row" alignItems="center">
                        <svg width="48px" height="48px" fill={useColorModeValue("teal", "white")} version="1.1" viewBox="0 0 24 24"><path d="M19 21l-3-.5.786-4.321A1 1 0 0015.802 15H8.198a1 1 0 00-.984 1.179L8 20.5 5 21a1 1 0 01-1-1v-.5c0-4.142 3.582-7.5 8-7.5s8 3.358 8 7.5v.5a1 1 0 01-1 1zm-7-2a1 1 0 110-2 1 1 0 010 2zm0-8a4 4 0 110-8 4 4 0 010 8z" fillRule="evenodd"></path></svg>
                        <Text ml="4" layerStyle="textSecondary">充分展示自我并获得猎头关注</Text>
                    </Box>
                </VStack>

                <HStack mt="6" spacing="3">
                    <Button onClick={() => login('cto@188.com')} layerStyle="colorButton" fontSize=".9rem" leftIcon={<FaGithub fontSize="1.0rem" />}>使用github登录</Button>
                    <Text layerStyle="textSecondary">OR</Text>
                    <IconButton layerStyle="textSecondary" variant="outline" aria-label="login with email" icon={<FaEnvelope />} onClick={onOpen}/>
                </HStack>
                <Text mt="6" fontSize=".7rem" layerStyle="textSecondary">如果继续，则表示你同意im.dev的<Link textDecoration="underline">服务条款</Link>和<Link textDecoration="underline">隐私政策</Link></Text>
                {/* <Image src="/pokeman.svg" height="300px" /> */}
            </Box>
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent mt="0" px="10" py="6"> 
                    <ModalBody>
                        <VStack alignItems="left" spacing="5">
                            <Text layerStyle="textSecondary" fontWeight="550">Sign in using a secure link</Text>
                            <Input value={email} onChange={e => setEmail(e.currentTarget.value)} placeholder="enter your email address" _focus={null}></Input>
                            <Button colorScheme="teal" onClick={onEmailLogin}>Submit</Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    )
}

export default LoginPage

