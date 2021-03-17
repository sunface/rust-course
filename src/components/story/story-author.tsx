import React from "react"
import {chakra, Heading, Image, Text, HStack,Button, Flex,PropsOf,Box, Avatar, VStack, propNames} from "@chakra-ui/react"
import { Tag } from "src/types/tag"
import { ReserveUrls } from "src/data/reserve-urls"
import NextLink from "next/link"
import { Story } from "src/types/story"
import moment from 'moment'
import { FaGithub } from "react-icons/fa"
import Link from "next/link"
import { useRouter } from "next/router"

type Props = PropsOf<typeof chakra.div> & {
    size?: 'lg' | 'md'
    story : Story
    showFooter?: boolean
}

export const StoryAuthor= ({story,showFooter=true,size='lg'}:Props) =>{
    const router = useRouter()
    return (
            <HStack spacing="4">
                <Avatar src={story.creator.avatar} size={size} onClick={() => router.push(`/${story.creator.username}`)} cursor="pointer"/>
                <VStack alignItems="left" spacing="1">
                    {story.ownerId ? 
                        <HStack spacing={size==='lg'?2:1}>
                            <Link href={`/${story.creator.username}`}><Text cursor="pointer">{story.creator.nickname}</Text></Link>
                            <Text layerStyle="textSecondary">for</Text>
                            <Link href={`/${story.owner.username}`}><Text cursor="pointer">{story.owner.nickname}</Text></Link>
                        </HStack> : 
                        <Heading size="sm" onClick={() => router.push(`/${story.creator.username}`)} cursor="pointer">{story.creator.nickname === "" ? story.creator.username : story.creator.nickname}</Heading>}
                    <Text layerStyle="textSecondary" fontSize={size==='lg' ? ".9rem" : ".8rem"}><chakra.span fontWeight="600">{moment(story.created).fromNow()}</chakra.span></Text>
                    {showFooter && <HStack layerStyle="textSecondary" fontSize=".9rem" spacing="3">
                        <FaGithub />  <chakra.span>4 min read</chakra.span>
                    </HStack>}
                </VStack>
            </HStack>
    )
} 

export default StoryAuthor
