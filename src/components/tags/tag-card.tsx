import React from "react"
import {chakra, Heading, Image, Text, HStack,Button, Flex,PropsOf, Box, Tooltip, Tag as ChakraTag, useColorModeValue} from "@chakra-ui/react"
import { Tag } from "src/types/tag"
import { ReserveUrls } from "src/data/reserve-urls"
import NextLink from "next/link"
import userCustomTheme from "theme/user-custom"
import Count from "components/count"
import { requestApi } from "utils/axios/request"

type Props = PropsOf<typeof chakra.div> & {
    tag: Tag
    showActions?: boolean
    onEdit?: any
    onModerator?: any
    unit?: string
}


export const TagCard= (props:Props) =>{
    const {tag,showActions=false,onEdit,onModerator,unit="posts"} = props
    return (
        <Flex justifyContent="space-between" alignItems="center" className="hover-bg" p="2">
                <NextLink href={`${ReserveUrls.Tags}/${tag.name}`}>
                    <HStack cursor="pointer">
                        <Image src={tag.icon} width="43px" mr="2" borderWidth="1px" className="bordered"/>
                        <Box>
                            <Heading size="sm">{tag.title}</Heading>
                            <Tooltip openDelay={300} label={tag.md}><Text layerStyle="textSecondary" fontSize=".85rem" mt="1" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" width={["100px","100px","200px","300px"]}>{tag.md}</Text></Tooltip>
                        </Box>
                    </HStack>
                </NextLink>
            {showActions ? 
            <HStack>
                <Button size="sm" colorScheme="teal" variant="outline" onClick={onEdit}>Edit</Button>
                <Button size="sm" colorScheme="purple" onClick={onModerator} variant="outline">Moderators</Button>
            </HStack> : 
            <ChakraTag py="1" px="3"  colorScheme="cyan"><Count count={unit === 'posts' ? tag.posts : tag.follows} />&nbsp;{unit}</ChakraTag>
            }
        </Flex>  
    )
} 

export default TagCard
