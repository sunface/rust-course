import React from "react"
import {chakra, Heading, Image, Text, HStack,Button, Flex,PropsOf,Box, Avatar, VStack} from "@chakra-ui/react"
import { Tag } from "src/types/tag"
import { ReserveUrls } from "src/data/reserve-urls"
import NextLink from "next/link"
import { Post } from "src/types/posts"
import moment from 'moment'
import { FaGithub } from "react-icons/fa"
import Link from "next/link"
import { useRouter } from "next/router"

type Props = PropsOf<typeof chakra.div> & {
    post : Post
}

export const PostAuthor= ({post}:Props) =>{
    const router = useRouter()
    console.log(post)
    return (
        <Flex justifyContent="space-between">
            <HStack spacing="4">
                <Avatar src={post.creator.avatar} size="lg" onClick={() => router.push(`/${post.creator.username}`)} cursor="pointer"/>
                <VStack alignItems="left" spacing="1">
                    <Heading size="sm" onClick={() => router.push(`/${post.creator.username}`)} cursor="pointer">{post.creator.nickname === "" ? post.creator.username : post.creator.nickname}</Heading>
                    <Text layerStyle="textSecondary" fontSize=".9rem">发布于<chakra.span fontWeight="600" ml="1">{moment(post.created).fromNow()}</chakra.span></Text>
                    <HStack layerStyle="textSecondary" fontSize=".9rem" spacing="3">
                        <FaGithub />  <chakra.span>4 min read</chakra.span>
                    </HStack>
                </VStack>
            </HStack>
        </Flex>  
    )
} 

export default PostAuthor
