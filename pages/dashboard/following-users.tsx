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


const UsersPage = () => {
    const [users, setUsers] = useState([])
    const borderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)

    const getUsers = async () => {
        const res = await requestApi.get(`/interaction/following/0?type=${IDType.User}`)
        const ids = []
        for (const f of res.data) {
            ids.push(f.id)
        }


        const res1 = await requestApi.post(`/user/ids`, ids)
        setUsers(res1.data)
    }

    useEffect(() => {
        getUsers()
    }, [])

    return (
        <>
            <PageContainer1>
                <Box display="flex">
                    <Sidebar routes={dashboardLinks} title="Dashboard" />
                    <Card ml="4" p="6" width="100%">
                        {
                            users.length === 0 ? <Empty /> :
                            <VStack  alignItems="left"  divider={<StackDivider borderColor={borderColor} />} >
                            
                            {users.map(user =>
                                <UserCard key={user.id} user={user} />
                            )}
                        </VStack>
                        }
                    </Card>
                </Box>
            </PageContainer1>
        </>
    )
}
export default UsersPage


