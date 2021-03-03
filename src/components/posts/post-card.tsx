import React from "react"
import { Box, chakra, Flex, Heading, HStack, Image, Text, useMediaQuery, VStack } from "@chakra-ui/react"
import { Post } from "src/types/posts"
import PostAuthor from "./post-author"
import Link from "next/link"
import UnicornLike from "./heart-like"
import { FaHeart, FaRegBookmark, FaRegComment, FaRegHeart } from "react-icons/fa"
import SvgButton from "components/svg-button"

interface Props {
    post: Post
}


export const PostCard = (props: Props) => {
    const { post } = props
    const [isLargeScreen] = useMediaQuery("(min-width: 768px)")
    const Layout = isLargeScreen ? HStack : VStack
    return (
        <VStack alignItems="left" spacing="4" p="1">
            <PostAuthor post={post} showFooter={false} size="md" />
            <Link href={`/${post.creator.username}/${post.id}`}>
                <Layout alignItems={isLargeScreen ? "top" : "left"} cursor="pointer" pl="2" pt="1">
                    <VStack alignItems="left" spacing="3" width={isLargeScreen ? "calc(100% - 18rem)" : '100%'}>
                        <Heading size="md">{post.title}</Heading>
                        <Text layerStyle="textSecondary">{post.brief}</Text>
                    </VStack>
                    {post.cover && <Image src={post.cover} width="18rem" height="120px" pt={isLargeScreen ? 0 : 2} borderRadius="4px" />}
                </Layout>
            </Link>

            <HStack pl="2" spacing="5">
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



                <SvgButton icon="bookmark" height="1rem" onClick={null} style={{marginLeft: '4px'}}/>
            </HStack>
        </VStack>
    )
}

export default PostCard
