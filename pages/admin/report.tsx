import { Box, Button, chakra, Flex, Heading, HStack, IconButton, Image, Table, Tbody, Td, Text, Th, Thead, Tr, useToast, VStack } from "@chakra-ui/react"
import Card from "components/card"

import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { adminLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import PageContainer1 from "layouts/page-container1"
import { getSvgIcon } from "components/svg-icon"
import { getUserName } from "utils/user"
import { IDType } from "src/types/id"
import moment from 'moment'
import { useRouter } from "next/router"
const PostsPage = () => {
    const [reports, setReports] = useState([])
    const router = useRouter()
    const toast = useToast()
    const getReports = async () => {
        const res = await requestApi.get(`/admin/reports`)
        console.log(res.data)
        setReports(res.data)
    }

    useEffect(() => {
        getReports()
    }, [])

    const displayContent = type => {
        switch (type) {
            case IDType.Post:
                return "文章"
            case IDType.Comment:
                return "评论"
            default:
                break;
        }
    }

    const deleteReport = async id => {
        await requestApi.delete(`/admin/report/${id}`)
        getReports()
    }

    return (
        <>
            <PageContainer1>
                <Box display="flex">
                    <Sidebar routes={adminLinks} title="管理员" />
                    <Card ml="4" p="6" width="100%">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Heading size="sm" mb="2">Report列表</Heading>
                        </Flex>
                        
                        {
                            reports.map(r => 
                                <Flex alignItems="center"  mt="6" justifyContent="space-between">
                                    <HStack>
                                        <Image src={r.reporter.avatar} width="40px" height="40px"/>
                                        <Heading size="xs">{getUserName(r.reporter)}</Heading>
                                        <Text fontSize=".9rem">于{moment(r.created).fromNow()}，提交了关于 <chakra.span color="teal">{displayContent(r.type)} </chakra.span>的报告 : {r.content}</Text>
                                    </HStack>

                                    <HStack >
                                        <Button size="sm" onClick={() => router.push(r.url)}>去处理</Button>
                                        <Button colorScheme="orange" size="sm" onClick={() => deleteReport(r.id)}>删除Report</Button>
                                    </HStack>
                                </Flex>)
                        }
                    </Card>
                </Box>
            </PageContainer1>
        </>
    )
}
export default PostsPage

