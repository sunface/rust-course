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
import RadioCard from "components/radio-card"
import { EditMode } from "src/types/editor"
import Card from "components/card"
import TagInput from "components/tag-input"
import { Tag } from "src/types/tag"
import { cloneDeep, remove } from "lodash"
import { requestApi } from "utils/axios/request"
import DarkMode from "components/dark-mode"
import EditModeSelect from "components/edit-mode-select"




function HeaderContent(props: any) {
    const [tags,setTags]:[Tag[],any] = useState([])
    const [allTags,setAllTags] = useState([])

    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        requestApi.get('/tags').then(res => {
            setAllTags(res.data)
            const t = []
            props.ar.tags?.forEach(id => {
                res.data.forEach(tag => {
                    if (tag.id === id) {
                        t.push(tag)
                    }
                })
            })

            setTags(t)
        })
    },[props.ar])


    
    const addTag = t => {
       setTags(t)
       
       const ids = []
       t.forEach(tag => ids.push(tag.id))
       props.ar.tags = ids
    }

    const removeTag = t => {
        const newTags = cloneDeep(tags)
        remove(newTags, tag => tag.id === t.id)
        setTags(newTags)

        const ids = []
        newTags.forEach(tag => ids.push(tag.id))
        props.ar.tags = ids
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
                </Flex>
                <Box>
                    <Input value={props.ar.title} placeholder="Title..." onChange={props.changeTitle} focusBorderColor={useColorModeValue('teal.400', 'teal.100')} variant="flushed" />
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
                            <TagInput options={allTags}  selected={tags} onChange={addTag}/>

                            {tags.length > 0&& <Box mt="2">
                            {
                                tags.map(tag => 
                                <ChakraTag key={tag.id} mr="2" colorScheme="teal" variant="solid" px="2" py="1"> 
                                    <TagLabel>{tag.title}</TagLabel>
                                    <TagCloseButton onClick={ _ => removeTag(tag)}/>
                                </ChakraTag>)
                            }
                            </Box>}
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

