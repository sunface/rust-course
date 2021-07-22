import { Avatar, Box, Button, Flex, Heading, HStack, Image, Text, useToast, VStack } from "@chakra-ui/react"
import Card from "components/card"
import Empty from "components/empty"
import { MarkdownRender } from "components/markdown-editor/render"
import Stories from "components/story/stories"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import useSession from "hooks/use-session"
import PageContainer1 from "layouts/page-container1"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { ReserveUrls } from "src/data/reserve-urls"
import { Story } from "src/types/story"
import { Tag } from "src/types/tag"
import { requestApi } from "utils/axios/request"
import { isAdmin } from "utils/role"
import Follow from "components/interaction/follow"
import Count from "components/count"
import StoryFilters from "components/story/story-filter"
import { UserSimple } from "src/types/user"
import Users from "components/users/users"
import Head from "next/head"
import { getUserName } from "utils/user"
import Link from "next/link"
import { getSvgIcon } from "components/svg-icon"
import { SearchFilter } from "src/types/search"

const UserPage = () => {
    const router = useRouter()
    const toast = useToast()

    const [tag, setTag]: [Tag, any] = useState(null)
    const [moderators,setModerators]:[UserSimple[],any] = useState([])
    const [followed, setFollowed] = useState(null)
    useEffect(() => {
        if (tag) {
            requestApi.get(`/interaction/followed/${tag.id}`).then(res => setFollowed(res.data))
            requestApi.get(`/tag/moderators/${tag.id}`).then(res => setModerators(res.data))
        }
    }, [tag])

    const [filter, setFilter] = useState(SearchFilter.Latest)
    const initPosts = (p) => {
        return requestApi.get(`/tag/posts/${tag.id}?filter=${filter}&page=${p}&per_page=5`)
    }

    const onFilterChange = f => {
        setFilter(f)
    }

    const initData = async () => {
        const res = await requestApi.get(`/tag/info/${router.query.name}`)
        setTag(res.data)
    }

    useEffect(() => {
        if (router.query.name) {
            initData()
        }
    }, [router.query.name])

    const {session} = useSession()

    const isModerator = () => {
        if (isAdmin(session?.user.role)) {
            return true
        }

        for (const m of moderators) {
            if (m.id === session?.user.id) {
                return true
            }
        }

        return false
    }

    const removeStory = async id => {
       await requestApi.delete(`/tag/story/${tag.id}/${id}`)
       toast({
            description: "从标签移除成功，刷新页面可看到效果",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }
    return (
        <>
            <SEO
                title={siteConfig.seo.title}
                description={siteConfig.seo.description}
            />
            <PageContainer1>
                {tag && tag.name &&
                    <HStack alignItems="top" spacing="4" p="2">
                        <VStack width={["100%", "100%", "70%", "70%"]} alignItems="left" spacing="2">
                            <Card p="0">
                                <Image src={tag.cover} maxHeight="250px" />
                                <Image src={tag.icon} width="80px" position="relative" top="-40px" left="40px" className="shadowed" />
                                <Flex justifyContent="space-between" alignItems="center" px="8" pb="6" mt="-1rem">
                                    <Box>
                                        <Heading size="lg">{tag.title}</Heading>
                                        <Text layerStyle="textSecondary" fontWeight="500" fontSize="1.2rem" mt="1" ml="1">#{tag.name}</Text>
                                    </Box>
                                    <Box>
                                        {followed !== null && <Follow followed={followed} targetID={tag.id} />}
                                        {session && isModerator() && <Button ml="2" onClick={() => router.push(`${ReserveUrls.Admin}/tag/${tag.name}`)}>Edit</Button>}
                                    </Box>
                                </Flex>

                            </Card>
                            <Card p="2">
                                <StoryFilters showBest={false} onChange={onFilterChange} value={SearchFilter.Latest}/>
                            </Card>
                            <Card width="100%" height="fit-content" p="0" px="3">
                                {tag.id &&  
                                    <Stories onLoad={initPosts} filter={filter} onRemove={removeStory}/>
                                }
                            </Card>
                        </VStack>
                        <VStack width="30%" alignItems="left" spacing="2" display={{ base: "none", md: "flex" }}>
                            <Card>
                            <Flex layerStyle="textSecondary" spacing="2" pt="1" alignItems="center">
                                    <Box width="50%">
                                        <Heading size="lg"><Count count={tag.follows} /></Heading>
                                        <Text layerStyle="textSecondary" fontWeight="500" fontSize="1.2rem" mt="1" ml="1">Followers</Text>
                                    </Box>

                                    <Box width="50%">
                                        <Heading size="lg"><Count count={tag.posts} /></Heading>
                                        <Text layerStyle="textSecondary" fontWeight="500" fontSize="1.2rem" mt="1" ml="1">Posts</Text>
                                    </Box>
                                </Flex>
                            </Card>

                            <Card mt="4">
                                <HStack><Heading size="sm">About this tag </Heading></HStack>
                                <Box mt="2"><MarkdownRender md={tag.md} fontSize="1rem"></MarkdownRender></Box>
                            </Card>

                            {moderators.length > 0 && <Card mt="4">
                                <HStack>
                                    <Heading size="sm">Tag moderators</Heading>
                                    {session && isAdmin(session.user.role) && <Box cursor="pointer" onClick={() => router.push(`/admin/tags`)}>{getSvgIcon('edit','.9rem')}</Box>}
                                </HStack>
                                <VStack alignItems="left" mt="4">
                                    {moderators.map(m => <a href={`/${m.username}`} target="_blank">
                                        <HStack cursor="pointer">
                                        <Avatar width="45px" height="45px" src={m.avatar}/>
                                        <Heading size="sm">{getUserName(m)}</Heading>
                                    </HStack>
                                    </a>)}
                                </VStack>
                                
                            </Card>}
                        </VStack>
                    </HStack>}
            </PageContainer1>
        </>
    )
}

export default UserPage

