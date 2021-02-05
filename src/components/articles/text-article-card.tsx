import React from "react"
import {chakra, Heading, VStack, Text, HStack,Button, Flex,PropsOf } from "@chakra-ui/react"
import { Article } from "src/types/posts"
import moment from 'moment'
import { requestApi } from "utils/axios/request"

type Props = PropsOf<typeof chakra.div> & {
    article: Article
    showActions: boolean
    onEdit?: any
    onDelete?: any
}


export const TextArticleCard= (props:Props) =>{
    const {article,showActions,onEdit,onDelete, ...rest} = props

    const gap = moment(article.created).fromNow()
    const onDeleteArticle = async () => {
        await requestApi.delete(`/editor/article/${article.id}`)
        onDelete()
    } 
    return (
        <Flex justifyContent="space-between"  {...rest}>
            <VStack>
                <Heading size="sm">{props.article.title}</Heading>
                <Text fontSize=".9rem">{gap}</Text>
            </VStack>
            {props.showActions && <HStack>
                <Button size="sm" colorScheme="teal" variant="outline" onClick={onEdit}>Edit</Button>
                <Button size="sm" onClick={onDeleteArticle}>Delete</Button>
            </HStack>}
        </Flex>  
    )
} 

export default TextArticleCard
