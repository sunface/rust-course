import React from "react"
import { Box, Flex, Heading, HStack, Image, Tag, Text, useMediaQuery, VStack, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button } from "@chakra-ui/react"
import { Story } from "src/types/story"
import StoryAuthor from "./story-author"
import Link from "next/link"
import Like from "../interaction/like"
import Bookmark from "./bookmark"
import { getSvgIcon } from "components/svg-icon"
import Count from "components/count"
import Highlighter from 'react-highlight-words';
import { IDType } from "src/types/id"
import { getCommentsUrl, getStoryUrl } from "utils/story"

interface Props {
    story: Story
    type?: string
    highlight?: string
    showOrg?: boolean
    onRemove?: any
}


export const StoryCard = (props: Props) => {
    const { story, type = "classic" } = props
    const [isLargeScreen] = useMediaQuery("(min-width: 768px)")
    const Layout = isLargeScreen ? HStack : VStack

    const [isOpen, setIsOpen] = React.useState(false)
    const onClose = () => setIsOpen(false)
    const cancelRef = React.useRef()

    return (
        <>
            <VStack alignItems="left" spacing={type === "classic" ? 4 : 2} p="2">
                <Flex justifyContent="space-between" alignItems="center">
                    <StoryAuthor story={story} showFooter={false} size="md" showOrg={props.showOrg} />
                    {props.onRemove && <Box cursor="pointer" onClick={() => setIsOpen(true)}>{getSvgIcon("close", "1.1rem")}</Box>}
                </Flex>
                <a href={getStoryUrl(story)} target="_blank">
                    <Layout alignItems={isLargeScreen ? "top" : "left"} cursor="pointer" pl="2" pt="1">
                        <VStack alignItems="left" spacing={type === "classic" ? 3 : 2} width={isLargeScreen && type === "classic" ? "calc(100% - 15rem)" : '100%'}>
                            <Heading size="md" fontSize={type === "classic" ? '1.3rem' : '1.2rem'}>
                                <Highlighter
                                    highlightClassName="highlight-search-match"
                                    textToHighlight={story.title}
                                    searchWords={[props.highlight]}
                                />
                                {story.type === IDType.Series && <Tag size="sm" ml="2" mt="2px">SERIES</Tag>}
                                {story.pinned && <Tag size="sm" ml="2" mt="2px">置顶</Tag>}
                            </Heading>



                            {type !== "classic" && <HStack>{story.rawTags.map(t => <Text layerStyle="textSecondary" fontSize="md">#{t.name}</Text>)}</HStack>}
                            <Text layerStyle={type === "classic" ? "textSecondary" : null}>
                                <Highlighter
                                    highlightClassName="highlight-search-match"
                                    textToHighlight={story.brief}
                                    searchWords={[props.highlight]}
                                /></Text>
                        </VStack>
                        {story.cover && type === "classic" && <Image src={story.cover} width="15rem" height="120px" pt={isLargeScreen ? 0 : 2} borderRadius="4px" />}
                    </Layout>
                </a>

                <HStack pl="2" spacing="5">
                    <Like storyID={story.id} liked={story.liked} count={story.likes} fontSize="18px" />
                    <a href={`${getCommentsUrl(story)}#comments`} target="_blank">
                        <HStack opacity="0.9" cursor="pointer">
                            {getSvgIcon("comments", "1.3rem")}
                            <Text ml="2"><Count count={story.comments} /></Text>
                        </HStack>
                    </a>



                    <Box style={{ marginLeft: '4px' }}><Bookmark height="1.05rem" storyID={story.id} bookmarked={story.bookmarked} /></Box>
                </HStack>
            </VStack>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            移除 -  {story.title}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={() => {setIsOpen(false);props.onRemove(story.id)}} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}

export default StoryCard
