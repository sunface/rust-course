import { Text, Box, Heading, Image, Center, Button, Flex, VStack, Divider, useToast, FormControl, FormLabel, FormHelperText, Input, FormErrorMessage, HStack, Wrap, useMediaQuery, Avatar, Textarea, } from "@chakra-ui/react"
import Card from "components/card"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import { adminLinks, settingLinks } from "src/data/links"
import { requestApi } from "utils/axios/request"
import { useRouter } from "next/router"
import { Field, Form, Formik } from "formik"
import { config } from "configs/config"
import Tags from "components/tags/tags"
var validator = require('validator');

const UserNavbarPage = () => {
    const [user, setUser] = useState(null)
    const [skills, setSkills] = useState([])
    const [isLargerThan1280] = useMediaQuery("(min-width: 768px)")
    useEffect(() => {
        requestApi.get("/user/self").then(res => setUser(res.data))
    }, [])
    const router = useRouter()
    const toast = useToast()

    const submitUser = async (values, _) => {
        await requestApi.post(`/user/update`, values)
        setUser(values)
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

    const Layout = isLargerThan1280 ? HStack : VStack
    return (
        <>
            <PageContainer>
                <Box display="flex">
                    <Sidebar routes={settingLinks} width={["120px", "120px", "250px", "250px"]} height="fit-content" title="博客设置" />
                    {user && <Card ml="4" width="100%">
                       <Heading></Heading>
                    </Card>}
                </Box>
            </PageContainer>
        </>
    )
}
export default UserNavbarPage

