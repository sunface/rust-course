import React from "react"
import { Box, Center, Text, useColorModeValue, VStack } from "@chakra-ui/react"
import { Post } from "src/types/posts"
import PostCard from "./post-card"
import userCustomTheme from "theme/user-custom"

interface Props {
    posts: Post[]
    card?: any
    size?: 'sm' | 'md'
    showFooter?: boolean
}


export const Posts = (props: Props) => {
    const { posts,card=PostCard,showFooter=true} = props
    const postBorderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)
    const Card = card
    return (
        <>
            <VStack alignItems="left">
                {posts.map(post =>
                    <Box py="4" borderBottom={`1px solid ${postBorderColor}`} key={post.id}>
                        <Card post={post} size={props.size}/>
                    </Box>)}
            </VStack>
            {showFooter && <Center><Text layerStyle="textSecondary" fontSize="sm" py="4">没有更多文章了</Text></Center>}
        </>
    )
}

export default Posts
