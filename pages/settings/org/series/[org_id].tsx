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
import { SeriesEditor } from "pages/editor/series"


const OrgPostsPage = () => {
    const [org, setOrg]:[User,any] = useState(null)
    const router = useRouter()
    const orgID = router.query.org_id
    useEffect(() => {
        if (orgID) {
            requestApi.get(`/user/info/${router.query.org_id}`).then(res => setOrg(res.data))
        }

    }, [orgID])

    

    return (
        <>
            <PageContainer>
                <Box display="flex">
                    <Sidebar routes={orgSettingLinks(router.query.org_id)} width={["120px", "120px", "250px", "250px"]} height="fit-content" title={`组织${org?.nickname}`} />
                    {orgID && <SeriesEditor orgID={orgID as string}/>}
                </Box>
            </PageContainer>
        </>
    )
}
export default OrgPostsPage

