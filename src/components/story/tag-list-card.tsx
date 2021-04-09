import React from "react"
import {Box, Heading, Image, Text, HStack,Button, Flex,PropsOf,Link} from "@chakra-ui/react"
import { Tag } from "src/types/tag"
import { ReserveUrls } from "src/data/reserve-urls"
import NextLink from "next/link"

interface Props {
    tag: Tag
}


export const TagListCard= (props:Props) =>{
    const {tag} = props

    return (
        <Flex justifyContent="space-between">
            <Box>
                <Heading size="sm" display="flex" alignItems="center" cursor="pointer">
                    {tag.title}
                </Heading>
                <Text layerStyle="textSecondary" fontSize=".9rem" mt="1" fontWeight="450">{tag.posts} posts</Text>
            </Box>
            <Image src={tag.icon} width="35px" height="35px" />
        </Flex>  
    )
} 

export default TagListCard
