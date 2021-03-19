import { Text, Box, Heading, Image, Center, Button, Flex, VStack, Divider, useToast, FormControl, FormLabel, FormHelperText, Input, FormErrorMessage, HStack, Wrap, useMediaQuery, Avatar, Textarea, Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure, Alert, AlertIcon, } from "@chakra-ui/react"
import Card from "components/card"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { adminLinks, orgSettingLinks, settingLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import { useRouter } from "next/router"
import { Field, Form, Formik } from "formik"
import { config } from "configs/config"
import Tags from "components/tags/tags"
var validator = require('validator');

const UserProfilePage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [org, setOrg] = useState(null)
    const [newOnwer, setNewOnwer] = useState('')

    const [isLargerThan1280] = useMediaQuery("(min-width: 768px)")
    const router = useRouter()
    useEffect(() => {
        if (router.query.org_id) {
            requestApi.get(`/user/info/${router.query.org_id}`).then(res => setOrg(res.data))
        }

    }, [router.query.org_id])

    const toast = useToast()

    const submitUser = async (values, _) => {
        await requestApi.post(`/org/update`, values)
        setOrg(values)
        toast({
            description: "更新成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
    }

    function validateNickname(value) {
        let error
        if (!value?.trim()) {
            error = "昵称不能为空"
        }

        if (value?.length > config.user.nicknameMaxLen) {
            error = `长度不能超过${config.user.nicknameMaxLen}`
        }

        return error
    }

    function validateEmail(value) {
        let email = value?.trim()
        let error

        if (email?.length > config.user.usernameMaxLen) {
            error = `长度不能超过${config.user.usernameMaxLen}`
            return error
        }

        if (email) {
            if (!validator.isEmail(email)) {
                error = "Email格式不合法"
                return error
            }
        }
        return error
    }


    function validateUrl(value, canBeEmpty = true) {
        let url = value?.trim()
        let error
        if (!canBeEmpty) {
            if (!url) {
                error = "url不能为空"
                return error
            }
        }

        if (url) {
            if (!validator.isURL(value)) {
                error = "URL格式不合法"
                return error
            }
        }

        return error
    }

    function validateLen(value) {
        let error
        if (value?.length > config.commonMaxlen) {
            error = `长度不能超过${config.commonMaxlen}`
        }

        return error
    }

    const transferOrg = async () => {
        await requestApi.post(`/org/transfer`,{orgID: router.query.org_id, ownerID: newOnwer})
        toast({
            description: "转移成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
        router.push('/settings/orgs')
    }

    const Layout = isLargerThan1280 ? HStack : VStack
    return (
        <>
            <PageContainer>
                <Box display="flex">
                    <Sidebar routes={orgSettingLinks(router.query.org_id)} width={["120px", "120px", "250px", "250px"]} height="fit-content" title={`组织${org?.nickname}`} />
                    {org && <VStack alignItems="left" ml="4" width="100%">
                        <Formik
                            initialValues={org}
                            onSubmit={submitUser}
                        >
                            {(props) => (
                                <Form>
                                    <Card p={[2, 2, 6, 6]}>
                                        <Layout spacing={isLargerThan1280 ? "8" : "6"} alignItems={isLargerThan1280 ? 'top' : 'left'}>
                                            <Box width="100%">
                                                <VStack alignItems="left" spacing="6">
                                                    <Heading size="sm">基本信息</Heading>
                                                    <Box>
                                                        <FormLabel>Username</FormLabel>
                                                        <Input placeholder="enter your nick name" size="lg" value={org.username} disabled />
                                                    </Box>

                                                    <Field name="nickname" validate={validateNickname}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.nickname && form.touched.nickname} >
                                                                <FormLabel>组织名称</FormLabel>
                                                                <Input {...field} placeholder="enter your nick name" size="lg" />
                                                                <FormErrorMessage>{form.errors.nickname}</FormErrorMessage>
                                                            </FormControl>

                                                        )}
                                                    </Field>
                                                    <Field name="email" validate={validateEmail}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.email && form.touched.email} >
                                                                <FormLabel>联系邮箱</FormLabel>
                                                                <Input {...field} placeholder="" size="lg" />
                                                                <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                                                            </FormControl>

                                                        )}
                                                    </Field>
                                                    <Field name="avatar" validate={(v) => validateUrl(v, false)}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.avatar && form.touched.avatar} >
                                                                <FormLabel>头像设置</FormLabel>
                                                                <Input {...field} placeholder="输入图片链接，可以用github或postimg.cc当图片存储服务" size="lg" />
                                                                <FormErrorMessage>{form.errors.avatar}</FormErrorMessage>
                                                                {org.avatar && <Image width="120px" mt="4" src={org.avatar} />}
                                                            </FormControl>

                                                        )}
                                                    </Field>
                                                    <Field name="cover" validate={(v) => validateUrl(v, true)}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.cover && form.touched.cover} >
                                                                <FormLabel>封面图片</FormLabel>
                                                                <Input {...field} placeholder="输入图片链接" size="lg" />
                                                                <FormErrorMessage>{form.errors.cover}</FormErrorMessage>
                                                                {org.cover && <Image width="100%" mt="4" src={org.cover} />}
                                                            </FormControl>

                                                        )}
                                                    </Field>
                                                </VStack>

                                                <VStack alignItems="left" spacing="6" mt="6">
                                                    <Heading size="sm">About You</Heading>
                                                    <Field name="tagline" validate={validateLen}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.tagline && form.touched.tagline} >
                                                                <FormLabel>一句话描述组织</FormLabel>
                                                                <Input {...field} placeholder="I'm dev, working for google now" size="lg" />
                                                                <FormErrorMessage>{form.errors.tagline}</FormErrorMessage>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <Field name="location" validate={validateLen}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.location && form.touched.location} >
                                                                <FormLabel>Location</FormLabel>
                                                                <Input {...field} placeholder="Califonia, US" size="lg" />
                                                                <FormErrorMessage>{form.errors.location}</FormErrorMessage>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <Field name="about" validate={validateLen}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.about && form.touched.about} >
                                                                <FormLabel>详细介绍</FormLabel>
                                                                <Textarea {...field} placeholder="give us more info about you" size="lg" />
                                                                <FormErrorMessage>{form.errors.about}</FormErrorMessage>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <Field name="skills" validate={validateLen}>
                                                        {({ field, form }) => (
                                                            <FormControl >
                                                                <FormLabel>组织技术栈</FormLabel>
                                                                <Tags tags={org.skills} onChange={(v) => form.values.skills = v} size="lg" />
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                </VStack>
                                            </Box>
                                            <Box width="100%" >
                                                <VStack alignItems="left" spacing="6">
                                                    <Heading size="sm">社交媒体</Heading>
                                                    <Field name="website" validate={validateUrl}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.website && form.touched.website} >
                                                                <FormLabel>官方网站</FormLabel>
                                                                <Input {...field} placeholder="https://sunface.dev" size="lg" />
                                                                <FormErrorMessage>{form.errors.website}</FormErrorMessage>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <Field name="github" validate={validateUrl}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.github && form.touched.github} >
                                                                <FormLabel>Github</FormLabel>
                                                                <Input {...field} placeholder="https://github.com/sunface" size="lg" />
                                                                <FormErrorMessage>{form.errors.github}</FormErrorMessage>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <Field name="twitter" validate={validateUrl}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.twitter && form.touched.twitter} >
                                                                <FormLabel>Twitter</FormLabel>
                                                                <Input {...field} placeholder="https://twitter.com/imdotdev" size="lg" />
                                                                <FormErrorMessage>{form.errors.twitter}</FormErrorMessage>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <Field name="zhihu" validate={validateUrl}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.zhihu && form.touched.zhihu} >
                                                                <FormLabel>知乎</FormLabel>
                                                                <Input {...field} placeholder="https://www.zhihu.com/people/iSunface" size="lg" />
                                                                <FormErrorMessage>{form.errors.zhihu}</FormErrorMessage>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <Field name="weibo" validate={validateUrl}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.weibo && form.touched.weibo} >
                                                                <FormLabel>微博</FormLabel>
                                                                <Input {...field} placeholder="https://weibo.com/2734382464" size="lg" />
                                                                <FormErrorMessage>{form.errors.weibo}</FormErrorMessage>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <Field name="facebook" validate={validateUrl}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.facebook && form.touched.facebook} >
                                                                <FormLabel>Facebook</FormLabel>
                                                                <Input {...field} placeholder="" size="lg" />
                                                                <FormErrorMessage>{form.errors.facebook}</FormErrorMessage>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <Field name="stackoverflow" validate={validateUrl}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.stackoverflow && form.touched.stackoverflow} >
                                                                <FormLabel>StackOverflow</FormLabel>
                                                                <Input {...field} placeholder="" size="lg" />
                                                                <FormErrorMessage>{form.errors.stackoverflow}</FormErrorMessage>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                </VStack>
                                            </Box>


                                        </Layout>

                                    </Card>
                                    <Box mt={6}>
                                        <Button
                                            colorScheme="cyan"
                                            variant="outline"
                                            type="submit"
                                            _focus={null}

                                        >
                                            更新信息
                                        </Button>
                                        <Button
                                            colorScheme="red"
                                            _focus={null}
                                            ml="4"
                                            onClick={onOpen}
                                        >
                                            转移组织
                                        </Button>
                                    </Box>
                                </Form>
                            )}
                        </Formik>
                    </VStack>}
                </Box>
            </PageContainer>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                {<ModalContent p="3">
                    <ModalBody mb="2">
                        <Text>转移组织</Text>
                        <Text mt="2" fontSize=".9rem" layerStyle="textSecondary">你必须是超级管理员才能完成此操作</Text>
                        <Input _focus={null} mt="4" placeholder="输入转移用户的ID，请找该用户询问" value={newOnwer} onChange={e => setNewOnwer(e.currentTarget.value)} />
                        <Alert status="error" mt="4">
                            <AlertIcon />
                            注意：该操作无法逆转，一旦转移，你将变为普通成员
                        </Alert>

                        <Button mt="4" colorScheme="teal" onClick={transferOrg}>开始转移</Button>
                    </ModalBody>
                </ModalContent>}
            </Modal>
        </>
    )
}
export default UserProfilePage

