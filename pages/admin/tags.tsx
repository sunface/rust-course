import {Text, Box, Heading, Image,  Center, Button, Flex,  VStack, Divider, useToast } from "@chakra-ui/react"
import Card from "components/card"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import {adminLinks} from "src/data/links"
import { requestApi } from "utils/axios/request"
import TagCard from "components/posts/tag-edit-card"
import { Post } from "src/types/posts"
import { useRouter } from "next/router"
import Link from "next/link"
import { ReserveUrls } from "src/data/reserve-urls"
import { Tag } from "src/types/tag"
import { route } from "next/dist/next-server/server/router"
import PageContainer1 from "layouts/page-container1"


const PostsPage = () => {
    const [tags, setTags] = useState([])
    const router = useRouter()
    const toast = useToast()
    const getTags = () => {
        requestApi.get(`/tags`).then((res) => setTags(res.data)).catch(_ => setTags([]))
    }

    useEffect(() => {
        getTags()
    }, [])

    const editTag = (tag: Tag) => {
        router.push(`${ReserveUrls.Admin}/tag/${tag.name}`)
    }

    const deleteTag= async (id) => {
        await requestApi.delete(`/admin/tag/${id}`)
        getTags()
        toast({
            description: "删除成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
    }

    return (
        <>
            <PageContainer1>
                <Box display="flex">
                    <Sidebar routes={adminLinks} title="管理员" />
                    <Card ml="4" p="6" width="100%">
                        <Flex alignItems="center" justify="space-between">
                            <Heading size="md">标签列表({tags.length})</Heading>
                            <Button colorScheme="teal" size="sm" _focus={null}><Link href={`${ReserveUrls.Admin}/tag/new`}>新建标签</Link></Button>
                        </Flex>
                        {
                            tags.length === 0 ?
                                <>
                                    <Center mt="4">
                                        <Image height="25rem" src="/empty-posts.png" />
                                    </Center>
                                    <Center mt="8">
                                        <Heading size="sm">你还没创建任何标签</Heading>
                                    </Center>
                                </>
                                :
                                <>
                                    <VStack mt="4">
                                        {tags.map(tag =>
                                            <Box width="100%" key={tag.id}>
                                                <TagCard tag={tag} showActions={true} mt="4" onEdit={() => editTag(tag)} onDelete={() => deleteTag(tag.id)} />
                                                <Divider mt="5" />
                                            </Box>
                                        )}
                                    </VStack>
                                    <Center><Text layerStyle="textSecondary" fontSize="sm" mt="5">没有更多标签了</Text></Center>
                                </>
                        }
                    </Card>
                </Box>
            </PageContainer1>
        </>
    )
}
export default PostsPage

