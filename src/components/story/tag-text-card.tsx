import React from "react"
import {Box, Heading, Image, Text, HStack,Button, Flex,PropsOf,Link} from "@chakra-ui/react"
import { Tag } from "src/types/tag"
import { ReserveUrls } from "src/data/reserve-urls"
import NextLink from "next/link"
import { useRouter } from "next/router"

interface Props {
    tag: Tag
}


export const TagTextCard = (props:Props) =>{
    const {tag} = props
    const router = useRouter()
    return (
        <Button variant="outline"  onClick={() => router.push(`/tags/${tag.name}`)}>#{tag.name}</Button>
    )
} 

export default TagTextCard
