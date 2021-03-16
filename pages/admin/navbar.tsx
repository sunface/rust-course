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

const UserNavbarPage = () => {
    const [navbars, setNavbars]:[Navbar[],any] = useState([])
    const [series, setSeries]: [Story[], any] = useState([])
    const [currentNavbar, setCurrentNavbar]: [Navbar, any] = useState(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    useEffect(() => {
        getNavbars()
        getSeries()
    }, [])

    const getNavbars = async () => {
        const res = await requestApi.get("/navbars")
        setNavbars(res.data)
    }

    const getSeries = async () => {
        const res = await requestApi.get(`/story/posts/editor?type=${IDType.Series}`)
        setSeries(res.data)
    }

    const submitNavbar = async () => {
        if (!currentNavbar.label || !currentNavbar.value) {
            toast({
                description: "值不能为空",
                status: "error",
                duration: 2000,
                isClosable: true,
            })
            return 
        }

        if (currentNavbar.label.length > config.user.navbarMaxLen) {
            toast({
                description: `Label长度不能超过${config.user.navbarMaxLen}`,
                status: "error",
                duration: 2000,
                isClosable: true,
            })
            return 
        }


        await requestApi.post(`/navbar`, currentNavbar)
        setCurrentNavbar(null)
        onClose()
        getNavbars()
    }

    const onAddNavbar = () => {
        setCurrentNavbar({ weight: 0, type: NavbarType.Link, label: "", value: "" })
        onOpen()
    }

    const onEditNavbar = nav => {
        setCurrentNavbar(nav)
        onOpen()
    }

    const onNavbarChange = () => {
        const nv = cloneDeep(currentNavbar)
        setCurrentNavbar(nv)
    }

    const onDeleteNavbar = async id => {
        requestApi.delete(`/navbar/${id}`)
        setTimeout( () => getNavbars(),300)
    }

    return (
        <>
            <PageContainer1>
                <Box display="flex">
                    <Sidebar routes={adminLinks} width={["120px", "120px", "250px", "250px"]} height="fit-content" title="博客设置" />
                    <Card ml="4" width="100%">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Heading size="sm">菜单设置</Heading>
                            <Button colorScheme="teal" size="sm" onClick={onAddNavbar} _focus={null}>新建菜单项</Button>
                        </Flex>
                        <Table variant="simple" mt="4">
                            <Thead>
                                <Tr>
                                    <Th>Label</Th>
                                    <Th>Value</Th>
                                    <Th>Weight</Th>
                                    <Th></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {
                                    navbars.map((nv,i) =>   <Tr key={i}>
                                        <Td>{nv.label}</Td>
                                        <Td>{nv.value}</Td>
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
                {currentNavbar && <ModalContent>
                    <ModalHeader>{currentNavbar.label ? "编辑菜单项" : "新建菜单项"}</ModalHeader>
                    <ModalBody mb="2">
                        <VStack spacing="4" alignItems="left">
                            <HStack spacing="4">
                                <Heading size="xs">Label</Heading>
                                <Input value={currentNavbar.label} _focus={null} variant="flushed" onChange={e => { currentNavbar.label = e.currentTarget.value; onNavbarChange() }}></Input>
                            </HStack>

                            <HStack spacing="4">
                                <Heading size="xs">Value</Heading>
                                <Input value={currentNavbar.value} _focus={null} variant="flushed" onChange={e => { currentNavbar.value = e.currentTarget.value; onNavbarChange() }}  placeholder="enter a url, e.g /search"/> 
                            </HStack>

                            <HStack spacing="4">
                                <Heading size="xs">Weight</Heading>
                                <NumberInput min={0} max={10} value={currentNavbar.weight} variant="flushed" onChange={e => { currentNavbar.weight = parseInt(e); onNavbarChange() }}>
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
export default UserNavbarPage

