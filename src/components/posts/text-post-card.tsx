import React from "react"
import {chakra, Heading, VStack, Text, HStack,Button, Flex,PropsOf, Tag } from "@chakra-ui/react"
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

    const gap = moment(post.created).fromNow()
    return (
        <Flex justifyContent="space-between"  {...rest}>
            <VStack alignItems="left" as="a" href={post.url ? post.url : `/${post.creator.username}/${post.slug}`}>
                <Heading size="sm" display="flex" alignItems="center">
                    {post.url ? <Tag size="sm" mr="2">外部</Tag> : <Tag size="sm" mr="2">原创</Tag>}
                    {post.title}
                </Heading>
                <Text fontSize=".9rem">发布于{gap}</Text>
            </VStack>
            {props.showActions && <HStack>
                <Button size="sm" colorScheme="teal" variant="outline" onClick={onEdit}>Edit</Button>
                <Button size="sm" onClick={props.onDelete}>Delete</Button>
            </HStack>}
        </Flex>  
    )
} 

export default TextPostCard
