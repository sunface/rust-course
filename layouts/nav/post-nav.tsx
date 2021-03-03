import {
    chakra,
    Flex,
    HStack,
    IconButton,
    useColorModeValue,
    useDisclosure,
    useUpdateEffect,
    Heading,
    Button,
    Divider,
    Text
} from "@chakra-ui/react"
import { useViewportScroll } from "framer-motion"
import React from "react"
import { SearchIcon } from "@chakra-ui/icons"
import DarkMode from "components/dark-mode"
import AccountMenu from "components/account-menu"
import { FaGithub, FaTwitter, FaUserPlus } from "react-icons/fa"



function HeaderContent() {
    const mobileNav = useDisclosure()

    const mobileNavBtnRef = React.useRef<HTMLButtonElement>()

    useUpdateEffect(() => {
        mobileNavBtnRef.current?.focus()
    }, [mobileNav.isOpen])

    return (
        <>
            <Flex w="100%" h="100%" align="center" justify="space-between" px={{ base: "4", md: "6" }}>
                <HStack spacing="2">
                    <Heading size="md">Sunface的博客</Heading>
                    <Button colorScheme="teal" variant="outline" leftIcon={<FaUserPlus />}>Follow</Button>
                </HStack>


                <HStack
                    color={useColorModeValue("gray.500", "gray.400")}
                    spacing={[1,1,2,2]}
                >
                    <IconButton
                        size="md"
                        fontSize="lg"
                        variant="ghost"
                        color="current"
                        _focus={null}
                        onClick={() => alert('search in this blog')}
                        icon={<SearchIcon />}
                        aria-label="search in this blog"
                    />
                    <DarkMode />
                    <AccountMenu />
                </HStack>
            </Flex>
            <Flex w="100%" align="center" justify="space-between" px={{ base: "6", md: "10" }} mt="2">
                <HStack spacing="4">
                    <Text fontSize="1.1rem" fontWeight="600">Home</Text>
                    <Text fontSize="1.1rem">Badges</Text>
                </HStack>

                <HStack
                    color={useColorModeValue("gray.500", "gray.400")}
                    spacing="2"
                >
                     <IconButton
                        size="md"
                        fontSize="1.2rem"
                        aria-label="go to github"
                        variant="ghost"
                        color="current"
                        _focus={null}
                        icon={<FaGithub />}
                    />
                    <IconButton
                        size="md"
                        fontSize="1.2rem"
                        aria-label="go to twitter"
                        variant="ghost"
                        color="current"
                        _focus={null}
                        icon={<FaTwitter />}
                    />
                </HStack>
            </Flex>
            <Divider mt="2"/>
        </>
    )
}

function PostNav(props) {
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
            top="0"
            zIndex="3"
            left="0"
            right="0"
            width="full"
            bg={useColorModeValue('white', 'gray.800')}
            {...props}
        >
            <chakra.div height="4.5rem" mx="auto" maxW="1200px">
                <HeaderContent />
            </chakra.div>
        </chakra.header>
    )
}

export default PostNav

