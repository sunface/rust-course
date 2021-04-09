import { Text, Box, Heading, Image, Center, Button, Flex, VStack, Divider, useToast, Wrap, WrapItem, useColorModeValue, StackDivider, HStack } from "@chakra-ui/react"
import Card from "components/card"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { dashboardLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import PageContainer1 from "layouts/page-container1"
import Empty from "components/empty"
import { IDType } from "src/types/id"
import UserCard from "components/users/user-card"
import userCustomTheme from "theme/user-custom"
import { Story } from "src/types/story"
import moment from 'moment'
import { FaComment, FaEye, FaHeart, FaRegComment, FaRegEye, FaRegHeart } from "react-icons/fa"
import Link from "next/link"

const DashboardPage = () => {
    const [stories, setStories]: [Story[], any] = useState([])
    const [totalLikes, setTotalLikes] = useState(0)
    const [totalViews, setTotalViews] = useState(0)
    const [totalComments, setTotalComments] = useState(0)
    const borderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)

    const getStories = async () => {
        const res = await requestApi.get(`/story/posts/dashboard`)
        setStories(res.data)

        let likes = 0
        let views = 0
        let comments = 0

        res.data.forEach(s => {
            likes += s.likes
            views += s.views
            comments += s.comments
        })

        setTotalLikes(likes)
        setTotalViews(views)
        setTotalComments(comments)
    }

    useEffect(() => {
        getStories()
    }, [])

    return (
        <>
            <PageContainer1>
                <Box display="flex">
                    <Sidebar routes={dashboardLinks} title="dashboard" />
                    <Box  ml="4" width="100%">
                        <HStack alignItems="top" width="100%" spacing="3">
                            <Card width="33%">
                                <Heading size="md">{totalLikes}</Heading>
                                <Text layerStyle="textSecondary" mt="2">Total likes</Text>
                            </Card>
                            <Card width="33%">
                                <Heading size="md">{totalViews}</Heading>
                                <Text layerStyle="textSecondary" mt="2">Total Views</Text>
                            </Card>
                            <Card width="33%">
                                <Heading size="md">{totalComments}</Heading>
                                <Text layerStyle="textSecondary" mt="2">Total Comments</Text>
                            </Card>
                        </HStack>
                        <Card mt="2" p="6" width="100%">
                            <Heading size="sm" >Stories ({stories.length})</Heading>
                            <Divider my="4"/>
                            {
                                stories.map((s,i) => 
                                <Link key={i} href={`/${s.creator.username}/${s.id}`}>
                                    <Flex cursor="pointer" justifyContent="space-between" alignItems="center" mb={i < stories.length-1 ? 6 : 0}>
                                        <VStack alignItems="left">
                                            <Heading size="sm">{s.title}</Heading>
                                            <Text fontSize=".85rem">created {moment(s.created).fromNow()} &nbsp;updated {moment(s.updated).fromNow()} </Text>
                                        </VStack>
                                        
                                        <HStack layerStyle="textSecondary" spacing="4">
                                            <HStack>
                                                <FaRegHeart />
                                                <Text>{s.likes}</Text>
                                            </HStack>
                                            <HStack>
                                                <FaRegComment />
                                                <Text>{s.comments}</Text>
                                            </HStack>
                                            <HStack>
                                                <FaRegEye />
                                                <Text>{s.views}</Text>
                                            </HStack>
                                        </HStack>

                                    </Flex>
                                    </Link>)
                            }
                        </Card>
                    </Box>

                </Box>
            </PageContainer1>
        </>
    )
}
export default DashboardPage


