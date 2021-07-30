import {Text, Box,  Center, Button, Flex,  VStack, Divider, useColorModeValue } from "@chakra-ui/react"
import Card from "components/card"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import {dashboardLinks} from "src/data/links"
import { requestApi } from "utils/axios/request"
import PageContainer1 from "layouts/page-container1"
import Empty from "components/empty"
import userCustomTheme from "theme/user-custom"
import SimpleTagCard from "components/tags/simple-tag-card"
import { Story } from "src/types/story"
import { Tag } from "src/types/tag"


const TagModeratorPage = () => {
    const [tags, setTags] = useState([])
    const [stories,setStories]:[Story[],any] = useState([])
    const [tag,setTag]:[Tag,any] = useState(null)
    
    const getTags = async () => {
        const res = await requestApi.get(`/tag/list/byUserModeratorRole`)
        setTags(res.data)
    }

    useEffect(() => {
        getTags()
    }, [])

    const displayDisabledStories = async (tag:Tag) => {
        setTag(tag)
        const res = await requestApi.get(`/tag/disalbedStories/${tag.id}`)
        setStories(res.data)
    }

    return (
        <>
            <PageContainer1>
                <Box display="flex">
                    <Sidebar routes={dashboardLinks} title="dashboard" />
                    <Card ml="4" p="6" width="100%">
                        <Text fontSize=".95rem" fontWeight="600">You are a moderator of these tags, you can modify the tag and manage the posts.</Text>
                        <Divider my="6" />
                    {
                            tags.length === 0 ?
                                <Empty />
                                :
                                <>
                                    <VStack mt="4">
                                        {tags.map(tag =>
                                            <Box width="100%" key={tag.id}>
                                                <Flex justifyContent="space-between" alignItems="center">
                                                    <SimpleTagCard tag={tag}  mt="4" />
                                                    <Button colorScheme="teal" variant="outline" onClick={() => displayDisabledStories(tag)}>Disabled stories</Button>
                                                </Flex>
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
export default TagModeratorPage


