import {
  chakra,
  Flex,
  Button,
  HStack,
  Icon,
  IconButton,
  Link,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Text,
} from "@chakra-ui/react"
import siteConfig from "configs/site-config"
import { useViewportScroll } from "framer-motion"
import NextLink from "next/link"
import React from "react"
import { FaMoon, FaSun, FaUserAlt, FaRegSun, FaSignOutAlt, FaRegBookmark, FaChartBar, FaHome, FaArrowRight, FaGithub } from "react-icons/fa"
import Logo, { LogoIcon } from "src/components/logo"
import { MobileNavButton, MobileNavContent } from "./mobile-nav"
import AlgoliaSearch from "src/components/search/algolia-search"
import useLogin from "hooks/use-login"


const DiscordIcon = (props) => (
  <svg viewBox="0 0 146 146" {...props}>
    <path
      fill="currentColor"
      d="M107.75 125.001s-4.5-5.375-8.25-10.125c16.375-4.625 22.625-14.875 22.625-14.875-5.125 3.375-10 5.75-14.375 7.375-6.25 2.625-12.25 4.375-18.125 5.375-12 2.25-23 1.625-32.375-.125-7.125-1.375-13.25-3.375-18.375-5.375-2.875-1.125-6-2.5-9.125-4.25-.375-.25-.75-.375-1.125-.625-.25-.125-.375-.25-.5-.375-2.25-1.25-3.5-2.125-3.5-2.125s6 10 21.875 14.75c-3.75 4.75-8.375 10.375-8.375 10.375-27.625-.875-38.125-19-38.125-19 0-40.25 18-72.875 18-72.875 18-13.5 35.125-13.125 35.125-13.125l1.25 1.5c-22.5 6.5-32.875 16.375-32.875 16.375s2.75-1.5 7.375-3.625c13.375-5.875 24-7.5 28.375-7.875.75-.125 1.375-.25 2.125-.25 7.625-1 16.25-1.25 25.25-.25 11.875 1.375 24.625 4.875 37.625 12 0 0-9.875-9.375-31.125-15.875l1.75-2S110 19.626 128 33.126c0 0 18 32.625 18 72.875 0 0-10.625 18.125-38.25 19zM49.625 66.626c-7.125 0-12.75 6.25-12.75 13.875s5.75 13.875 12.75 13.875c7.125 0 12.75-6.25 12.75-13.875.125-7.625-5.625-13.875-12.75-13.875zm45.625 0c-7.125 0-12.75 6.25-12.75 13.875s5.75 13.875 12.75 13.875c7.125 0 12.75-6.25 12.75-13.875s-5.625-13.875-12.75-13.875z"
      fillRule="nonzero"
    />
  </svg>
)

const GithubIcon = (props) => (
  <svg viewBox="0 0 20 20" {...props}>
    <path
      fill="currentColor"
      d="M10 0a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69a3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 10 0"
    />
  </svg>
)

function HeaderContent() {
  const mobileNav = useDisclosure()

  const [login,_] = useLogin()
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure()

  const { toggleColorMode: toggleMode } = useColorMode()
  const text = useColorModeValue("dark", "light")
  const SwitchIcon = useColorModeValue(FaMoon, FaSun)
  const mobileNavBtnRef = React.useRef<HTMLButtonElement>()

  useUpdateEffect(() => {
    mobileNavBtnRef.current?.focus()
  }, [mobileNav.isOpen])

  return (
    <>
      <Flex w="100%" h="100%" align="center" justify="space-between" px={{ base: "4", md: "6" }}>
        <Flex align="center">
          <NextLink href="/" passHref>
            <chakra.a display={{ base: "none", md: "block" }}  style={{marginTop: '-5px'}} aria-label="Chakra UI, Back to homepage">
              <Logo width="114"/>
            </chakra.a>
          </NextLink>
          <NextLink href="/" passHref>
            <chakra.a display={{ base: "block", md: "none" }}  aria-label="Chakra UI, Back to homepage">
              <LogoIcon />
            </chakra.a>
          </NextLink>

          <HStack spacing={{base:1, md:3, lg:5}} display={{ base: "none", md: "flex" }} ml={{ base: 1, md: 4, lg: 12 }} fontSize=".95rem" minWidth="250px">
            <Link>主页</Link>
            <Link>标签</Link>
            <Link>学习资料</Link>
            <Link>工具</Link>
          </HStack>
        </Flex>

        <Flex
          w="100%"
          maxW="600px"
          align="center"
          color="gray.400"
        >
          <AlgoliaSearch />
          <HStack spacing="5" display={{ base: "none", md: "flex" }}>
            <Link
              isExternal
              aria-label="Go to Chakra UI GitHub page"
              href={siteConfig.repo.url}
            >
              <Icon
                as={GithubIcon}
                display="block"
                transition="color 0.2s"
                w="5"
                h="5"
                _hover={{ color: "gray.600" }}
              />
            </Link>
          </HStack>
          <IconButton
            size="md"
            fontSize="lg"
            aria-label={`Switch to ${text} mode`}
            variant="ghost"
            color="current"
            ml={{ base: "0", md: "3" }}
            onClick={toggleMode}
            icon={<SwitchIcon />}
          />
          {login ? 
            <Menu>
              <MenuButton
                as={IconButton}
                bg="transparent"
                icon={<FaUserAlt />}
                aria-label="Options"
                ml={{ base: "0", md: "2" }}
              />
              <MenuList>
                <MenuItem>
                  <Image
                    boxSize="2rem"
                    borderRadius="full"
                    src="https://placekitten.com/100/100"
                    alt="Fluffybuns the destroyer"
                    mr="12px"
                  />
                  <span>Sunface</span>
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<FaChartBar fontSize="16" />}>Dashboard</MenuItem>
                <MenuItem icon={<FaRegBookmark fontSize="16" />}>Bookmarks</MenuItem>
                <MenuDivider />
                <MenuItem icon={<FaRegSun fontSize="16" />}>Account Settings</MenuItem>
                <MenuItem icon={<FaSignOutAlt fontSize="16" />}>Log out</MenuItem>
              </MenuList>
            </Menu> :
            <Button
              as="a"
              ml="2"
              colorScheme="teal"
              fontSize=".8rem"
              onClick={onLoginOpen}
            >
              登录
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

      <Modal isOpen={isLoginOpen} onClose={onLoginClose} autoFocus={false} size="xl"  isCentered >
        <ModalOverlay />
        <ModalContent p="9" pb="0">
          <ModalBody textAlign="center" display="flex" alignItems="center" flexDirection="column">
              <Logo width="10rem"/>
              <Text mt="8" fontSize=".9rem">欢迎加入im.dev，共同打造全世界最优秀的开发者社区</Text>
              <Button colorScheme="teal" mt="8" fontSize=".9rem" leftIcon={<FaGithub fontSize="1.0rem"/>}>使用github登录</Button>
              <Text mt="6" fontSize=".7rem" opacity={0.7}>如果继续，则表示你同意im.dev的<Link textDecoration="underline">服务条款</Link>和<Link textDecoration="underline">隐私政策</Link></Text>
              <Image src="/pokeman.svg" height="300px"/>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

function Header(props) {
  const bg = useColorModeValue("white", "gray.800")
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
      bg={bg}
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

