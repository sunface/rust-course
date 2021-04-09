import { Text, Box, Heading, Image, Center, Button, Flex, VStack, Divider, useToast, FormControl, FormLabel, FormHelperText, Input, FormErrorMessage, HStack, Wrap, useMediaQuery, Avatar, Textarea, Table, Thead, Tr, Th, Tbody, Td, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter  } from "@chakra-ui/react"
import Card from "components/card"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { settingLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import { config } from "configs/config"
import { getSvgIcon } from "components/svg-icon"
import { Navbar, NavbarType } from "src/types/user"
import { cloneDeep } from "lodash"
import { IDType } from "src/types/id"
import { Story } from "src/types/story"

const UserNavbarPage = () => {
    return (
        <>
            <PageContainer>
                <Box display="flex">
                    <Sidebar routes={settingLinks} width={["120px", "120px", "250px", "250px"]} height="fit-content" title="博客设置" />
                    <NavbarEditor />
                </Box>
            </PageContainer>
        </>
    )
}
export default UserNavbarPage


export const NavbarEditor = ({ orgID = "" }) => {
    const [navbars, setNavbars]: [Navbar[], any] = useState([])
    const [series, setSeries]: [Story[], any] = useState([])
    const [currentNavbar, setCurrentNavbar]: [Navbar, any] = useState(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    useEffect(() => {
        getNavbars()
        getSeries()
    }, [])

    const getNavbars = async () => {
        const res = await requestApi.get(`/user/navbars/${orgID ? orgID : 0}`)
        setNavbars(res.data)
    }

    const getSeries = async () => {
        let res
        if (orgID) {
            res = await requestApi.get(`/story/posts/org/${orgID}?type=${IDType.Series}`)
        } else {
            res = await requestApi.get(`/story/posts/editor?type=${IDType.Series}`)
        }

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

        if (orgID) {
            await requestApi.post(`/org/navbar/${orgID}`, currentNavbar)
        } else {
            await requestApi.post(`/user/navbar`, currentNavbar)
        }

        setCurrentNavbar(null)
        onClose()
        getNavbars()
    }

    const onAddNavbar = () => {
        setCurrentNavbar({ weight: 0, type: NavbarType.Link, label: "", value: "https://" })
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

    const onNvTypeChange = v => {
        const tp = parseInt(v);
        currentNavbar.type = tp
        if (tp === NavbarType.Link) {
            currentNavbar.value = ""
        } else {
            currentNavbar.value = series[0].id
        }
        onNavbarChange()
    }
    const getSeriesTitle = id => {
        for (const s of series) {
            if (s.id === id) {
                return s.title
            }
        }

        return ""
    }

    const onDeleteNavbar = async id => {
        await requestApi.delete(`/${orgID ? 'org' : 'user'}/navbar/${id}`)
        getNavbars()
    }

    return (
        <>
            <Card ml="4" width="100%">
                <Flex justifyContent="space-between" alignItems="center">
                    <Heading size="sm">菜单设置</Heading>
                    <Button colorScheme="teal" size="sm" onClick={onAddNavbar} _focus={null}>新建菜单项</Button>
                </Flex>
                <Table variant="simple" mt="4">
                    <Thead>
                        <Tr>
                            <Th>Label</Th>
                            <Th>Type</Th>
                            <Th>Value</Th>
                            <Th>Weight</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            navbars.map((nv, i) => <NV  key={nv.id} nv={nv} onEdit={onEditNavbar} onDelete={onDeleteNavbar} getSeriesTitle={getSeriesTitle}/>)
                        }

                    </Tbody>
                </Table>
            </Card>
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
                                <Heading size="xs">Type</Heading>
                                <Select value={currentNavbar.type} onChange={e => onNvTypeChange(e.currentTarget.value)} variant="flushed" _focus={null}>
                                    <option value={NavbarType.Link}>Link</option>
                                    <option value={NavbarType.Series}>Series</option>
                                </Select>
                            </HStack>

                            <HStack spacing="4">
                                <Heading size="xs">Value</Heading>
                                {currentNavbar.type === NavbarType.Link ? <Input value={currentNavbar.value} _focus={null} variant="flushed" onChange={e => { currentNavbar.value = e.currentTarget.value; onNavbarChange() }} /> :
                                    <Select value={currentNavbar.value} variant="flushed" _focus={null} onChange={e => { currentNavbar.value = e.currentTarget.value; onNavbarChange() }}>
                                        {series.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                    </Select>}
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

const NV = ({ nv, onEdit, onDelete, getSeriesTitle }) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const onClose = () => setIsOpen(false)
    const cancelRef = React.useRef()

    return (
        <>
        <Tr>
            <Td>{nv.label}</Td>
            <Td>{nv.type === NavbarType.Link ? "link" : "series"}</Td>
            <Td>{nv.type === NavbarType.Link ? nv.value : getSeriesTitle(nv.value)}</Td>
            <Td>{nv.weight}</Td>
            <Td>
                <IconButton aria-label="edit navbar" variant="ghost" icon={getSvgIcon('edit', ".95rem")} onClick={() => onEdit(nv)} />
                <IconButton aria-label="delete navbar" variant="ghost" icon={getSvgIcon('close', "1rem")} onClick={() => setIsOpen(true)} />
            </Td>
        </Tr>
        <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            删除菜单 -  {nv.label}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={() => onDelete(nv.id)} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}