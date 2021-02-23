import React from "react"
import {chakra, Heading, Image, Text, HStack,Button, Flex,PropsOf,Link} from "@chakra-ui/react"
import { Tag } from "src/types/tag"
import { ReserveUrls } from "src/data/reserve-urls"
import NextLink from "next/link"

type Props = PropsOf<typeof chakra.div> & {
    tag: Tag
    showActions: boolean
    onEdit?: any
    onDelete?: any
}


export const TagCard= (props:Props) =>{
    const {tag,showActions,onEdit,onDelete, ...rest} = props

    return (
        <Flex justifyContent="space-between"  {...rest}>
                <NextLink href={`${ReserveUrls.Tags}/${tag.name}`}>
                    <Heading size="sm" display="flex" alignItems="center" cursor="pointer">
                        <Image src={tag.icon} width="43px" mr="2"/>
                        {tag.title}
                    </Heading>
                </NextLink>
            {props.showActions && <HStack>
                <Button size="sm" colorScheme="teal" variant="outline" onClick={onEdit}>Edit</Button>
                <Button size="sm" onClick={props.onDelete} variant="ghost">Delete</Button>
            </HStack>}
        </Flex>  
    )
} 

export default TagCard
