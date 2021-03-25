import React, { useEffect, useState } from "react"
import { Box, Center, Text, useColorModeValue, VStack } from "@chakra-ui/react"
import { Story } from "src/types/story"
import StoryCard from "./story-card"
import userCustomTheme from "theme/user-custom"
import useInfiniteScroll from 'src/hooks/use-infinite-scroll'
import { concat } from "lodash"
import Empty from "components/empty"

interface Props {
    card?: any
    size?: 'sm' | 'md'
    showFooter?: boolean
    showPinned?: boolean
    type?: string
    highlight?: string
    showOrg?: boolean
    onLoad?: any
    filter?: string
}


export const Stroies = (props: Props) => {
    const { card = StoryCard, showFooter = true, type = "classic", showPinned = false, showOrg = true, onLoad, filter } = props
    const [posts, setPosts] = useState([])
    const [noMore, setNoMore] = useState(false)
    
    const [isFetching, setIsFetching] = useInfiniteScroll(fetchMoreListItems);
    const borderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)
    const [page, setPage] = useState(1)

    const Card = card

    useEffect(() => {
        setPosts([])
        setNoMore(false)
        setPage(1)
        onLoad(1).then(res => {
            if (res.data.length < 5) {
                setNoMore(true)
            }
            setPosts(res.data)
        })
    }, [filter])

    function fetchMoreListItems() {
        if (noMore) {
            //@ts-ignore
            setIsFetching(false)
            return
        }
        setPage(page + 1)
        onLoad(page + 1).then(res => {
            if (res.data.length < 5) {
                setNoMore(true)
            }
            setPosts(concat(posts, ...res.data))
        }
        )
        //@ts-ignore
        setIsFetching(false)
    }

    const showBorder = i => {
        if (i < posts.length - 1) {
            return true
        }

        if (showFooter) {
            return true
        } else {
            return false
        }
    }

    return (
        <>
            {
                posts.length === 0 ? <Empty /> :
                    <>
                        <VStack alignItems="left">
                            {posts.map((story, i) =>
                                <Box py="2" borderBottom={showBorder(i) ? `1px solid ${borderColor}` : null} key={story.id} px="1">
                                    <Card story={story} size={props.size} type={type} highlight={props.highlight} showPinned={showPinned} showOrg={showOrg} />
                                </Box>)}
                        </VStack>
                        {isFetching && 'Fetching more list items...'}
                        {noMore && <Center><Text layerStyle="textSecondary" fontSize="sm" py="4">没有更多文章了</Text></Center>}
                    </>
            }
        </>
    )
}

export default Stroies
