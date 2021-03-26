import { Text, Box, Heading, Image, Center, Button, Flex, VStack, Divider, useToast, FormControl, FormLabel, FormHelperText, Input, FormErrorMessage, HStack, Wrap, useMediaQuery, Avatar, Textarea, Table, Thead, Tr, Th, Tbody, Td, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react"
import Card from "components/card"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { adminLinks, settingLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import { config } from "configs/config"
import { getSvgIcon } from "components/svg-icon"
import { Navbar, NavbarType } from "src/types/user"
import { cloneDeep } from "lodash"
import { IDType } from "src/types/id"
import { Story } from "src/types/story"
import PageContainer1 from "layouts/page-container1"
import { HomeSidebar } from "src/types/misc"
import { SearchFilter } from "src/types/search"

const SidebarsPage = () => {
    const [sidebars, setSidebars]:[HomeSidebar[],any] = useState([])
    const [currentSidebar, setCurrentSidebar]: [HomeSidebar, any] = useState(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    useEffect(() => {
        getSidebars()
    }, [])

    const getSidebars = async () => {
        const res = await requestApi.get("/sidebars")
        setSidebars(res.data)
    }


    const submitNavbar = async () => {
        await requestApi.get(`/tag/info/${currentSidebar.tagName}`)
        await requestApi.post(`/sidebar`, currentSidebar)
        setCurrentSidebar(null)
        onClose()
        getSidebars()
    }

    const onAddNavbar = () => {
        setCurrentSidebar({tagName: "", sort: SearchFilter.Recent , displayCount:5, weight: 0})
        onOpen()
    }

    const onEditNavbar = nav => {
        setCurrentSidebar(nav)
        onOpen()
    }

    const onSidebarChange = () => {
        const nv = cloneDeep(currentSidebar)
        setCurrentSidebar(nv)
    }

    const onDeleteNavbar = async id => {
        requestApi.delete(`/sidebar/${id}`)
        setTimeout( () => getSidebars(),300)
    }

    return (
        <>
            <PageContainer1>
                <Box display="flex">
                    <Sidebar routes={adminLinks} width={["120px", "120px", "250px", "250px"]} height="fit-content" title="管理员" />
                    <Card ml="4" width="100%">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Heading size="sm">侧边栏设置</Heading>
                            <Button colorScheme="teal" size="sm" onClick={onAddNavbar} _focus={null}>新建侧边栏</Button>
                        </Flex>
                        <Table variant="simple" mt="4">
                            <Thead>
                                <Tr>
                                    <Th>Tag Name</Th>
                                    <Th>Sort</Th>
                                    <Th>Display count</Th>
                                    <Th>Weight</Th>
                                    <Th></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {
                                    sidebars.map((nv,i) =>   <Tr key={i}>
                                        <Td>{nv.tagName}</Td>
                                        <Td>{nv.sort}</Td>
                                        <Td>{nv.displayCount}</Td>
                                        <Td>{nv.weight}</Td>
                                        <Td>
                                            <IconButton aria-label="edit navbar" variant="ghost" icon={getSvgIcon('edit', ".95rem")} onClick={() => onEditNavbar(nv)}/>
                                            <IconButton aria-label="delete navbar" variant="ghost" icon={getSvgIcon('close', "1rem")} onClick={() => onDeleteNavbar(nv.id)} />
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
                {currentSidebar && <ModalContent>
                    <ModalHeader>{currentSidebar.tagName ? "编辑侧边栏" : "新建侧边栏"}</ModalHeader>
                    <ModalBody mb="2">
                        <VStack spacing="4" alignItems="left">
                            <HStack spacing="4">
                                <Heading size="xs" width="150px">Tag name</Heading>
                                <Input value={currentSidebar.tagName} _focus={null} variant="flushed" onChange={e => { currentSidebar.tagName = e.currentTarget.value; onSidebarChange() }}></Input>
                            </HStack>

                            {/* <HStack spacing="4">
                                <Heading size="xs" width="150px">Sort</Heading>
                                <Input value={currentSidebar.sort} _focus={null} variant="flushed" onChange={e => { currentSidebar.value = e.currentTarget.value; onSidebarChange() }}  placeholder="enter a url, e.g /search"/> 
                            </HStack> */}

                            <HStack spacing="4">
                                <Heading size="xs" width="105px">Display count</Heading>
                                <NumberInput min={0} max={10} value={currentSidebar.displayCount} variant="flushed" onChange={e => { currentSidebar.displayCount = parseInt(e); onSidebarChange() }}>
                                    <NumberInputField _focus={null} />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </HStack>

                            <HStack spacing="4">
                                <Heading size="xs" width="105px">Weight</Heading>
                                <NumberInput min={0} max={10} value={currentSidebar.weight} variant="flushed" onChange={e => { currentSidebar.weight = parseInt(e); onSidebarChange() }}>
                                    <NumberInputField _focus={null} />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </HStack>
                        </VStack>
                        <Button colorScheme="teal" variant="outline" mt="6" onClick={submitNavbar}>提交</Button>
                    </ModalBody>
                </ModalContent>}
            </Modal>
        </>
    )
}
export default SidebarsPage

