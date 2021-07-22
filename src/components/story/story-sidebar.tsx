import React from "react"
import { Box, BoxProps, IconButton, useColorModeValue, VStack } from "@chakra-ui/react"
import { Story, StoryStatus } from "src/types/story"
import useSession from "hooks/use-session"
import Like from "../interaction/like"
import Bookmark from "./bookmark"
import SvgButton from "components/svg-button"
import { useRouter } from "next/router"
import { ReserveUrls } from "src/data/reserve-urls"
import { IDType } from "src/types/id"
import { isAdmin } from "utils/role"
import { getSvgIcon } from "components/svg-icon"
import { FaBan } from "react-icons/fa"
import { requestApi } from "utils/axios/request"
import Forbidden from "./forbidden"

interface Props {
    story: Story
    vertical?: boolean
}

export const StorySidebar = (props: Props) => {
    const {story,vertical = true} = props
    const {session} = useSession()
    const router = useRouter()
    const getEditUrl = () => {
        if (story.type === IDType.Post) {
            return `${ReserveUrls.Editor}/post/${story.id}`
        }

        if (story.type === IDType.Series) {
            return `${ReserveUrls.Editor}/series`
        }

        return ''
    }



    return (
        <VStack alignItems="left" pos="fixed" display={{ base: "none", md: 'flex' }} width={["100%", "100%", "15%", "15%"]}>
            <Box>
                <Like count={story.likes} storyID={story.id} liked={story.liked} fontSize="24px" />
            </Box>
            <Box>
                <Box mt="6">
                    <Bookmark height="1.7rem" storyID={story.id} bookmarked={story.bookmarked} />
                </Box>
                <Box mt="4">
                    <SvgButton
                        aria-label="go to github"
                        variant="ghost"
                        layerStyle="textSecondary"
                        _focus={null}
                        fontWeight="300"
                        icon="share"
                        onClick={() => location.href = "#comments"}
                    />
                </Box>

                {story.creatorId === session?.user.id && <Box mt="4">
                    <SvgButton
                        aria-label="go to github"
                        variant="ghost"
                        layerStyle="textSecondary"
                        _focus={null}
                        fontWeight="300"
                        onClick={() => router.push(getEditUrl())}
                        icon="edit"
                    />
                </Box>}

                {isAdmin(session?.user.role) && <Box mt="4">
                    <Forbidden story={story} />
                </Box>}
            </Box>
        </VStack>
    )
}

export default StorySidebar
