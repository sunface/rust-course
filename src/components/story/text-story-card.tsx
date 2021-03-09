import React from "react"
import {chakra, Heading, VStack, Text, HStack,Button, Flex,PropsOf, Tag, useMediaQuery } from "@chakra-ui/react"
import { Story } from "src/types/story"
import moment from 'moment'
import { IDType } from "src/types/id"
import { getStoryUrl } from "utils/story"

type Props = PropsOf<typeof chakra.div> & {
    story: Story
    showActions: boolean
    onEdit?: any
    onDelete?: any
    showSource?: boolean
}


export const TextStoryCard= (props:Props) =>{
    const {story,showActions,onEdit,onDelete,showSource=true ,...rest} = props

    const [isSmallScreen] = useMediaQuery("(max-width: 768px)")
    const Lay = isSmallScreen ? VStack : Flex
    const gap = moment(story.created).fromNow()

    return (
        //@ts-ignore
        <Lay justifyContent="space-between" alignItems={isSmallScreen? "left" : "center"}  {...rest}>
            <VStack alignItems="left" as="a" href={story.url ?? getStoryUrl(story)} spacing={{base: 4, md: 2}}>
                <Heading size="sm" display="flex" alignItems="center">
                    {showSource && <> {story.url ? <Tag size="sm" mr="2">外部</Tag> : <Tag size="sm" mr="2">原创</Tag>}</>}
                    {story.title ?story.title : 'No Title'}
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

export default TextStoryCard
