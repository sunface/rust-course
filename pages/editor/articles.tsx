import { createStandaloneToast, Text, Box, Heading, Image, HStack, Center, Button, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, FormControl, FormLabel, FormHelperText, Input, FormErrorMessage, VStack, Textarea, Divider } from "@chakra-ui/react"
import Card from "components/card"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import editorLinks from "src/data/editor-links"
import { requestApi } from "utils/axios/request"
import { useDisclosure } from "@chakra-ui/react"
import { Field, Form, Formik } from "formik"
import { config } from "utils/config"
import TextArticleCard from "components/articles/text-article-card"
import { Article } from "src/types/posts"
var validator = require('validator');
const toast = createStandaloneToast()

const newPost: Article = { title: '', url: '', cover: '' }
const ArticlesPage = () => {
    const [posts, setPosts] = useState([])
    const [currentPost, setCurrentPost] = useState(newPost)
    useEffect(() => {
        getPosts()
    }, [])

    const getPosts = () => {
        requestApi.get(`/editor/articles`).then((res) => setPosts(res.data)).catch(_ => setPosts([]))
    }

    const { isOpen, onOpen, onClose } = useDisclosure()

    function validateTitle(value) {
        console.log(value)
        let error
        if (!value?.trim()) {
            error = "标题不能为空"
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

    const submitArticle = async (values, _) => {
        await requestApi.post(`/editor/article`, values)
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

    const editArticle = (ar: Article) => {
        setCurrentPost(ar)
        onOpen()
    }

    const onDeleteArticle = () => {
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
            <Nav />
            <PageContainer>
                <Box display="flex">
                    <Sidebar routes={editorLinks} width="250px" height="fit-content" />
                    <Card ml="4" p="6" width="100%">
                        <Flex alignItems="center" justify="space-between">
                            <Heading size="md">文章列表({posts.length})</Heading>
                            <Button colorScheme="teal" size="sm" onClick={onOpen} _focus={null}>添加文章</Button>
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
                                                <TextArticleCard article={post} showActions={true} mt="4" onEdit={() => editArticle(post)} onDelete={() => onDeleteArticle()} />
                                                <Divider mt="5" />
                                            </Box>
                                        )}
                                    </VStack>
                                    <Center><Text layerStyle="textSecondary" fontSize="sm" mt="6">没有更多文章了</Text></Center>
                                </>
                        }
                    </Card>
                </Box>
            </PageContainer>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>编辑文章</ModalHeader>
                    <ModalBody mb="2">
                        <Formik
                            initialValues={currentPost}
                            onSubmit={submitArticle}
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
                                            提交文章
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
export default ArticlesPage

