import React from "react"
import {chakra, Heading, Image, Text, HStack,Button, Flex,PropsOf, Box, Tooltip, Tag as ChakraTag, useColorModeValue} from "@chakra-ui/react"
import { Tag } from "src/types/tag"
import { ReserveUrls } from "src/data/reserve-urls"
import NextLink from "next/link"

type Props = PropsOf<typeof chakra.div> & {
    tag: Tag
}


export const SimpleTagCard= (props:Props) =>{
    const {tag} = props
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
        </Flex>  
    )
} 

export default SimpleTagCard
