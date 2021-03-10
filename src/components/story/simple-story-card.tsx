import React from "react"
import { Box, Heading, HStack, Text, useMediaQuery, VStack } from "@chakra-ui/react"
import { Story } from "src/types/story"
import Link from "next/link"
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa"
import Bookmark from "./bookmark"
import { getCommentsUrl, getStoryUrl } from "utils/story"
import Like from "components/interaction/like"
import { getSvgIcon } from "components/svg-icon"

interface Props {
    story: Story
    size?: 'md' | 'sm'
}


export const SimpleStoryCard = (props: Props) => {
    const { story,size='md' } = props
    const [isLargeScreen] = useMediaQuery("(min-width: 768px)")
    const Layout = isLargeScreen ? HStack : VStack
    return (
        <VStack alignItems="left" spacing="0">
            <Link href={getStoryUrl(story)}><Heading pb="2" fontSize=".9rem" cursor="pointer">{story.title}</Heading></Link>
            <HStack pl="1" spacing="5" fontSize={size==='md'? '1rem' : ".9rem"}>
                <Link href={`/${story.creator.username}`}><Text cursor="pointer">{story.creator.nickname}</Text></Link>
                
                <HStack opacity="0.9">
                    <Like liked={story.liked} count={story.likes} storyID={story.id} fontSize="1rem"/>
                </HStack>
                        
                <a href={`${getCommentsUrl(story)}#comments`}>
                    <HStack opacity="0.9" cursor="pointer">
                        {getSvgIcon("comments", "1rem")}
                        <Text ml="2">{story.comments}</Text>
                    </HStack>
                </a>

                <Box style={{marginLeft: '4px'}}><Bookmark storyID={story.id} bookmarked={story.bookmarked} height=".9rem"/></Box>
            </HStack>
        </VStack>
    )
}

export default SimpleStoryCard
