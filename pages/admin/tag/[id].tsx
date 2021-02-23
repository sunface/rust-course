import { Box, Button, Flex, useColorMode, useColorModeValue, useDisclosure, useRadioGroup, useToast, chakra, Input, HStack, IconButton, Heading, Divider } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { MarkdownEditor } from 'components/markdown-editor/editor';
import PageContainer from 'layouts/page-container';
import { EditMode } from 'src/types/editor';
import { MarkdownRender } from 'components/markdown-editor/render';
import { requestApi } from 'utils/axios/request';
import { useRouter } from 'next/router';
import { config } from 'utils/config';
import { cloneDeep } from 'lodash';
import { FaMoon, FaSun } from 'react-icons/fa';
import Link from 'next/link';
import NextLink from "next/link"
import Logo, { LogoIcon } from 'components/logo';
import RadioCard from 'components/radio-card';
import { useViewportScroll } from 'framer-motion';
import Card from 'components/card';
import { Tag } from 'src/types/tag';


function PostEditPage() {
    const router = useRouter()
    const { id } = router.query
    const [editMode, setEditMode] = useState(EditMode.Edit)
    const [tag, setTag]:[Tag,any] = useState({
        md: `标签介绍，支持markdown`,
        title: ''
    })

    const toast = useToast()
    useEffect(() => {
        if (id && id !== 'new') {
            requestApi.get(`/tag/${id}`).then(res => setTag(res.data))
        }
    }, [id])

    const onMdChange = newMd => {
        setTag({
            ...tag,
            md: newMd
        })
    }

    const onChange = () => {
        setTag(cloneDeep(tag))
    }


    const publish = async () => {
        const res = await requestApi.post(`/admin/tag`, tag)
        toast({
            description: "发布成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
        router.push(`/tags/${tag.name}`)
    }

    return (
        <PageContainer
            nav={<Nav
                changeEditMode={(v) => setEditMode(v)}
                publish={() => publish()}
            />}
        >
            <Flex style={{ height: 'calc(100vh - 145px)' }}>
                <Card width="65%">
                    {editMode === EditMode.Edit ?
                        <MarkdownEditor
                            options={{
                                overrides: {
                                    Button: {
                                        component: Button,
                                    },
                                },
                            }}
                            onChange={(md) => onMdChange(md)}
                            md={tag.md}
                        /> :
                        <Box height="100%" p="6">
                            <MarkdownRender md={tag.md} />
                        </Box>
                    }
                </Card>
                <Card ml="6" width="35%">      
                        <Heading size="xs">
                            Title
                            </Heading>
                        <Input value={tag.title} onChange={(e) => { tag.title = e.target.value; onChange()}} mt="4" variant="flushed" size="sm" placeholder="Tag title..." focusBorderColor="teal.400" />

                        <Heading size="xs" mt="8">
                            Name
                            </Heading>
                        <Input value={tag.name} onChange={(e) => { tag.name = e.target.value; onChange()}} mt="4" variant="flushed" size="sm" placeholder="Tag name..." focusBorderColor="teal.400" />

                        <Heading size="xs" mt="8">
                            封面
                            </Heading>
                        <Input value={tag.cover} onChange={(e) => { tag.cover = e.target.value; onChange()}} mt="4" variant="flushed" size="sm" placeholder="图片链接，你可以用github当图片存储服务" focusBorderColor="teal.400" />

                        <Heading size="xs" mt="8">
                            图标
                            </Heading>
                        <Input value={tag.icon} onChange={(e) => { tag.icon = e.target.value; onChange()}} mt="4" variant="flushed" size="sm" placeholder="图片链接" focusBorderColor="teal.400" />
                </Card>
            </Flex>
        </PageContainer>
    );
}

export default PostEditPage

function HeaderContent(props: any) {
    const { toggleColorMode: toggleMode } = useColorMode()
    const text = useColorModeValue("dark", "light")
    const SwitchIcon = useColorModeValue(FaMoon, FaSun)

    const editOptions = [EditMode.Edit, EditMode.Preview]
    const { getRootProps, getRadioProps } = useRadioGroup({
        name: "framework",
        defaultValue: EditMode.Edit,
        onChange: (v) => {
            props.changeEditMode(v)
        },
    })
    const group = getRootProps()

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

                <HStack {...group}>
                    {editOptions.map((value) => {
                        const radio = getRadioProps({ value })
                        return (
                            <RadioCard key={value} {...radio} bg="teal" color="white">
                                {value}
                            </RadioCard>
                        )
                    })}
                </HStack>
                <Box
                    color={useColorModeValue("gray.500", "gray.400")}
                >
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
                    <Button layerStyle="colorButton" ml="2" onClick={props.publish}>发布</Button>
                </Box>
            </Flex>
        </>
    )
}

function Nav(props) {
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
        >
            <chakra.div height="4.5rem" mx="auto" maxW="1200px">
                <HeaderContent {...props} />
            </chakra.div>
        </chakra.header>
    )
}
