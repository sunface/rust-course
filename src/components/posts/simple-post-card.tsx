import React from "react"
import { Box, chakra, Flex, Heading, HStack, Image, Text, useMediaQuery, VStack } from "@chakra-ui/react"
import { Post } from "src/types/posts"
import PostAuthor from "./post-author"
import Link from "next/link"
import UnicornLike from "./like"
import { FaHeart, FaRegBookmark, FaRegComment, FaRegHeart } from "react-icons/fa"
import SvgButton from "components/svg-button"
import Bookmark from "./bookmark"

interface Props {
    post: Post
    size?: 'md' | 'sm'
}


export const SimplePostCard = (props: Props) => {
    const { post,size='md' } = props
    const [isLargeScreen] = useMediaQuery("(min-width: 768px)")
    const Layout = isLargeScreen ? HStack : VStack
    return (
        <VStack alignItems="left" spacing="0">
            <Link href={`/${post.creator.username}/${post.id}`}><Heading pb="2" size="sm" cursor="pointer">{post.title}</Heading></Link>
            <HStack pl="1" spacing="5" fontSize={size==='md'? '1rem' : ".9rem"}>
                <Link href={`/${post.creator.username}`}><Text cursor="pointer">{post.creator.nickname}</Text></Link>
                
                <HStack opacity="0.9">
                    {post.liked ?
                        <Box color="red.400"><FaHeart fontSize="1.1rem" /></Box>
                        :
                        <FaRegHeart fontSize="1.1rem" />}
                    <Text ml="2">{post.likes}</Text>
                </HStack>
                        
                <Link href={`/${post.creator.username}/${post.id}#comments`}>
                    <HStack opacity="0.9" cursor="pointer">
                        <FaRegComment fontSize="1.1rem" />
                        <Text ml="2">{post.comments}</Text>
                    </HStack>
                </Link>



                <Box style={{marginLeft: '4px'}}><Bookmark storyID={post.id} bookmarked={post.bookmarked} height=".95rem"/></Box>
            </HStack>
        </VStack>
    )
}

export default SimplePostCard
