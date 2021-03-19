import { Box } from "@chakra-ui/react"
import PageContainer from "layouts/page-container"
import PageContainer1 from "layouts/page-container1"
import Sidebar from "layouts/sidebar/sidebar"
import { useRouter } from "next/router"
import { NavbarEditor } from "pages/settings/navbar"
import { useEffect, useState } from "react"
import { orgSettingLinks } from "src/data/links"
import { User } from "src/types/user"
import { requestApi } from "utils/axios/request"

const UserNavbarPage = () => {
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
                    {orgID && <NavbarEditor orgID={orgID as string}/>}
                </Box>
            </PageContainer>
        </>
    )
}
export default UserNavbarPage