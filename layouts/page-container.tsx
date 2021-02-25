import { Badge, Box, chakra,PropsOf } from "@chakra-ui/react"
import { SkipNavContent, SkipNavLink } from "@chakra-ui/skip-nav"
import Container from "components/container"
import Footer from "./footer"
import Nav from "./nav/nav"
import SEO from "components/seo"
import { useRouter } from "next/router"
import * as React from "react"
import PageTransition from "src/components/page-transition"
import siteConfig from "configs/site-config"

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


function PageContainer(props: PageContainerProps) {
  const { children ,nav, ...rest} = props
  useHeadingFocusOnRouteChange()

  return (
    <>
      <SEO
        title={siteConfig.seo.title}
        description={siteConfig.seo.description}
      />
      <SkipNavLink zIndex={20}>Skip to Content</SkipNavLink>
      {nav ? nav : <Nav />}
      <Container as="main" className="main-content">
        <Box display={{ base: "block", md: "flex" }}>
          <div style={{ flex: 1 }}>
            <SkipNavContent />
            <Box
              id="content"
              pt={3}
              px={[0,0,2,3]}
              mt={props.mt ?? "4.5rem"}
              mx="auto"
              {...rest}
            >
              <PageTransition>
                {children}
              </PageTransition>
            </Box>
            {/* <Footer /> */}
          </div>
        </Box>
      </Container>
    </>
  )
}

export default PageContainer
