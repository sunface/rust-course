import React from "react"
import {chakra, Heading, Image, Text, HStack,Button, Flex,PropsOf, Box, Tooltip, Tag as ChakraTag, useColorModeValue} from "@chakra-ui/react"
import { Tag } from "src/types/tag"
import { ReserveUrls } from "src/data/reserve-urls"
import NextLink from "next/link"
import userCustomTheme from "theme/user-custom"
import Count from "components/count"

type Props = PropsOf<typeof chakra.div> & {
    tag: Tag
    showActions?: boolean
    onEdit?: any
    onDelete?: any
}


export const TagCard= (props:Props) =>{
    const {tag,showActions=false,onEdit,onDelete} = props
    return (
        <Flex justifyContent="space-between" alignItems="center" className="hover-bg" p="2">
                <NextLink href={`${ReserveUrls.Tags}/${tag.name}`}>
                    <HStack cursor="pointer">
                        <Image src={tag.icon} width="43px" mr="2" borderWidth="1px" className="bordered"/>
                        <Box>
                            <Heading size="sm">{tag.title}</Heading>
                            <Tooltip openDelay={300} label={tag.md}><Text layerStyle="textSecondary" fontSize=".85rem" mt="1" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" width={{"sm": "100px","md":"400px"}}>{tag.md}</Text></Tooltip>
                        </Box>
                    </HStack>
                </NextLink>
            {showActions ? 
            <HStack>
                <Button size="sm" colorScheme="teal" variant="outline" onClick={onEdit}>Edit</Button>
                <Button size="sm" onClick={onDelete} variant="ghost">Delete</Button>
            </HStack> : 
            <ChakraTag py="1" px="3"  colorScheme="cyan"><Count count={tag.posts} />&nbsp;posts</ChakraTag>
            }
        </Flex>  
    )
} 

export default TagCard
