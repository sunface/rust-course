import {
    chakra,
    Flex,
    HStack,
    IconButton,
    useColorModeValue,
    useDisclosure,
    useUpdateEffect,
    Box,
    VStack,
    useMediaQuery,
    Text
  } from "@chakra-ui/react"
  import siteConfig from "configs/site-config"
  import { useViewportScroll } from "framer-motion"
  import NextLink from "next/link"
  import React from "react"
  import { FaGithub, FaSearch } from "react-icons/fa"
  import Logo, { LogoIcon } from "src/components/logo"
  import { MobileNavButton, MobileNavContent } from "./mobile-nav"
  import AlgoliaSearch from "src/components/search/algolia-search"
  import { useRouter } from "next/router"
  import { ReserveUrls } from "src/data/reserve-urls"
  import Link from "next/link"
  import DarkMode from "components/dark-mode"
  import AccountMenu from "components/user-menu"
import { getSvgIcon } from "components/svg-icon"
  
  const navLinks = [{
    title: '主页',
    url: '/',
    icon: getSvgIcon("home","1.4rem")
  },
  {
    title: '标签',
    url: ReserveUrls.Tags,
    icon: getSvgIcon("tags","1.2rem")
  },
  {
    title: '学习资料',
    url: ReserveUrls.Courses,
    icon: getSvgIcon("explore","1.4rem")
  },
  ]
  
  
  function HeaderContent() {
    const router = useRouter()
    const { asPath } = router
    const mobileNav = useDisclosure()
  
  
    const mobileNavBtnRef = React.useRef<HTMLButtonElement>()
    const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
    useUpdateEffect(() => {
      mobileNavBtnRef.current?.focus()
    }, [mobileNav.isOpen])
  
  
    return (
      <>
        <Flex className="vertical-nav"  h="100%" align="center" justify="space-between" px={[2,2,6,6]} direction="column" py="8">
          <VStack align="center">
            <NextLink href="/" passHref>
              <chakra.a  style={{ marginTop: '-5px' }} aria-label="Chakra UI, Back to homepage">
                {isLargerThan768 ? <Logo width="130" /> : <Logo width="105" />}
              </chakra.a>
            </NextLink>
  
            <VStack pt="6"  ml={{ base: 1, md: 4, lg: 12 }} fontSize="1rem" alignItems="left">
              {navLinks.map(link => 
               <Link href={link.url} key={link.title}>
                  <HStack cursor="pointer" px="4" py="0.7rem" rounded="md" key={link.url} color={useColorModeValue("gray.700", "whiteAlpha.900")} aria-current={asPath === link.url ? "page" : undefined} _activeLink={{ bg: useColorModeValue("transparent", "rgba(48, 140, 122, 0.3)"), color: useColorModeValue("teal.500", "teal.200"), fontWeight: "bold", }} >
                    <Box width="25px">{link.icon}</Box><Text>{link.title}</Text>
                  </HStack>
                </Link>
                )}
            </VStack>
          </VStack>
  
          <VStack
            spacing="4"
            align="center"
            color={useColorModeValue("gray.500", "gray.400")}
          >
            <IconButton
                fontSize="1.4rem"
                aria-label="go to github"
                variant="ghost"
                color="current"
                _focus={null}
                icon={<FaSearch />}
              />

            <Link
              aria-label="Go to Chakra UI GitHub page"
              href={siteConfig.repo.url}
            >
              <IconButton
                size="md"
                fontSize="1.4rem"
                aria-label="go to github"
                variant="ghost"
                color="current"
                _focus={null}
                icon={<FaGithub />}
              />
            </Link>
            <DarkMode fontSize="1.4rem"/>
            <AccountMenu />
            {/* <MobileNavButton
              ref={mobileNavBtnRef}
              aria-label="Open Menu"
              onClick={mobileNav.onOpen}
            /> */}
          </VStack>
        </Flex>
        {/* <MobileNavContent isOpen={mobileNav.isOpen} onClose={mobileNav.onClose} /> */}
      </>
    )
  }
  
  function VerticalNav(props) {
    const ref = React.useRef<HTMLHeadingElement>()

    return (
      <chakra.header
        ref={ref}
        transition="box-shadow 0.2s"
        pos="fixed"
        top="0"
        zIndex="3"
        left="0"
        bottom="0"
        bg={useColorModeValue('white', 'gray.800')}
        {...props}
      >
        <chakra.div height="100%">
          <HeaderContent />
        </chakra.div>
      </chakra.header>
    )
  }
  
  export default VerticalNav
  
  