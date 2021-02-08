import { chakra } from "@chakra-ui/react"
import Container from "components/container"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
import { useRouter } from "next/router"
import React from "react"

const UserPage = () => {
  const router = useRouter()
  return (
  <>
    <SEO
      title={siteConfig.seo.title}
      description={siteConfig.seo.description}
    />
    <Nav />
    <PageContainer>
      <chakra.h1>{router.query.username}'s home</chakra.h1>
    </PageContainer>
  </>
)}

export default UserPage

