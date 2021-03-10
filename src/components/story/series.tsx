import React, { useEffect, useState } from "react"
import { Box, Flex, Heading, HStack, Image, Select, StackDivider, Tag, Text, useColorModeValue, VStack } from "@chakra-ui/react"
import { requestApi } from "utils/axios/request"
import userCustomTheme from "theme/user-custom"
import { Story } from "src/types/story"
import { find } from "lodash"
import { getStoryUrl } from "utils/story"
import Link from "next/link"

interface Props {
    postID: string
    series: string[]
}

export const Series = (props: Props) => {
    const [showAll,setShowAll] = useState(false)
    const [currentSeries, setCurrentSeries]: [Story, any] = useState(null)
    const [series, setSeries]: [Story[], any] = useState([])
    const [posts, setPosts]: [Story[], any] = useState([])

    const borderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)

    useEffect(() => {
        getSeries()
    }, [])


    const getSeries = async () => {
        const res = await requestApi.post(`/story/series`, props.series)
        setSeries(res.data)
        if (res.data.length > 0) {
            setCurrentSeries(res.data[0])
            getSeriesPosts(res.data[0].id)
        }
    }

    const getSeriesPosts = async (id) => {
        const res = await requestApi.get(`/story/series/posts/${id}`)
        if (res.data.length > 4) {
            setShowAll(false)
        } else {
            setShowAll(true)
        }
        setPosts(res.data)
    }

    const onSereisChange = e => {
        const s = find(series, s => s.id === e.currentTarget.value)
        setCurrentSeries(s)
        getSeriesPosts(s.id)
    }

    const postInHidden = () => {
        for (let i=0;i<posts.length;i++) {
            if (posts[i].id === props.postID) {
                if (i >= 2) {
                    return true
                }
                return false
            }
        }

        return false
    }

    if (posts.length > 0) {
        return (
            <VStack divider={<StackDivider borderColor={borderColor} />} alignItems="left">
                <Box p="4" pb="0">
                    <Text fontSize="sm" layerStyle="textSecondary">ARTICLE SERIES</Text>
                    {<Select onChange={e => onSereisChange(e)} value={currentSeries?.id} variant="unstyled" width="fit-content">
                        {
                            series.map(s => <option value={s.id} key={s.id}>{s.title}</option>)
                        }
                    </Select>}
                </Box>
                {
                    posts.map((post, i) => {
                        if (showAll) {
                            return <PostCard i={i} post={post} postID={props.postID} />
                        } else {
                            if (i < 2) {
                                return <PostCard i={i} post={post} postID={props.postID} />
                            }
                        }
                    })
                }
                {
                    (!showAll && posts.length > 2) && <HStack p="2" pb="4" spacing="4" cursor="pointer" onClick={() => setShowAll(true)}>
                        <Tag borderRadius="full" size="lg" colorScheme={postInHidden()? 'cyan' : null}>··</Tag>
                        <Heading size="sm" color={postInHidden()? 'cyan.500' : null}>Show all {posts.length-2} posts</Heading>
                    </HStack>
                }
            </VStack>
        )
    } else {
        return null
    }
}

export default Series

function PostCard({ i, post, postID }) {
    return <Flex key={post.id} p="2" spacing="4" justifyContent="space-between" flexDirection={["column", "column", "row", "row"]}>
        <HStack mr="4" spacing="4" alignItems="top">
            <Tag borderRadius="full" size="lg" colorScheme={post.id === postID ? 'cyan' : null} height="fit-content">{i + 1}</Tag>
            <Link href={getStoryUrl(post)}>
                <Box cursor="pointer" pt="1">
                    <Heading size="sm">{post.title}</Heading>
                    <Text mt="3">{post.brief.substring(0, 100)}</Text>
                </Box>
            </Link>
        </HStack>

        {post.cover && <Image src={post.cover} mt={[4, 4, 0, 0]} height={["275px", "275px", "130px", "130px"]} width={["100%", "100%", "200px", "250px"]} />}
    </Flex>
}