import { Box, Button, chakra, Flex, Heading, HStack, Image, Text, VStack } from "@chakra-ui/react"
import Card from "components/card"
import Container from "components/container"
import Empty from "components/empty"
import { MarkdownRender } from "components/markdown-editor/render"
import Posts from "components/story/posts"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import useSession from "hooks/use-session"
import Nav from "layouts/nav/nav"
import PageContainer from "layouts/page-container"
import PageContainer1 from "layouts/page-container1"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { ReserveUrls } from "src/data/reserve-urls"
import { Post } from "src/types/posts"
import { Tag } from "src/types/tag"
import { requestApi } from "utils/axios/request"
import { isAdmin } from "utils/role"
import Follow from "components/interaction/follow"
import Count from "components/count"

const UserPage = () => {
    const router = useRouter()

    const [posts, setPosts]: [Post[], any] = useState([])
    const [tag, setTag]: [Tag, any] = useState(null)

    const [followed, setFollowed] = useState(null)
    useEffect(() => {
        if (tag) {
            requestApi.get(`/interaction/followed/${tag.id}`).then(res => setFollowed(res.data))
        }
    }, [tag])

    
    const initData = async () => {
        const res = await requestApi.get(`/tag/info/${router.query.name}`)
        setTag(res.data)

        const res1 = await requestApi.get(`/tag/posts/${res.data.id}`)
        setPosts(res1.data)
    }

    useEffect(() => {
        if (router.query.name) {
            initData()
        }
    }, [router.query.name])

    const session = useSession()
    return (
        <>
            <SEO
                title={siteConfig.seo.title}
                description={siteConfig.seo.description}
            />
            <PageContainer1>
                {tag && tag.name &&
                    <HStack alignItems="top" spacing="4" p="2">
                        <VStack width={["100%","100%","70%","70%"]} alignItems="left" spacing="2">
                            <Card p="0">
                                <Image src={tag.cover} maxHeight="250px"/>
                                <Image src={tag.icon} width="80px" position="relative" top="-40px" left="40px" className="shadowed"/>
                                <Flex justifyContent="space-between" alignItems="center" px="8" pb="6" mt="-1rem">
                                    <Box>
                                        <Heading size="lg">{tag.title}</Heading>
                                        <Text layerStyle="textSecondary" fontWeight="500" fontSize="1.2rem" mt="1" ml="1">#{tag.name}</Text>
                                    </Box>
                                    <Box>
                                        {followed !== null && <Follow followed={followed} targetID={tag.id}/>}
                                        {isAdmin(session?.user.role) && <Button ml="2" onClick={() => router.push(`${ReserveUrls.Admin}/tag/${tag.name}`)}>Edit</Button>}
                                    </Box>
                                </Flex>

                            </Card>
                            {
                                posts.length === 0 ?
                                    <Card width="100%" height="fit-content">
                                        <Empty />
                                    </Card>
                                    :
                                    <Card width="100%" height="fit-content" p="0" px="3">
                                        <Posts posts={posts} />
                                    </Card>
                            }
                        </VStack>
                        <VStack width="30%" alignItems="left" spacing="2" display={{base: "none",md:"flex"}}> 
                            <Card>
                                <Flex justifyContent="space-between" alignItems="center" px={[0, 2, 4, 8]}>
                                    <Box>
                                        <Heading size="lg"><Count count={tag.follows}/></Heading>
                                        <Text layerStyle="textSecondary" fontWeight="500" fontSize="1.2rem" mt="1" ml="1">Followers</Text>
                                    </Box>

                                    <Box>
                                        <Heading size="lg"><Count count={tag.posts} /></Heading>
                                        <Text layerStyle="textSecondary" fontWeight="500" fontSize="1.2rem" mt="1" ml="1">Posts</Text>
                                    </Box>
                                </Flex>
                            </Card>

                            <Card mt="4">
                                <Heading size="sm">About this tag</Heading>
                                <Box mt="2"><MarkdownRender md={tag.md} fontSize="1rem"></MarkdownRender></Box>
                            </Card>
                        </VStack>
                    </HStack>}
            </PageContainer1>
        </>
    )
}

export default UserPage

