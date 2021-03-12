import React from "react"
import { chakra, Heading, VStack, Text, HStack, Button, Flex, PropsOf, Tag, useMediaQuery, IconButton, Tooltip } from "@chakra-ui/react"
import { Story } from "src/types/story"
import moment from 'moment'
import { IDType } from "src/types/id"
import { getStoryUrl } from "utils/story"
import { FaPaperclip, FaRegTrashAlt, FaTrash } from "react-icons/fa"
import { getSvgIcon } from "components/svg-icon"

type Props = PropsOf<typeof chakra.div> & {
    story: Story
    showActions: boolean
    onEdit?: any
    onDelete?: any
    onPin?: any
    showSource?: boolean
}


export const TextStoryCard = (props: Props) => {
    const { story, showActions, onEdit, onDelete, showSource = true,onPin, ...rest } = props
    const [isSmallScreen] = useMediaQuery("(max-width: 768px)")
    const Lay = isSmallScreen ? VStack : Flex
    const gap = moment(story.created).fromNow()

    
    return (
        //@ts-ignore
        <Lay justifyContent="space-between" alignItems={isSmallScreen ? "left" : "center"}  {...rest}>
            <VStack alignItems="left" as="a" href={getStoryUrl(story)} spacing={{ base: 4, md: 2 }}>
                <Heading size="sm" display="flex" alignItems="center">
                    {showSource && <> {story.url ? <Tag size="sm" mr="2">外部</Tag> : <Tag size="sm" mr="2">原创</Tag>}</>}
                    {story.title ? story.title : 'No Title'}
                </Heading>
                <Text fontSize=".9rem">发布于{gap}</Text>
            </VStack>
            {props.showActions && <HStack pt={{ base: 3, md: 0 }} layerStyle="textSecondary">
                <Tooltip label={story.pinned? "取消置顶" : "置顶"}>
                    <IconButton
                        aria-label="a icon button"
                        variant="ghost"
                        _focus={null}
                        icon={<FaPaperclip />}
                        onClick={onPin}
                        color={story.pinned? "teal" : null}
                    />
                </Tooltip>

                <Tooltip label="编辑">
                    <IconButton
                        aria-label="a icon button"
                        variant="ghost"
                        _focus={null}
                        icon={getSvgIcon("edit", "1rem")}
                        onClick={onEdit}
                    />
                </Tooltip>

                <Tooltip label="删除">
                    <IconButton
                        aria-label="a icon button"
                        variant="ghost"
                        _focus={null}
                        icon={<FaRegTrashAlt />}
                        onClick={props.onDelete}
                    />
                </Tooltip>
            </HStack>}
        </Lay>
    )
}

export default TextStoryCard
