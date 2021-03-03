import { chakra, HStack, VStack } from "@chakra-ui/react"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import PageContainer1 from "layouts/page-container1"
import React from "react"
import {HomeSidebar} from 'pages/index'

const TagsPage = () => (
  <>
    <SEO
      title={siteConfig.seo.title}
      description={siteConfig.seo.description}
    />
    <PageContainer1>
      <HStack alignItems="top" p="4" spacing="3">
        <VStack alignItems="left" width={["100%", "100%", "70%", "70%"]} spacing="3">
        </VStack>
        <HomeSidebar />
      </HStack>
    </PageContainer1>
  </>
)

export default TagsPage

