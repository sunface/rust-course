import React from "react"
import { Box, Center, Text, useColorModeValue, VStack } from "@chakra-ui/react"
import { Story } from "src/types/story"
import StoryCard from "./story-card"
import userCustomTheme from "theme/user-custom"

interface Props {
    stories: Story[]
    card?: any
    size?: 'sm' | 'md'
    showFooter?: boolean
    showPinned?: boolean
    type?: string
    highlight?: string
}


export const Stroies = (props: Props) => {
    const { stories,card=StoryCard,showFooter=true,type="classic",showPinned = false} = props
    const borderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)
    const Card = card
    const showBorder = i => {
        if (i < stories.length -1) {
            return true
        }

        if (showFooter) {
            return true 
        } else {
            return false
        }
    }
    return (
        <>
            <VStack alignItems="left">
                {stories.map((story,i) =>
                    <Box py="2" borderBottom={showBorder(i)? `1px solid ${borderColor}`:null} key={story.id} px="1">
                        <Card story={story} size={props.size} type={type} highlight={props.highlight} showPinned={showPinned}/>
                    </Box>)}
            </VStack>
            {showFooter && <Center><Text layerStyle="textSecondary" fontSize="sm" py="4">没有更多文章了</Text></Center>}
        </>
    )
}

export default Stroies
