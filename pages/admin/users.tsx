import { Text, Box, Heading, Image, Center, Button, Flex, VStack, Divider, useToast, Table, Thead, Tr, Th, Tbody, Td, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, useDisclosure, FormControl, FormLabel, Input, FormErrorMessage, Select} from "@chakra-ui/react"
import Card from "components/card"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { adminLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import TagCard from "components/tags/tag-card"
import { useRouter } from "next/router"
import Link from "next/link"
import { ReserveUrls } from "src/data/reserve-urls"
import { Tag } from "src/types/tag"
import { route } from "next/dist/next-server/server/router"
import PageContainer1 from "layouts/page-container1"
import Empty from "components/empty"
import { User } from "src/types/user"
import moment from 'moment'
import { getSvgIcon } from "components/svg-icon"
import { Field, Form, Formik } from "formik"
import { validateEmail, validateNickname, validateUsername } from "utils/user"
import { Role } from "src/types/role"

const PostsPage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [currentUser,setCurrentUser]:[User,any] = useState(null)
    const [users, setUsers]: [User[], any] = useState([])
    const router = useRouter()
    const toast = useToast()
    const getUsers = async () => {
        const res = await requestApi.get(`/admin/user/all`)
        setUsers(res.data)
    }

    useEffect(() => {
        getUsers()
    }, [])

    const onEditUser = user => {
        if (!user) {
          // add user  
          setCurrentUser({role:Role.NORMAL})
        } else {
          // edit user
          setCurrentUser(user)
        }
        onOpen()
    }
    
    const submitUser = async values => {
        await requestApi.post("/admin/user",values)
        getUsers()
        onClose()
    }

    return (
        <>
            <PageContainer1>
                <Box display="flex">
                    <Sidebar routes={adminLinks} title="管理员" />
                    <Card ml="4" p="6" width="100%">
                        <Flex alignItems="center" justify="space-between">
                            <Heading size="md">用户列表({users.length})</Heading>
                            <Button colorScheme="teal" size="sm" _focus={null} onClick={() => onEditUser(null)}>添加用户</Button>
                        </Flex>
                        <Table variant="simple" mt="4">
                            <Thead>
                                <Tr>
                                    <Th>用户名</Th>
                                    <Th>邮箱</Th>
                                    <Th>角色</Th>
                                    <Th>加入时间</Th>
                                    <Th></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {
                                    users.map((user, i) => <Tr key={i}>
                                        <Td>{user.username}</Td>
                                        <Td>{user.email}</Td>
                                        <Td>{user.role}</Td>
                                        <Td>{moment(user.created).fromNow()}</Td>
                                        <Td>
                                            <IconButton aria-label="edit navbar" variant="ghost" icon={getSvgIcon('edit', ".95rem")} onClick={() => onEditUser(user)} />
                                            {/* <IconButton aria-label="delete navbar" variant="ghost" icon={getSvgIcon('close', "1rem")} onClick={() => onDeleteUser(user)} /> */}
                                        </Td>
                                    </Tr>)
                                }

                            </Tbody>
                        </Table>
                    </Card>
                </Box>
            </PageContainer1>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                {currentUser && <ModalContent>
                    <ModalHeader>{currentUser.id ? '编辑用户' : '新建用户'}</ModalHeader>
                    <ModalBody mb="2">
                        <Formik
                            initialValues={currentUser}
                            onSubmit={submitUser}
                        >
                            {(props) => (
                                <Form>
                                    <VStack>
                                        <Field name="username" validate={currentUser.id !== undefined ? null : validateUsername}>
                                            {({ field, form }) => (
                                                <FormControl isInvalid={form.errors.username && form.touched.username} >
                                                    <FormLabel>Username</FormLabel>
                                                    <Input {...field} placeholder="name" disabled={currentUser.id !== undefined}/>
                                                    <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                        <Field name="email" validate={currentUser.id !== undefined ? null :validateEmail}>
                                                        {({ field, form }) => (
                                                            <FormControl isInvalid={form.errors.email && form.touched.email} >
                                                                <FormLabel>邮箱地址</FormLabel>
                                                                <Input {...field} placeholder="" size="lg"  disabled={currentUser.id !== undefined}/>
                                                                <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                                                            </FormControl>

                                                        )}
                                        </Field>
                                        <Field name="role">
                                            {({ field, form }) => (
                                                <FormControl isInvalid={form.errors.role && form.touched.role} >
                                                    <FormLabel>Role</FormLabel>
                                                    <Select value={currentUser.role} {...field}>
                                                        <option value={Role.NORMAL}>{Role.NORMAL}</option>
                                                        <option value={Role.EDITOR}>{Role.EDITOR}</option>
                                                        <option value={Role.ADMIN}>{Role.ADMIN}</option>
                                                    </Select>
                                                    <FormErrorMessage>{form.errors.role}</FormErrorMessage>
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
export default PostsPage

