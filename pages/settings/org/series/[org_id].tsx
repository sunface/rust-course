import {  Box} from "@chakra-ui/react"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { orgSettingLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import { useRouter } from "next/router"
import { User } from "src/types/user"
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

