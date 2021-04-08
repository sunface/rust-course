import { Text, Box, Heading, Image, Center, Button, Flex, VStack, Divider, useToast, Input } from "@chakra-ui/react"
import Card from "components/card"

import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { adminLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import PageContainer1 from "layouts/page-container1"
import { cloneDeep } from "lodash"


interface Config {
    smtp?: {
        addr: string
        fromAddress: string
        fromName: string
        authUsername: string
        authPassword: string
    }
}

const PostsPage = () => {
    const [config, setConfig]: [Config, any] = useState({})
    const toast = useToast()
    const getConfig = async () => {
        const res = await requestApi.get(`/admin/config`)
        console.log(res.data)
        setConfig(res.data)
    }

    useEffect(() => {
        getConfig()
    }, [])

    const onChange = () => {
        const c = cloneDeep(config)
        setConfig(c)
    }

    const updateConfig = async () => {
        await requestApi.post(`/config`,config)
        toast({
            description: "更新配置成功",
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
                        {config.smtp && <Box>
                            <Flex alignItems="center" justify="space-between">
                                <Heading size="sm">SMTP</Heading>
                            </Flex>
                            <VStack alignItems="left" spacing="4" mt="4">
                                <Box>
                                    <Heading size="xs">SMTP地址</Heading>
                                    <Input mt="2" w="auto" value={config.smtp.addr} onChange={e => {config.smtp.addr = e.currentTarget.value;onChange()}} placeholder="e.g smtp.google.com:25"/>
                                </Box>
                                <Box>
                                    <Heading size="xs">From Addr</Heading>
                                    <Input mt="2" w="auto" value={config.smtp.fromAddress} onChange={e => {config.smtp.fromAddress = e.currentTarget.value;onChange()}} placeholder="e.g hello@im.dev"/>
                                </Box>
                                <Box>
                                    <Heading size="xs">From Name</Heading>
                                    <Input mt="2" w="auto" value={config.smtp.fromName} onChange={e => {config.smtp.fromName = e.currentTarget.value;onChange()}} placeholder="e.g I'm dev"/>
                                </Box>
                                <Box>
                                    <Heading size="xs">Auth user</Heading>
                                    <Input mt="2" w="auto" value={config.smtp.authUsername} onChange={e => {config.smtp.authUsername = e.currentTarget.value;onChange()}} placeholder=""/>
                                </Box>
                                <Box>
                                    <Heading size="xs">Auth password</Heading>
                                    <Input mt="2" w="auto" value={config.smtp.authPassword} onChange={e => {config.smtp.authPassword = e.currentTarget.value;onChange()}} placeholder=""/>
                                </Box>
                            </VStack>
                        </Box>}
                        
                        <Button colorScheme="teal" mt="4" onClick={updateConfig}>Update</Button>

                    </Card>
                </Box>
            </PageContainer1>
        </>
    )
}
export default PostsPage

