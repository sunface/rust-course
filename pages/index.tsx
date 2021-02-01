import { chakra } from "@chakra-ui/react"
import Container from "components/container"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import Nav from "layouts/nav"
import PageContainer from "layouts/page-container"
import React from "react"

const HomePage = () => (
  <>
    <SEO
      title={siteConfig.seo.title}
      description={siteConfig.seo.description}
    />
    <Nav />
    <PageContainer>
      <chakra.h1>NOT FOUND</chakra.h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </PageContainer>
  </>
)

export default HomePage
