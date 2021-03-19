import React from "react"
import { Box, Center, Text, useColorModeValue, VStack } from "@chakra-ui/react"
import { Story } from "src/types/story"
import StoryCard from "./story-card"
import userCustomTheme from "theme/user-custom"
import ManageStoryCard from "./manage-story-card"

interface Props {
    stories: Story[]
    showFooter?: boolean
    highlight?: string
    onEdit?: any
    onDelete?: any
    onPin?: any
    showSource?: boolean
}


export const ManageStories = (props: Props) => {
    const { stories,showFooter=true,showSource=false, ...rest} = props
    const borderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)
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
                    <Box py="3" borderBottom={showBorder(i)? `1px solid ${borderColor}`:null} key={story.id} px="1">
                        <ManageStoryCard showSource={showSource} story={story} highlight={props.highlight} {...rest}/>
                    </Box>)}
            </VStack>
            {showFooter && <Center><Text layerStyle="textSecondary" fontSize="sm" pt="5">没有更多文章了</Text></Center>}
        </>
    )
}

export default ManageStories
