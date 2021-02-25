import { Box, Button, chakra, Flex, Heading, HStack, Image, Text } from "@chakra-ui/react"
import Card from "components/card"
import Container from "components/container"
import { MarkdownRender } from "components/markdown-editor/render"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import useSession from "hooks/use-session"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { ReserveUrls } from "src/data/reserve-urls"
import { Tag } from "src/types/tag"
import { requestApi } from "utils/axios/request"
import { isAdmin } from "utils/role"

const UserPage = () => {
    const router = useRouter()

    const [tag, setTag]: [Tag, any] = useState({})
    const getTag = async () => {
        const res = await requestApi.get(`/tag/${router.query.name}`)
        setTag(res.data)
    }
    useEffect(() => {
        if (router.query.name) {
            getTag()
        }
    }, [router.query.name])

    const session = useSession()

    return (
        <>
            <SEO
                title={siteConfig.seo.title}
                description={siteConfig.seo.description}
            />
            <PageContainer>
                {tag.name && <HStack alignItems="top" spacing="4">
                    <Box width="70%">
                        <Card p="0">
                            <Image src={tag.cover} />
                            <Image src={tag.icon} width="80px" position="relative" top="-40px" left="40px"/>
                            <Flex justifyContent="space-between" alignItems="center" px="8" pb="6" mt="-1rem">
                                <Box>
                                    <Heading size="lg">{tag.title}</Heading>
                                    <Text layerStyle="textSecondary" fontWeight="500" fontSize="1.2rem" mt="1" ml="1">#{tag.name}</Text>
                                </Box>
                                <Box>
                                    <Button colorScheme="teal">Follow</Button>
                                    {isAdmin(session.user.role) && <Button ml="2" onClick={() => router.push(`${ReserveUrls.Admin}/tag/${tag.name}`)}>Edit</Button>}
                                </Box>
                            </Flex>

                        </Card>
                    </Box>
                    <Box width="30%">
                        <Card>
                            <Flex justifyContent="space-between" alignItems="center" px={[0,2,4,8]}>
                                <Box>
                                    <Heading size="lg">59.8K</Heading>
                                    <Text layerStyle="textSecondary" fontWeight="500" fontSize="1.2rem" mt="1" ml="1">Followers</Text>
                                </Box>

                                <Box>
                                    <Heading size="lg">{tag.postCount}</Heading>
                                    <Text layerStyle="textSecondary" fontWeight="500" fontSize="1.2rem" mt="1" ml="1">Posts</Text>
                                </Box>
                            </Flex>
                        </Card>

                        <Card mt="4">
                            <Heading size="sm">About this tag</Heading>
                            <Box mt="2"><MarkdownRender md={tag.md} fontSize="1rem"></MarkdownRender></Box>
                        </Card>
                    </Box>
                </HStack>}
            </PageContainer>
        </>
    )
}

export default UserPage

