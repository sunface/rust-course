import { Text, Box, Heading, Image, Center, Button, Flex, VStack, Divider, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, useDisclosure, Input, HStack } from "@chakra-ui/react"
import Card from "components/card"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
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
import Users from "components/users/users"
import { UserSimple } from "src/types/user"
import { getUserName } from "utils/user"


const PostsPage = () => {
    const [tags, setTags] = useState([])
    const [moderators, setModerators]: [UserSimple[], any] = useState([])
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [tempModerator, setTempModerator] = useState("")
    const [tempTag, setTempTag] = useState(null)
    const router = useRouter()
    const toast = useToast()
    const getTags = () => {
        requestApi.get(`/tag/all`).then((res) => setTags(res.data)).catch(_ => setTags([]))
    }

    useEffect(() => {
        getTags()
    }, [])

    const editTag = (tag: Tag) => {
        router.push(`${ReserveUrls.Admin}/tag/${tag.name}`)
    }

    const deleteTag = async (id) => {
        await requestApi.delete(`/tag/id/${id}`)
        getTags()
        toast({
            description: "删除成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        })
    }

    const openModerators = async (tag: Tag) => {
        await queryModerators(tag.id)
        setTempTag(tag)
        onOpen()
    }

    const queryModerators = async (id) => {
        const res = await requestApi.get(`/tag/moderators/${id}`)
        setModerators(res.data)
    }
    const addModerator = async () => {
        await requestApi.post(`/tag/moderator`, { tagID: tempTag.id, username: tempModerator })
        setTempModerator("")
        await queryModerators(tempTag.id)
    }

    const deleteModerator = async (id) => {
        await requestApi.delete(`/tag/moderator/${tempTag.id}/${id}`)
        await queryModerators(tempTag.id)
    }
    return (
        <>
            <PageContainer1>
                <Box display="flex">
                    <Sidebar routes={adminLinks} title="管理员" />
                    <Card ml="4" p="6" width="100%">
                        <Flex alignItems="center" justify="space-between">
                            <Heading size="md">标签列表({tags.length})</Heading>
                            <Button colorScheme="teal" size="sm" _focus={null}><Link href={`${ReserveUrls.Admin}/tag/new`}>新建标签</Link></Button>
                        </Flex>
                        {
                            tags.length === 0 ?
                                <Empty />
                                :
                                <>
                                    <VStack mt="4">
                                        {tags.map(tag =>
                                            <Box width="100%" key={tag.id}>
                                                <TagCard tag={tag} showActions={true} mt="4" onEdit={() => editTag(tag)} onModerator={() => openModerators(tag)} onDelete={() => deleteTag(tag.id)} />
                                                <Divider mt="5" />
                                            </Box>
                                        )}
                                    </VStack>
                                    <Center><Text layerStyle="textSecondary" fontSize="sm" mt="5">没有更多标签了</Text></Center>
                                </>
                        }
                    </Card>
                </Box>
            </PageContainer1>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>编辑moderators</ModalHeader>
                    <ModalBody mb="2">
                        <HStack>
                            <Input _focus={null} value={tempModerator} onChange={e => setTempModerator(e.currentTarget.value)} placeholder="输入username来添加" />
                            <Button colorScheme="teal" onClick={addModerator}>Add</Button>
                        </HStack>

                        <VStack alignItems="left" mt="4" spacing="4">
                            {moderators.map((u, i) =>

                                <Flex alignItems="center" justifyContent="space-between">
                                    <Link href={`/${u.username}`}>
                                        <HStack spacing="4" cursor="pointer">
                                            <Image src={u.avatar} width="42px" height="42px" />
                                            <VStack alignItems="left">
                                                <Heading fontSize="1rem">{u.nickname}</Heading>
                                                <Text fontSize=".9rem">@{u.username}</Text>
                                            </VStack>
                                        </HStack>
                                    </Link>
                                    <Button size="sm" onClick={() => deleteModerator(u.id)}>Delete</Button>
                                </Flex>
                            )}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}
export default PostsPage

