import { Text, Box, Heading, Image, Center, Flex, VStack, Divider, useToast } from "@chakra-ui/react"
import Card from "components/card"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import {editorLinks} from "src/data/links"
import { requestApi } from "utils/axios/request"
import { Story } from "src/types/story"
import { useRouter } from "next/router"
import PageContainer1 from "layouts/page-container1"
import Empty from "components/empty"
import TextStoryCard from "components/story/manage-story-card"
import ManageStories from "components/story/manage-stories"

const PostsPage = () => {
    const [posts, setPosts] = useState([])
    const router = useRouter()
    const toast = useToast()
    const getPosts = () => {
        requestApi.get(`/story/posts/drafts`).then((res) => setPosts(res.data)).catch(_ => setPosts([]))
    }

    useEffect(() => {
        getPosts()
    }, [])

    const editPost = (post: Story) => {
            router.push(`/editor/post/${post.id}`)
    }

    const onDeletePost= async (id) => {
        await requestApi.delete(`/story/post/${id}`)
        getPosts()
        toast({
            description: "删除成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
    }

    return (
        <>
            <PageContainer1 >
                <Box display="flex">
                    <Sidebar routes={editorLinks}   title="创作中心"/>
                    <Card ml="4" p="6" width="100%">
                        <Flex alignItems="center" justify="space-between">
                            <Heading size="md">草稿列表({posts.length})</Heading>
                        </Flex>
                        {
                            posts.length === 0 ?
                               <Empty />
                                :
                                <Box mt="4">
                                <ManageStories showSource stories={posts} onEdit={(story) => editPost(story)} onDelete={(id) => onDeletePost(id)}  />
                            </Box>
                        
                        }
                    </Card>
                </Box>
            </PageContainer1>
        </>
    )
}
export default PostsPage

