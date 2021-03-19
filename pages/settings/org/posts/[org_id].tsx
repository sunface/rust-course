import { Text, Box, VStack, Divider, useToast, Heading, Alert, Tag, Button, HStack, Modal, ModalOverlay, ModalContent, ModalBody, Select, useDisclosure, Flex } from "@chakra-ui/react"
import Card from "components/card"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { orgSettingLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import { useRouter } from "next/router"
import { User } from "src/types/user"
import UserCard from "components/users/user-card"
import { config } from "configs/config"
import OrgMember from "components/users/org-member"
import { Role } from "src/types/role"
import { cloneDeep } from "lodash"
import { Story } from "src/types/story"
import Empty from "components/empty"
import ManageStories from "components/story/manage-stories"
import { IDType } from "src/types/id"


const OrgPostsPage = () => {
    const [org, setOrg]:[User,any] = useState(null)
    const [posts,setPosts]:[Story[],any] = useState([])
    const router = useRouter()
    useEffect(() => {
        if (router.query.org_id) {
            getPosts()
            requestApi.get(`/user/info/${router.query.org_id}`).then(res => setOrg(res.data))
        }

    }, [router.query.org_id])

    const getPosts = async () => {
        const res = await requestApi.get(`/story/posts/org/${router.query.org_id}?type=${IDType.Post}`)
        setPosts(res.data)
    }
    const toast = useToast()
    
    const onDeletePost = async id => {
        await requestApi.delete(`/org/post/${router.query.org_id}/${id}`)
        getPosts()
    }

    const onPinPost = async id => {
        await requestApi.post(`/org/pin/story/${id}`)
    }

    return (
        <>
            <PageContainer>
                <Box display="flex">
                    <Sidebar routes={orgSettingLinks(router.query.org_id)} width={["120px", "120px", "250px", "250px"]} height="fit-content" title={`组织${org?.nickname}`} />
                    <Card ml="4" p="6" width="100%">
                        <Flex alignItems="center" justify="space-between">
                            <Heading size="md">文章列表({posts.length})</Heading>
                        </Flex>
                        {
                            posts.length === 0 ?
                               <Empty />
                                :
                                <Box mt="4">
                                <ManageStories showSource stories={posts}  onDelete={(id) => onDeletePost(id)}   onPin={(id) => onPinPost(id)}  />
                            </Box>
                        
                        }
                    </Card>
                </Box>
            </PageContainer>
        </>
    )
}
export default OrgPostsPage

