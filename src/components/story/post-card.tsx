import React from "react"
import { Box, chakra, Flex, Heading, HStack, Image, Text, useMediaQuery, VStack } from "@chakra-ui/react"
import { Post } from "src/types/posts"
import PostAuthor from "./post-author"
import Link from "next/link"
import Like from "../interaction/like"
import { FaHeart, FaRegHeart } from "react-icons/fa"
import Bookmark from "./bookmark"
import { getSvgIcon } from "components/svg-icon"
import Count from "components/count"

interface Props {
    post: Post
}


export const PostCard = (props: Props) => {
    const { post } = props
    const [isLargeScreen] = useMediaQuery("(min-width: 768px)")
    const Layout = isLargeScreen ? HStack : VStack
    return (
        <VStack alignItems="left" spacing="4" p="2">
            <PostAuthor post={post} showFooter={false} size="md" />
            <Link href={`/${post.creator.username}/${post.id}`}>
                <Layout alignItems={isLargeScreen ? "top" : "left"} cursor="pointer" pl="2" pt="1">
                    <VStack alignItems="left" spacing="3" width={isLargeScreen ? "calc(100% - 18rem)" : '100%'}>
                        <Heading size="md">{post.title}</Heading>
                        <Text layerStyle="textSecondary" maxW="400px">{post.brief}</Text>
                    </VStack>
                    {post.cover && <Image src={post.cover} width="18rem" height="120px" pt={isLargeScreen ? 0 : 2} borderRadius="4px" />}
                </Layout>
            </Link>

            <HStack pl="2" spacing="5">
                <Like storyID={post.id} liked={post.liked} count={post.likes} fontSize="18px"/>
                <Link href={`/${post.creator.username}/${post.id}#comments`}>
                    <HStack opacity="0.9" cursor="pointer">
                        {getSvgIcon("comments", "1.3rem")}
                        <Text ml="2"><Count count={post.comments}/></Text>
                    </HStack>
                </Link>



                <Box style={{ marginLeft: '4px' }}><Bookmark height="1.05rem" storyID={post.id} bookmarked={post.bookmarked} /></Box>
            </HStack>
        </VStack>
    )
}

export default PostCard
