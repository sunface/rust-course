import { Menu, MenuButton, MenuList, MenuItem, Text, Box, Heading, Image, HStack, Center, Button, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, FormControl, FormLabel, FormHelperText, Input, FormErrorMessage, VStack, Textarea, Divider, useColorModeValue, useToast } from "@chakra-ui/react"
import Card from "components/card"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { editorLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import { useDisclosure } from "@chakra-ui/react"
import { Field, Form, Formik } from "formik"
import { config } from "configs/config"
import TextStoryCard from "components/story/text-story-card"
import { Story } from "src/types/story"
import { FaExternalLinkAlt, FaRegEdit } from "react-icons/fa"
import { useRouter } from "next/router"
import { ReserveUrls } from "src/data/reserve-urls"
import Link from "next/link"
import PageContainer1 from "layouts/page-container1"
import Empty from "components/empty"
import { IDType } from "src/types/id"
var validator = require('validator');

const newSeries: Story = { title: '', brief: '', cover: '',type: IDType.Series }
const PostsPage = () => {
    const [currentSeries, setCurrentSeries] = useState(null)
    const [posts, setPosts] = useState([])
    const router = useRouter()
    const toast = useToast()
    const getPosts = () => {
        requestApi.get(`/story/posts/editor?type=${IDType.Series}`).then((res) => setPosts(res.data)).catch(_ => setPosts([]))
    }

    useEffect(() => {
        getPosts()
    }, [])


    function validateTitle(value) {
        let error
        if (!value?.trim()) {
            error = "标题不能为空"
        }

        if (value?.length > config.posts.titleMaxLen) {
            error = "标题长度不能超过128"
        }

        return error
    }

    function validateUrl(value) {
        let error
        if (value && !validator.isURL(value)) {
            error = "URL格式不合法"
        }
        return error
    }

    function validateBrief(value) {
        let error
        if (value && value.length > config.posts.briefMaxLen) {
            error = `文本长度不能超过${config.posts.briefMaxLen}`
        }
        return error
    }

    const submitPost = async (values, _) => {
        await requestApi.post(`/story`, values)
        toast({
            description: "提交成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
        setCurrentSeries(null)
        getPosts()
    }

    const editPost = (post: Story) => {
        if (post.url.trim() === "") {
            router.push(`/editor/post/${post.id}`)
        } else {
            setCurrentSeries(post)
        }
    }

    const onDeletePost = async (id) => {
        await requestApi.delete(`/story/post/${id}`)
        getPosts()
        toast({
            description: "删除成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
    }

    return (
        <>
            <PageContainer1 >
                <Box display="flex">
                    <Sidebar routes={editorLinks} title="创作中心" />
                    <Card ml="4" p="6" width="100%">
                        {currentSeries ?
                            <Formik
                                initialValues={currentSeries}
                                onSubmit={submitPost}
                            >
                                {(props) => (
                                    <Form>
                                        <VStack spacing="6">
                                            <Field name="title" validate={validateTitle}>
                                                {({ field, form }) => (
                                                    <FormControl isInvalid={form.errors.title && form.touched.title} >
                                                        <FormLabel>标题</FormLabel>
                                                        <Input {...field} placeholder="name" />
                                                        <FormErrorMessage>{form.errors.title}</FormErrorMessage>
                                                    </FormControl>
                                                )}
                                            </Field>
                                            <Field name="cover" validate={validateUrl}>
                                                {({ field, form }) => (
                                                    <FormControl isInvalid={form.errors.cover && form.touched.cover}>
                                                        <FormLabel>封面图片</FormLabel>
                                                        <Input  {...field} placeholder="https://..." />
                                                        <FormErrorMessage>{form.errors.cover}</FormErrorMessage>
                                                    </FormControl>
                                                )}
                                            </Field>
                                            <Field name="brief" validate={validateBrief}>
                                                {({ field, form }) => (
                                                    <FormControl isInvalid={form.errors.brief && form.touched.brief}>
                                                        <FormLabel>简介</FormLabel>
                                                        <Textarea {...field} placeholder="在本系列文章中，我们将..."></Textarea>
                                                        <FormErrorMessage>{form.errors.brief}</FormErrorMessage>
                                                    </FormControl>
                                                )}
                                            </Field>
                                        </VStack>
                                        <Box mt={6}>
                                            <Button
                                                colorScheme="teal"
                                                variant="outline"
                                                type="submit"
                                                _focus={null}
                                            >
                                                提交
                                            </Button>
                                            <Button variant="ghost" ml="4" _focus={null} onClick={() => setCurrentSeries(null)}>取消</Button>
                                        </Box>
                                    </Form>
                                )}
                            </Formik> :
                            <>
                                <Flex alignItems="center" justify="space-between">
                                    <Heading size="md">系列({posts.length})</Heading>
                                    <Button colorScheme="teal" size="sm" onClick={() => setCurrentSeries(newSeries)} _focus={null}>新建系列</Button>
                                </Flex>
                                {
                                    posts.length === 0 ? <Empty />
                                        :
                                        <>
                                            <VStack mt="4">
                                                {posts.map(post =>
                                                    <Box width="100%" key={post.id}>
                                                        <TextStoryCard story={post} showActions={true} mt="4" onEdit={() => editPost(post)} onDelete={() => onDeletePost(post.id)} showSource={false}/>
                                                        <Divider mt="5" />
                                                    </Box>
                                                )}
                                            </VStack>
                                            <Center><Text layerStyle="textSecondary" fontSize="sm" mt="5">没有更多文章了</Text></Center>
                                        </>
                                }
                            </>}
                    </Card>
                </Box>
            </PageContainer1>
        </>
    )
}
export default PostsPage

