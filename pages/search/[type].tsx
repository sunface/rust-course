import { Box, chakra, Flex, Input } from "@chakra-ui/react"
import Card from "components/card"
import Container from "components/container"
import Empty from "components/empty"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import PageContainer1 from "layouts/page-container1"
import Sidebar from "layouts/sidebar/sidebar"
import { useRouter } from "next/router"
import React from "react"
import { searchLinks } from "src/data/links"

const CoursesPage = () => {
    const router = useRouter()
    const type = router.query.type

    return (
        <>
            <SEO
                title={siteConfig.seo.title}
                description={siteConfig.seo.description}
            />
            <PageContainer1>
                <Flex width="100%">
                    <Sidebar routes={searchLinks} title="全站搜索" />
                    <Box ml="3" width={['100%', '100%', '50%', '50%']}>
                        <Card p="5">
                            <Input size="lg" placeholder="type to search..." variant="unstyled" />
                        </Card>
                        <Card mt="2">
                            <Empty />
                        </Card>
                    </Box>
                </Flex>
            </PageContainer1>
        </>
    )
}

export default CoursesPage


