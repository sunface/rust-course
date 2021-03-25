import { Box, Divider, Heading, HStack, Image, Tag, Text, VStack } from "@chakra-ui/react"
import Comments from "components/comments/comments"
import { MarkdownRender } from "components/markdown-editor/render"
import { StoryAuthor } from "components/story/story-author"
import TagTextCard from "components/story/tag-text-card"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import PostNav from "layouts/nav/post-nav"
import PageContainer from "layouts/page-container"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { Story } from "src/types/story"
import { requestApi } from "utils/axios/request"
import StorySidebar from "components/story/story-sidebar"
import Stroies from "components/story/stories"
import Card from "components/card"
import StoryCard from "components/story/story-card"

const PostPage = () => {
    const router = useRouter()
    const id = router.query.id
    const [series, setSeries]: [Story, any] = useState(null)
    const [posts, setPosts]: [Story[], any] = useState([])
    useEffect(() => {
        if (id) {
            getSeries()
            getSeriesPost()
        }
    }, [id])


    useEffect(() => {
        if (router && router.asPath.indexOf("#comments") > -1) {
            setTimeout(() => {
                location.href = "#comments"
            }, 100)
        }
    }, [router])

    const getSeries = async () => {
        const res = await requestApi.get(`/story/post/${id}`)
        setSeries(res.data)
    }

    const getSeriesPost = async () => {
        const res = await requestApi.get(`/story/series/posts/${id}`)
        setPosts(res.data)
    }

    return (
        <>
            <SEO
                title={siteConfig.seo.title}
                description={siteConfig.seo.description}
            />
            {series && <PageContainer nav={<PostNav post={series} />} mt="2rem">
                <>
                    <HStack alignItems="top" spacing={[0, 0, 14, 14]} mt="8">
                        <Box width={["100%", "100%", "75%", "75%"]} pl={[0, 0, "0%", "10%"]}>
                            <HStack alignItems="top">
                                <Box px="2">
                                    <Image src={series.cover} display={{ base: "block", md: "none" }} mb="4" />
                                    <Tag fontWeight="600">SERIES</Tag>
                                    <Heading size="lg" my="3" lineHeight="1.5">{series.title}</Heading>
                                    <Text>{series.brief}</Text>
                                    <HStack spacing="3" mt="6">{series.rawTags.map(tag => <TagTextCard key={tag.id} tag={tag} />)}</HStack>
                                </Box>
                                {series.cover && <Image src={series.cover} width="400px" display={{ base: "none", md: "block" }} />}

                            </HStack>

                            <VStack mt="4">
                                <Divider mt="8" mb="5"/>
                                <Text position="relative" top="-41px" layerStyle="textSecondary">Articles in this series</Text>
                            </VStack>

                            {posts.length > 0 && <Card>
                                <VStack alignItems="left">
                                    {
                                        posts.map(p => <StoryCard story={p}/>)
                                    }
                                </VStack>
                            </Card>}
                            <Box mt="6"><Comments storyID={series.id} /></Box>
                        </Box>

                        <Box pt="16">
                            <StorySidebar story={series} />
                        </Box>
                    </HStack>

                </>
            </PageContainer>
            }
        </>
    )
}

export default PostPage


