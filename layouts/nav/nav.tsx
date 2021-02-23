import {
  chakra,
  Flex,
  Button,
  HStack,
  IconButton,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useUpdateEffect,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Image,
  Box
} from "@chakra-ui/react"
import siteConfig from "configs/site-config"
import { useViewportScroll } from "framer-motion"
import NextLink from "next/link"
import React from "react"
import { FaMoon, FaSun, FaUserAlt, FaRegSun, FaSignOutAlt,FaStar, FaGithub, FaBookmark, FaEdit } from "react-icons/fa"
import Logo, { LogoIcon } from "src/components/logo"
import { MobileNavButton, MobileNavContent } from "../mobile-nav"
import AlgoliaSearch from "src/components/search/algolia-search"
import useSession from "hooks/use-session"
import { Session } from "src/types/session"
import { useRouter } from "next/router"
import storage from "utils/localStorage"
import { logout } from "utils/session"
import { isAdmin, isEditor } from "utils/role"
import { ReserveUrls } from "src/data/reserve-urls"
import Link from "next/link"

const navLinks = [{
  title: '主页',
  url: '/',
},
{
  title: '标签',
  url: ReserveUrls.Tags,
},
{
  title: '学习资料',
  url: ReserveUrls.Courses,
},
]


function HeaderContent() {
  const router = useRouter()
  const { asPath } = router
  const mobileNav = useDisclosure()

  const session: Session = useSession()

  const { toggleColorMode: toggleMode } = useColorMode()
  const text = useColorModeValue("dark", "light")
  const SwitchIcon = useColorModeValue(FaMoon, FaSun)
  const mobileNavBtnRef = React.useRef<HTMLButtonElement>()

  useUpdateEffect(() => {
    mobileNavBtnRef.current?.focus()
  }, [mobileNav.isOpen])

  const login = () => {
    console.log(router)
    storage.set("current-page", asPath)
    router.push(ReserveUrls.Login)
  }

  return (
    <>
      <Flex w="100%" h="100%" align="center" justify="space-between" px={{ base: "4", md: "6" }}>
        <Flex align="center">
          <NextLink href="/" passHref>
            <chakra.a display={{ base: "none", md: "block" }} style={{ marginTop: '-5px' }} aria-label="Chakra UI, Back to homepage">
              <Logo width="130" />
            </chakra.a>
          </NextLink>
          <NextLink href="/" passHref>
            <chakra.a display={{ base: "block", md: "none" }} aria-label="Chakra UI, Back to homepage">
              <LogoIcon />
            </chakra.a>
          </NextLink>

          <HStack display={{ base: "none", md: "flex" }} ml={{ base: 1, md: 4, lg: 12 }} fontSize="1rem" minWidth="250px">
            {navLinks.map(link => <Box px="4" py="0.7rem" rounded="md"  key={link.url} color={useColorModeValue("gray.700", "whiteAlpha.900")} aria-current={asPath === link.url ? "page" : undefined} _activeLink={{ bg: useColorModeValue("transparent", "rgba(48, 140, 122, 0.3)"), color: useColorModeValue("teal.500", "teal.200"), fontWeight: "bold", }} ><Link href={link.url}>{link.title}</Link></Box>)}
          </HStack>
        </Flex>

        <Flex
          w="100%"
          maxW="600px"
          align="center"
          color={useColorModeValue("gray.500","gray.400")}
        >
          <AlgoliaSearch />
          <HStack spacing="5" display={{ base: "none", md: "flex" }}>
            <Link
              aria-label="Go to Chakra UI GitHub page"
              href={siteConfig.repo.url}
            >
              <IconButton
                size="md"
                fontSize="lg"
                aria-label={`Switch to ${text} mode`}
                variant="ghost"
                color="current"
                ml={{ base: "0", md: "3" }}
                _focus={null}
                icon={<FaGithub />}
              />
            </Link>
          </HStack>
          <IconButton
            size="md"
            fontSize="lg"
            aria-label={`Switch to ${text} mode`}
            variant="ghost"
            color="current"
            ml={{ base: "0", md: "1" }}
            onClick={toggleMode}
            _focus={null}
            icon={<SwitchIcon />}
          />
          {session ?
            <Menu>
              <MenuButton
                as={IconButton}
                bg="transparent"
                _focus={null}
                icon={session.user.avatar !== '' ? <Image
                  boxSize="2.8em"
                  borderRadius="full"
                  src="https://placekitten.com/100/100"
                  alt="user"
                /> :
                  <FaUserAlt />
                }
                aria-label="Options"
                ml={{ base: "0", md: "2" }}
              />
              <MenuList>
                <MenuItem icon={<FaUserAlt fontSize="16" />}>
                  <span>Sunface</span>
                </MenuItem>
                <MenuDivider />
                {isEditor(session.user.role) && <Link href={`${ReserveUrls.Editor}/posts`}><MenuItem icon={<FaEdit fontSize="16" />} >创作中心</MenuItem></Link>}
                {isAdmin(session.user.role) && <Link href={`${ReserveUrls.Admin}/tags`}><MenuItem  icon={<FaStar fontSize="16" />} >管理员</MenuItem></Link>}
                <MenuItem icon={<FaBookmark fontSize="16" />}>书签收藏</MenuItem>
                <MenuDivider />
                <MenuItem icon={<FaRegSun fontSize="16" />}>偏好设置</MenuItem>
                <MenuItem onClick={() => logout()} icon={<FaSignOutAlt fontSize="16" />}>账号登出</MenuItem>
              </MenuList>
            </Menu> :
            <Button
              as="a"
              ml="2"
              colorScheme="teal"
              fontSize=".8rem"
              onClick={() => login()}
            // leftIcon={<FaUserAlt />}
            >
              SIGN IN
            </Button>
          }
          <MobileNavButton
            ref={mobileNavBtnRef}
            aria-label="Open Menu"
            onClick={mobileNav.onOpen}
          />
        </Flex>
      </Flex>
      <MobileNavContent isOpen={mobileNav.isOpen} onClose={mobileNav.onClose} />
    </>
  )
}

function Header(props) {
  const ref = React.useRef<HTMLHeadingElement>()
  const [y, setY] = React.useState(0)
  const { height = 0 } = ref.current?.getBoundingClientRect() ?? {}

  const { scrollY } = useViewportScroll()
  React.useEffect(() => {
    return scrollY.onChange(() => setY(scrollY.get()))
  }, [scrollY])

  return (
    <chakra.header
      ref={ref}
      shadow={y > height ? "sm" : undefined}
      transition="box-shadow 0.2s"
      pos="fixed"
      top="0"
      zIndex="3"
      left="0"
      right="0"
      borderTop="4px solid"
      borderTopColor="teal.400"
      width="full"
      {...props}
    >
      <chakra.div height="4.5rem" mx="auto" maxW="1200px">
        <HeaderContent />
      </chakra.div>
    </chakra.header>
  )
}

export default Header

