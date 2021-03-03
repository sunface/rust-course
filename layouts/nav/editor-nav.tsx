import {
    chakra,
    Flex,
    Button,
    useColorModeValue,
    Box,
    useRadioGroup,
    HStack,
    Input,
    Drawer,
    useDisclosure,
    DrawerOverlay,
    DrawerContent,
    Divider,
    Heading,
    Tag as ChakraTag,
    TagLabel,
    TagCloseButton
} from "@chakra-ui/react"
import { useViewportScroll } from "framer-motion"
import NextLink from "next/link"
import React, { useEffect, useState } from "react"
import Logo, { LogoIcon } from "src/components/logo"
import Card from "components/card"
import DarkMode from "components/dark-mode"
import EditModeSelect from "components/edit-mode-select"
import Tags from "components/tags/tags"
import { Post } from "src/types/posts"



interface Props {
    ar : Post
    changeTitle: any
    changeEditMode: any
    publish: any
    onChange:any
}

function HeaderContent(props: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure()

    
    const onTagsChange = ids => {
       props.ar.tags = ids
    }

    return (
        <>
            <Flex w="100%" h="100%" align="center" justify="space-between" px={{ base: "2", md: "6" }}>
                <Flex align="center" display={{ base: "none", md: "flex" }}>
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
                </Flex>
                <Box>
                    <Input width={{base: '100px', md: '187px'}} value={props.ar.title} placeholder="Title..." onChange={props.changeTitle} focusBorderColor={useColorModeValue('teal.400', 'teal.100')} variant="flushed" />
                </Box>
                <EditModeSelect onChange={props.changeEditMode}/>
                <Box
                    color={useColorModeValue("gray.500", "gray.400")}
                >
                    <DarkMode />
                    <Button layerStyle="colorButton" ml="2" onClick={onOpen}>发布</Button>
                </Box>
            </Flex>
            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={onClose}
                size="md"
                motionPreset="none"
            >
                <DrawerOverlay>
                    <DrawerContent p="4">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Heading size="sm">文章设置</Heading>
                            <Button layerStyle="colorButton" ml="2" onClick={props.publish}>发布</Button>
                        </Flex>
                        <Divider mt="5" mb="5"/>

                        <Card>
                            <Heading size="xs">
                                封面图片
                            </Heading>
                            <Input value={props.ar.cover} onChange={(e) => {props.ar.cover = e.target.value; props.onChange()}} mt="4" variant="unstyled" size="sm" placeholder="输入链接，可以用github或postimg.cc当图片存储服务.." focusBorderColor="teal.400"/>
                        </Card>

                        <Card mt="4">
                            <Heading size="xs"> 
                                设置标签
                            </Heading>
                            <Tags tags={props.ar.tags} onChange={onTagsChange}/>
                        </Card>
                    </DrawerContent>
                </DrawerOverlay>
            </Drawer>
        </>
    )
}

function EditorNav(props) {
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
            bg={useColorModeValue('white','gray.800')}
            left="0"
            right="0"
            width="full"
        >
            <chakra.div height="4.5rem" mx="auto" maxW="1200px">
                <HeaderContent {...props} />
            </chakra.div>
        </chakra.header>
    )
}

export default EditorNav

