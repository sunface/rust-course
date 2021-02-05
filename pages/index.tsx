import { chakra } from "@chakra-ui/react"
import Card from "components/card"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import Nav from "layouts/nav/nav"
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
      <Card width="200px">
      <chakra.h1>NOT FOUND</chakra.h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      </Card>


    </PageContainer>
  </>
)

export default HomePage

