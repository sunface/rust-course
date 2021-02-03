import { chakra } from "@chakra-ui/react"
import Container from "components/container"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import Nav from "layouts/nav"
import PageContainer from "layouts/page-container"
import React from "react"

const PostPage = () => (
  <>
    <SEO
      title={siteConfig.seo.title}
      description={siteConfig.seo.description}
    />
    <Nav />
    <PageContainer>
      <chakra.h1>Post</chakra.h1>
    </PageContainer>
  </>
)

export default PostPage

