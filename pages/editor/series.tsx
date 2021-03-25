import { Text, Box, Heading, Image, HStack, Center, Button, Flex, FormControl, FormLabel, Input, FormErrorMessage, VStack, Textarea, Divider, useToast, Stack, StackDivider, useColorModeValue, Table, Thead, Tr, Th, Tbody, Td, CloseButton, Editable, EditablePreview, EditableInput, Select } from "@chakra-ui/react"
import Card from "components/card"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { editorLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import { useDisclosure } from "@chakra-ui/react"
import { Field, Form, Formik } from "formik"
import { config } from "configs/config"
import TextStoryCard from "components/story/manage-story-card"
import { Story } from "src/types/story"
import { FaExternalLinkAlt, FaPlus, FaRegEdit } from "react-icons/fa"
import { useRouter } from "next/router"
import { ReserveUrls } from "src/data/reserve-urls"
import Link from "next/link"
import PageContainer1 from "layouts/page-container1"
import Empty from "components/empty"
import { IDType } from "src/types/id"
import PostSelect from "components/story/post-select"
import { cloneDeep, find, remove } from "lodash"
import userCustomTheme from "theme/user-custom"
import Tags from "components/tags/tags"
import ManageStories from "components/story/manage-stories"
var validator = require('validator');

const newSeries: Story = { title: '', brief: '', cover: '', type: IDType.Series }
const SeriesPage = () => {
    return (
        <>
            <PageContainer1 >
                <Box display="flex">
                    <Sidebar routes={editorLinks} title="创作中心" />
                    <SeriesEditor />
                </Box>
            </PageContainer1>
        </>
    )
}
export default SeriesPage


export const SeriesEditor = ({orgID=""}) => {
    const [currentSeries, setCurrentSeries]: [Story, any] = useState(null)
    const [series, setSeries] = useState([])
    const [posts, setPosts] = useState([])
    const [seriesPosts, setSeriesPosts] = useState([])

    const toast = useToast()

    const borderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)

    const getSeries = async () => {
        let res
        if (orgID) {
            res = await requestApi.get(`/story/posts/org/${orgID}?type=${IDType.Series}`)
        } else {
            res = await requestApi.get(`/story/posts/editor?type=${IDType.Series}`)
        }

        setSeries(res.data)
    }

    const getPosts = async () => {
        let res
        if (orgID) {
            res = await requestApi.get(`/story/posts/org/${orgID}?type=${IDType.Post}`)
        } else {
            res = await requestApi.get(`/story/posts/editor?type=${IDType.Post}`)
        }

        setPosts(res.data)
    }

    useEffect(() => {
        getSeries()
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

    const submitSeries = async (values, _) => {
        // 这里必须按照顺序同步提交
        if (orgID) {
            await requestApi.post(`/story`, {...values,ownerId: orgID})
        } else {
            await requestApi.post(`/story`, values)
        }

        await requestApi.post(`/story/series/post/${values.id}`, seriesPosts)

        toast({
            description: "提交成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
        setCurrentSeries(null)
        getSeries()
    }

    const editSeries = async (series: Story) => {
        const res = await requestApi.get(`/story/series/post/${series.id}`)
        setSeriesPosts(res.data)
        setCurrentSeries(series)
    }

    const onDeleteSeries = async (id) => {
        await requestApi.delete(`/story/series/post/${id}`)
        await requestApi.delete(`/story/post/${id}`)
        getSeries()
        toast({
            description: "删除成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
    }

    const onPostSelect = id => {
        const sposts = cloneDeep(seriesPosts)
        if (!find(sposts, v => v.id === id)) {
            sposts.push({ id: id, priority: 0 })
            setSeriesPosts(sposts)
        }
    }

    const onPostDelete = id => {
        const sposts = cloneDeep(seriesPosts)
        remove(sposts, v => v.id === id)
        setSeriesPosts(sposts)
    }

    const onPriorityChange = (e, s) => {
        if (e.currentTarget.value) {
            const i = parseInt(e.currentTarget.value)
            if (i) {
                s.priority = i
            }
        } else {
            s.priority = 0
        }

        const sposts = cloneDeep(seriesPosts)
        setSeriesPosts(sposts)
    }

    const addSeries = async () => {
        const res = await requestApi.get(`/story/id/${IDType.Series}`)
        newSeries.id = res.data
        setSeriesPosts([])
        setCurrentSeries(newSeries)
    }

    const onPinPost = async id => {
        if (orgID) {
            await requestApi.post(`/org/pin/story/${id}`)
        } else {
            await requestApi.post(`/story/pin/${id}`)
        }

        getSeries()
    }

    return (
                    <Card ml="4" p="6" width="100%">
                        {currentSeries ?
                            <>
                                <Formik
                                    initialValues={currentSeries}
                                    onSubmit={submitSeries}
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
                                                {/* <Field name="ownerId">
                                                    {({ field, form }) => (
                                                        <FormControl isInvalid={form.errors.ownerId && form.touched.ownerId} >
                                                            <FormLabel>发布于</FormLabel>
                                                            <Select {...field} variant="unstyled" mt="3">
                                                                {
                                                                    orgs.map(o => <option value={o.id}>{o.nickname}</option>)
                                                                }
                                                            </Select>
                                                            <FormErrorMessage>{form.errors.ownerId}</FormErrorMessage>
                                                        </FormControl>
                                                    )}
                                                </Field> */}
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
                                                <Field>
                                                    {({ field, form }) => (
                                                        <FormControl>
                                                            <FormLabel>标签</FormLabel>
                                                            <Tags tags={currentSeries.tags} onChange={(ids) => currentSeries.tags = ids} />
                                                        </FormControl>
                                                    )}
                                                </Field>

                                                <Field>
                                                    {({ field, form }) => (
                                                        <FormControl isInvalid={form.errors.brief && form.touched.brief}>
                                                            <FormLabel>
                                                                <HStack>
                                                                    <Text>关联文章</Text>
                                                                    <PostSelect selected={seriesPosts} posts={posts} onSelect={onPostSelect} />
                                                                </HStack>
                                                            </FormLabel>
                                                            {seriesPosts?.length > 0 && <Stack spacing="1" py="2" divider={<StackDivider borderColor={borderColor} />}>
                                                                <Table variant="simple" size="sm">
                                                                    <Thead>
                                                                        <Tr>
                                                                            <Th>Title</Th>
                                                                            <Th>Priority(desc)</Th>
                                                                            <Th></Th>
                                                                        </Tr>
                                                                    </Thead>
                                                                    <Tbody>
                                                                        {
                                                                            seriesPosts.map(s => {
                                                                                const post = find(posts, p => p.id === s.id)

                                                                                if (post) {
                                                                                    return <Tr key={post.id}>
                                                                                        <Td>{post.title}</Td>
                                                                                        <Td>
                                                                                            <Editable value={s.priority}>
                                                                                                <EditablePreview minWidth="100px" />
                                                                                                <EditableInput onChange={(e) => onPriorityChange(e, s)} />
                                                                                            </Editable>
                                                                                        </Td>
                                                                                        <Td width="50px"><CloseButton size="sm" onClick={() => onPostDelete(s.id)} _focus={null} /></Td>
                                                                                    </Tr>
                                                                                }
                                                                                return null
                                                                            })
                                                                        }

                                                                    </Tbody>
                                                                </Table>
                                                            </Stack>}
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
                                </Formik>
                            </>
                            :
                            <>
                                <Flex alignItems="center" justify="space-between">
                                    <Heading size="md">系列({series.length})</Heading>
                                    <Button colorScheme="teal" size="sm" onClick={() => addSeries()} _focus={null}>新建系列</Button>
                                </Flex>
                                {
                                    series.length === 0 ? <Empty />
                                        :
                                        <Box pt="4">
                                            <ManageStories stories={series} onEdit={(story) => editSeries(story)} onDelete={(id) => onDeleteSeries(id)} showSource={false} onPin={(id) => onPinPost(id)}/>
                                        </Box>
                                }
                            </>}
                    </Card>
    )
}