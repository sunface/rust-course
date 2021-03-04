import { Menu,MenuButton,MenuList,MenuItem, Text, Box, Heading, Image, HStack, Center, Button, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, FormControl, FormLabel, FormHelperText, Input, FormErrorMessage, VStack, Textarea, Divider, useColorModeValue, useToast } from "@chakra-ui/react"
import Card from "components/card"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import {editorLinks} from "src/data/links"
import { requestApi } from "utils/axios/request"
import { useDisclosure } from "@chakra-ui/react"
import { Field, Form, Formik } from "formik"
import { config } from "configs/config"
import TextPostCard from "components/posts/text-post-card"
import { Post } from "src/types/posts"
import { FaExternalLinkAlt, FaRegEdit } from "react-icons/fa"
import { useRouter } from "next/router"
import { ReserveUrls } from "src/data/reserve-urls"
import Link from "next/link"
import PageContainer1 from "layouts/page-container1"
var validator = require('validator');

const newPost: Post = { title: '', url: '', cover: '' }
const PostsPage = () => {
    const [currentPost, setCurrentPost] = useState(newPost)
    const [posts, setPosts] = useState([])
    const { isOpen, onOpen, onClose } = useDisclosure()
    const router = useRouter()
    const toast = useToast()
    const getPosts = () => {
        requestApi.get(`/editor/posts`).then((res) => setPosts(res.data)).catch(_ => setPosts([]))
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
        if (!validator.isURL(value)) {
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
        await requestApi.post(`/editor/post`, values)
        onClose()
        toast({
            description: "提交成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
        setCurrentPost(newPost)
        getPosts()
    }

    const editPost = (post: Post) => {
        if (post.url.trim() === "") {
            router.push(`/editor/post/${post.id}`)
        } else {
            setCurrentPost(post)
            onOpen()
        }
    }

    const onDeletePost= async (id) => {
        await requestApi.delete(`/editor/post/${id}`)
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
                    <Sidebar routes={editorLinks}   title="创作中心"/>
                    <Card ml="4" p="6" width="100%">
                        <Flex alignItems="center" justify="space-between">
                            <Heading size="md">文章列表({posts.length})</Heading>
                            {config.posts.writingEnabled ?
                                <Menu>
                                <MenuButton as={Button} colorScheme="teal" size="sm"  _focus={null}>
                                  新建文章
                                </MenuButton>
                                <MenuList color={useColorModeValue("gray.500","gray.400")}>
                                  <MenuItem  icon={<FaExternalLinkAlt fontSize="14" />} onClick={onOpen}>外部链接</MenuItem>
                                  <Link href={`${ReserveUrls.Editor}/post/new`}><MenuItem  icon={<FaRegEdit fontSize="16" />} >原创博客</MenuItem></Link>
                                </MenuList>
                              </Menu>
                                :
                                <Button colorScheme="teal" size="sm" onClick={onOpen} _focus={null}>新建文章</Button>}
                        </Flex>
                        {
                            posts.length === 0 ?
                                <>
                                    <Center mt="4">
                                        <Image height="25rem" src="/empty-posts.png" />
                                    </Center>
                                    <Center mt="8">
                                        <Heading size="sm">你还没创建任何文章</Heading>
                                    </Center>
                                </>
                                :
                                <>
                                    <VStack mt="4">
                                        {posts.map(post =>
                                            <Box width="100%" key={post.id}>
                                                <TextPostCard post={post} showActions={true} mt="4" onEdit={() => editPost(post)} onDelete={() => onDeletePost(post.id)} />
                                                <Divider mt="5" />
                                            </Box>
                                        )}
                                    </VStack>
                                    <Center><Text layerStyle="textSecondary" fontSize="sm" mt="5">没有更多文章了</Text></Center>
                                </>
                        }
                    </Card>
                </Box>
            </PageContainer1>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{currentPost.id ? "编辑文章" : "新建文章"}</ModalHeader>
                    <ModalBody mb="2">
                        <Formik
                            initialValues={currentPost}
                            onSubmit={submitPost}
                        >
                            {(props) => (
                                <Form>
                                    <VStack>
                                        <Field name="title" validate={validateTitle}>
                                            {({ field, form }) => (
                                                <FormControl isInvalid={form.errors.title && form.touched.title} >
                                                    <FormLabel>标题</FormLabel>
                                                    <Input {...field} placeholder="name" />
                                                    <FormErrorMessage>{form.errors.title}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Field name="url" validate={validateUrl}>
                                            {({ field, form }) => (
                                                <FormControl isInvalid={form.errors.url && form.touched.url}>
                                                    <FormLabel>URL</FormLabel>
                                                    <Input  {...field} placeholder="https://..." />
                                                    <FormErrorMessage>{form.errors.url}</FormErrorMessage>
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
                                                    <FormLabel>文章简介</FormLabel>
                                                    <Textarea {...field} placeholder="往往是开头的一段文字"></Textarea>
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
                                        <Button variant="ghost" ml="4" _focus={null} onClick={onClose}>取消</Button>
                                    </Box>
                                </Form>
                            )}
                        </Formik>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}
export default PostsPage

