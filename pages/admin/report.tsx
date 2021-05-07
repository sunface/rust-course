import {  Box,  useToast } from "@chakra-ui/react"
import Card from "components/card"

import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { adminLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import PageContainer1 from "layouts/page-container1"

const PostsPage = () => {
    const [reports, setReports]= useState([])
    const toast = useToast()
    const getConfig = async () => {
        const res = await requestApi.get(`/admin/reports`)
        console.log(res.data)
        setReports(res.data)
    }

    useEffect(() => {
        getConfig()
    }, [])

    return (
        <>
            <PageContainer1>
                <Box display="flex">
                    <Sidebar routes={adminLinks} title="管理员" />
                    <Card ml="4" p="6" width="100%">
                       

                    </Card>
                </Box>
            </PageContainer1>
        </>
    )
}
export default PostsPage

