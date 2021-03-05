import React from "react"
import {chakra, Heading, VStack, Text, HStack,Button, Flex,PropsOf, Tag, useMediaQuery } from "@chakra-ui/react"
import { Post } from "src/types/posts"
import moment from 'moment'

type Props = PropsOf<typeof chakra.div> & {
    post: Post
    showActions: boolean
    onEdit?: any
    onDelete?: any
}


export const TextPostCard= (props:Props) =>{
    const {post,showActions,onEdit,onDelete, ...rest} = props

    const [isSmallScreen] = useMediaQuery("(max-width: 768px)")
    const Lay = isSmallScreen ? VStack : Flex
    const gap = moment(post.created).fromNow()
    return (
        //@ts-ignore
        <Lay justifyContent="space-between" alignItems={isSmallScreen? "left" : "center"}  {...rest}>
            <VStack alignItems="left" as="a" href={post.url ? post.url : `/${post.creator.username}/${post.id}`} spacing={{base: 4, md: 2}}>
                <Heading size="sm" display="flex" alignItems="center">
                    {post.url ? <Tag size="sm" mr="2">外部</Tag> : <Tag size="sm" mr="2">原创</Tag>}
                    {post.title}
                </Heading>
                <Text fontSize=".9rem">发布于{gap}</Text>
            </VStack>
            {props.showActions && <HStack pt={{base: 3, md: 0}}>
                <Button size="sm" colorScheme="teal" variant="outline" onClick={onEdit}>Edit</Button>
                <Button size="sm" onClick={props.onDelete} variant="ghost">Delete</Button>
            </HStack>}
        </Lay>  
    )
} 

export default TextPostCard
