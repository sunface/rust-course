import React from "react"
import { Box, Heading, HStack, Text, useMediaQuery, VStack } from "@chakra-ui/react"
import { Story } from "src/types/story"
import Link from "next/link"
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa"
import Bookmark from "./bookmark"
import { getCommentsUrl, getStoryUrl } from "utils/story"

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
            <Link href={getStoryUrl(story)}><Heading pb="2" size="sm" cursor="pointer">{story.title}</Heading></Link>
            <HStack pl="1" spacing="5" fontSize={size==='md'? '1rem' : ".9rem"}>
                <Link href={`/${story.creator.username}`}><Text cursor="pointer">{story.creator.nickname}</Text></Link>
                
                <HStack opacity="0.9">
                    {story.liked ?
                        <Box color="red.400"><FaHeart fontSize="1.1rem" /></Box>
                        :
                        <FaRegHeart fontSize="1.1rem" />}
                    <Text ml="2">{story.likes}</Text>
                </HStack>
                        
                <a href={`${getCommentsUrl(story)}#comments`}>
                    <HStack opacity="0.9" cursor="pointer">
                        <FaRegComment fontSize="1.1rem" />
                        <Text ml="2">{story.comments}</Text>
                    </HStack>
                </a>



                <Box style={{marginLeft: '4px'}}><Bookmark storyID={story.id} bookmarked={story.bookmarked} height=".95rem"/></Box>
            </HStack>
        </VStack>
    )
}

export default SimpleStoryCard
