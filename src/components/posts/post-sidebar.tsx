import React from "react"
import { Box, BoxProps, useColorModeValue, VStack } from "@chakra-ui/react"
import { Post } from "src/types/posts"
import useSession from "hooks/use-session"
import Like from "./like"
import Bookmark from "./bookmark"
import SvgButton from "components/svg-button"
import { useRouter } from "next/router"
import { ReserveUrls } from "src/data/reserve-urls"

interface Props {
    post: Post
    vertical?: boolean
}

export const PostSidebar = (props: Props) => {
    const {post,vertical = true} = props
    const session = useSession()
    const router = useRouter()
    return (
        <VStack alignItems="left" pos="fixed" display={{ base: "none", md: 'flex' }} width={["100%", "100%", "15%", "15%"]}>
            <Box>
                <Like count={post.likes} storyID={post.id} liked={post.liked} fontSize="24px" />
            </Box>
            <Box>
                <Box mt="6">
                    <Bookmark height="1.7rem" storyID={post.id} bookmarked={post.bookmarked} />
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

                {post.creatorId === session?.user.id && <Box mt="4">
                    <SvgButton
                        aria-label="go to github"
                        variant="ghost"
                        layerStyle="textSecondary"
                        _focus={null}
                        fontWeight="300"
                        onClick={() => router.push(`${ReserveUrls.Editor}/post/${post.id}`)}
                        icon="edit"
                    />
                </Box>}
            </Box>
        </VStack>
    )
}

export default PostSidebar
