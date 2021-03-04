import { Badge, Box, chakra,Flex,PropsOf, useMediaQuery } from "@chakra-ui/react"
import { SkipNavContent, SkipNavLink } from "@chakra-ui/skip-nav"
import Container from "components/container"
import Footer from "./footer"
import Nav from "./nav/nav"
import SEO from "components/seo"
import { useRouter } from "next/router"
import * as React from "react"
import PageTransition from "src/components/page-transition"
import siteConfig from "configs/site-config"
import VerticalNav from "./nav/vertical-nav"

function useHeadingFocusOnRouteChange() {
  const router = useRouter()

  React.useEffect(() => {
    const onRouteChange = () => {
      const [heading] = Array.from(document.getElementsByTagName("h1"))
      heading?.focus()
    }
    router.events.on("routeChangeComplete", onRouteChange)
    return () => {
      router.events.off("routeChangeComplete", onRouteChange)
    }
  }, [])
}

type PageContainerProps = PropsOf<typeof chakra.div> &  {
  children: React.ReactNode
  nav?: any
}


function PageContainer1(props: PageContainerProps) {
  const { children ,nav, ...rest} = props
  useHeadingFocusOnRouteChange()
  return (
    <>
      <SEO
        title={siteConfig.seo.title}
        description={siteConfig.seo.description}
      />
      <Flex px={[0,0,16,16]}>
      <VerticalNav display={{base:"none",md:"block"}} width={["100px","100px","200px","200px"]} /> 
      <Nav display={{base:"block",md:"none"}} />
      <Box width="100%" ml={["0px","0px","150px","150px"]} pb="8" p={["1","1","3","3"]} mt={["70px","70px","0px","0px"]} {...rest}>
        {children}
      </Box>
    </Flex>
    </>
  )
}

export default PageContainer1
