import { Text, Box, Heading, Image, Center, Button, Flex, VStack, Divider, useToast, FormControl, FormLabel, FormHelperText, Input, FormErrorMessage, HStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, useColorModeValue, StackDivider } from "@chakra-ui/react"
import Card from "components/card"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { settingLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import { Org } from "src/types/org"
import { Field, Form, Formik } from "formik"
import { config } from "configs/config"
import { isUsernameChar, usernameInvalidTips, validateNickname, validateUsername } from "utils/user"
import { isAdmin } from "utils/role"
import userCustomTheme from "theme/user-custom"
import { useRouter } from "next/router"
import Link from "next/link"
import { ReserveUrls } from "src/data/reserve-urls"

const UserOrgsPage = () => {
    const [orgs, setOrgs]:[Org[],any] = useState([])
    const { isOpen, onOpen, onClose } = useDisclosure()
    const router = useRouter()
    const stackBorderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)

    useEffect(() => {
        getOrgs()
    }, [])

    const getOrgs = async () => {
        const res = await requestApi.get("/org/byUserID/0")
        setOrgs(res.data)
    }


    const createOrg = async (values:Org) => {
        await requestApi.post(`/org/create`, values)
        onClose()
        router.push(`/${values.username}`)
    }

    const onCreateOrg = () => {
        onOpen()
    }

   


    return (
        <>
            <PageContainer>
                <Box display="flex">
                    <Sidebar routes={settingLinks} width={["120px", "120px", "250px", "250px"]} height="fit-content" title="博客设置" />
                    <Card ml="4" width="100%">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Heading size="sm">组织管理</Heading>
                            <Button colorScheme="teal" size="sm" onClick={onCreateOrg} _focus={null}>新建组织</Button>
                        </Flex>

                        <VStack mt="3" divider={<StackDivider borderColor={stackBorderColor} />} alignItems="left">
                        {
                            orgs.map(o => <Flex key={o.id} justifyContent="space-between" alignItems="center" p="2">
                                <Link href={`/${o.username}`}>
                                    <HStack cursor="pointer">
                                        <Image src={o.avatar} height="30px"/>
                                        <Heading size="sm" fontSize="1rem">{o.nickname}</Heading>
                                        <Text layerStyle="textSecondary">{isAdmin(o.role) ? 'admin' : 'member'}</Text>
                                    </HStack>
                                </Link>

                                <Button variant="outline" size="md" onClick={() => router.push(`${ReserveUrls.Settings}/org/profile?id=${o.id}`)}>Manage</Button>
                            </Flex>)
                        }
                        </VStack>

                    </Card>
                </Box>
            </PageContainer>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                {<ModalContent>
                    <ModalHeader>新建组织</ModalHeader>
                    <ModalBody mb="2">
                    <Formik
                            initialValues={{username: '',nickname:''} as Org}
                            onSubmit={createOrg}
                        >
                            {(props) => (
                                <Form>
                                    <VStack>
                                        <Field name="username" validate={validateUsername}>
                                            {({ field, form }) => (
                                                <FormControl isInvalid={form.errors.username && form.touched.username} >
                                                    <FormLabel>Username</FormLabel>
                                                    <Input {...field} placeholder="name" />
                                                    <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Field name="nickname" validate={validateNickname}>
                                            {({ field, form }) => (
                                                <FormControl isInvalid={form.errors.nickname && form.touched.nickname} >
                                                    <FormLabel>Nickname</FormLabel>
                                                    <Input {...field} placeholder="name" />
                                                    <FormErrorMessage>{form.errors.nickname}</FormErrorMessage>
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
                </ModalContent>}
            </Modal>
        </>
    )
}
export default UserOrgsPage

