import {
    chakra,
    Flex,
    HStack,
    IconButton,
    useColorModeValue,
    useDisclosure,
    useUpdateEffect,
    Heading,
    Button,
    Divider,
    Text,
    Tooltip
} from "@chakra-ui/react"
import { useViewportScroll } from "framer-motion"
import React, { useEffect, useState } from "react"
import { SearchIcon } from "@chakra-ui/icons"
import DarkMode from "components/dark-mode"
import AccountMenu from "components/user-menu"
import { FaGithub, FaTwitter, FaUserPlus } from "react-icons/fa"
import Follow from "components/interaction/follow"
import { requestApi } from "utils/axios/request"
import { Story } from "src/types/story"
import { getSvgIcon } from "components/svg-icon"
import Link from "next/link"
import Logo from "components/logo"
import { ReserveUrls } from "src/data/reserve-urls"


interface Props {
    post: Story
}

function PostNav(props: Props) {
    const { post } = props
    const [followed, setFollowed] = useState(null)
    const enterBodyBg = useColorModeValue('white',"#1A202C")
    const leaveBodyBg = useColorModeValue('#F7FAFC',"#1A202C")
    useEffect(() => {
        if (post) {
            requestApi.get(`/interaction/followed/${post.creator.id}`).then(res => setFollowed(res.data))
        }
    }, [])

    // useEffect(() => {
    //     console.log(enterBodyBg)
    //     document.body.style.backgroundColor = enterBodyBg
    //     return () => {
    //         document.body.style.backgroundColor = leaveBodyBg
    //     }
    // }, [enterBodyBg])

    return (
        <chakra.header
            transition="box-shadow 0.2s"
            top="0"
            zIndex="3"
            left="0"
            right="0"
            width="full"
            bg={useColorModeValue('gray.50', 'gray.800')}
        >
            <chakra.div height="4.5rem" mx="auto" maxW="1200px">
                <Flex w="100%" h="100%" align="center" justify="space-between" px={{ base: "4", md: "6" }}>

                    <Logo width="130" />

                    <HStack
                        color={useColorModeValue("gray.500", "gray.400")}
                        spacing={[1, 1, 2, 2]}
                    >
                        <Tooltip label="back to home" openDelay={300}>
                            <Link href={`${ReserveUrls.Search}/posts`}>
                                <IconButton
                                    size="md"
                                    fontSize="lg"
                                    variant="ghost"
                                    color="current"
                                    _focus={null}
                                    icon={getSvgIcon("search")}
                                    aria-label="search in this blog"
                                />
                            </Link>
                        </Tooltip>
                        <DarkMode />
                        <AccountMenu />
                    </HStack>
                </Flex>
                <Flex w="100%" align="center" justify="space-between" px={{ base: "6", md: "10" }} mt="2">
                    <Link href={`/${post.creator.username}`}><Heading size="md" cursor="pointer" mr="1" zIndex="1">{post.creator.nickname}的博客</Heading></Link>
                    {followed !== null && <Follow targetID={post?.creator.id} followed={followed} />}
                </Flex>
                <Divider mt="2" />
            </chakra.div>
        </chakra.header>
    )
}

export default PostNav

