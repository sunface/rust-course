import {Text, Box, Heading, Image,  Center, Button, Flex,  VStack, Divider, useToast, Wrap, WrapItem, useColorModeValue, StackDivider } from "@chakra-ui/react"
import Card from "components/card"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import {dashboardLinks} from "src/data/links"
import { requestApi } from "utils/axios/request"
import PageContainer1 from "layouts/page-container1"
import Empty from "components/empty"
import { IDType } from "src/types/id"
import UserCard from "components/users/user-card"
import userCustomTheme from "theme/user-custom"
import TagCard from "components/tags/tag-card"
import SimpleTagCard from "components/tags/simple-tag-card"


const FollowersPage = () => {
    const [tags, setTags] = useState([])
    const borderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)

    const getTags = async () => {
        const res = await requestApi.get(`/tag/list/byUserModeratorRole`)
        console.log(res)
        setTags(res.data)
    }

    useEffect(() => {
        getTags()
    }, [])

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
                                                <SimpleTagCard tag={tag}  mt="4" />
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
export default FollowersPage


