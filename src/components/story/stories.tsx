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
        if (page === 1 && posts.length === 0) {
            // 走到这里面说明视图逻辑出问题了，你可以这样触发
            // 进入tag或者个人页面，然后把文章拉到第二页
            // 此时点击tag，会瞬间同时加载第一页和第二页的文章
            // 因为第一页的文章还没加载完毕，没有更新posts，第二页的文章就会覆盖掉第一页的数据
            // 这样第一页的数据就丢失了

            // 走到该函数意味着已经是第二页的加载逻辑了，在此时posts不应该为空
            //@ts-ignore
            setIsFetching(false)
            return 
        }
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
