import { Text, Box, VStack, Divider, useToast, Heading, Alert, Tag, Button, HStack, Modal, ModalOverlay, ModalContent, ModalBody, Select, useDisclosure } from "@chakra-ui/react"
import Card from "components/card"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { orgSettingLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import { useRouter } from "next/router"
import { User } from "src/types/user"
import UserCard from "components/users/user-card"
import { config } from "configs/config"
import OrgMember from "components/users/org-member"
import { Role } from "src/types/role"
import { cloneDeep } from "lodash"


const UserProfilePage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [currentMember,setCurrentMember]:[User,any] = useState(null)
    const [org, setOrg]:[User,any] = useState(null)
    const [users, setUsers]: [User[], any] = useState(null)
    const [secret, setSecret] = useState('')
    const router = useRouter()
    useEffect(() => {
        if (router.query.org_id) {
            getMembers()
            requestApi.get(`/org/secret/${router.query.org_id}`).then(res => setSecret(res.data))
            requestApi.get(`/user/info/${router.query.org_id}`).then(res => setOrg(res.data))
        }

    }, [router.query.org_id])

    const getMembers = async () => {
        const res = await requestApi.get(`/org/members/${router.query.org_id}`)
        setUsers(res.data)
    }
    const toast = useToast()

    const generateSecret = async () => {
        const res = await requestApi.post(`/org/secret/${router.query.org_id}`)
        toast({
            description: "生成secret成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
        setSecret(res.data)
    }

    const onDelete = async (member) => {
        await requestApi.delete(`/org/member/${org.id}/${member.id}`)
        toast({
            description: "删除用户成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
        getMembers()
    }

    const onEdit = (member) => {
        setCurrentMember(member)
        onOpen()
    }


    const onChangeRole = e => {
        const member = cloneDeep(currentMember)
        member.role = e.currentTarget.value;
        setCurrentMember(member)
    }

    const onSumitMember = async () => {
        await requestApi.post(`/org/member/role`,{orgID:org.id, memberID: currentMember.id, role: currentMember.role})
        setCurrentMember(null)
        onClose()
        getMembers()
    }
    
    return (
        <>
            <PageContainer>
                <Box display="flex">
                    <Sidebar routes={orgSettingLinks(router.query.org_id)} width={["120px", "120px", "250px", "250px"]} height="fit-content" title={`组织${org?.nickname}`} />
                    <Box ml={[1,1,4,4]} width="100%">
                        <Card>
                            <Heading size="sm">Grow the org</Heading>
                            <Text mt="2">Invite teammates by sending them the secret and the following instructions:</Text>
                            <VStack alignItems="left" mt="3" className="bordered" p="4">
                                <Text>1. Sign in</Text>
                                <Text>2. Navigate to {config.uiDomain}/settings/orgs</Text>
                                <Text>3. Paste the secret code below and click Join Organization</Text>
                                <Tag wordBreak="break-word" maxW="fit-content">{secret}</Tag>
                            </VStack>
                            <HStack mt="4">
                                <Button variant="outline" onClick={generateSecret} _focus={null}>Generate new secret</Button>
                                <Text color="red.500">You should rotate this regularly!</Text>
                            </HStack>
                            
                        </Card>
                        <Card mt="3">
                            {users &&
                                <VStack alignItems="left" width="100%">
                                    {
                                        users.map(u => <OrgMember user={u} key={u.id} onEdit={onEdit} onDelete={onDelete}/>)
                                    }
                                </VStack>}
                        </Card>
                    </Box>

                </Box>
            </PageContainer>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                {currentMember && <ModalContent p="3">
                    <ModalBody mb="2">
                            <Text>Change role</Text>
                            <Select value={currentMember.role} _focus={null} mt="3" onChange={onChangeRole}>
                                <option value={Role.NORMAL}>{Role.NORMAL}</option>
                                <option value={Role.ADMIN}>{Role.ADMIN}</option>
                            </Select>
                            <Button colorScheme="teal"  mt="3" onClick={onSumitMember}>Submit</Button>
                    </ModalBody>
                </ModalContent>}
            </Modal>
        </>
    )
}
export default UserProfilePage

