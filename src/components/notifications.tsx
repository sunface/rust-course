import React, { useEffect, useState } from "react"
import { Box, Center, Heading, HStack, Image, Link, StackDivider, Tag, Text, useColorModeValue, VStack } from "@chakra-ui/react"

import userCustomTheme from "theme/user-custom"
import useInfiniteScroll from 'src/hooks/use-infinite-scroll'
import { concat } from "lodash"
import Empty from "src/components/empty"
import { Notification } from "src/types/notification"
import moment from 'moment'
import { getUserName } from "utils/user"

interface Props {
    onLoad?: any
    filter?: any
}
 

export const Notifications = (props: Props) => {
    const { onLoad, filter } = props
    const [notifications,setNotifications]: [Notification[],any] = useState([])
    const [noMore, setNoMore] = useState(false)
    
    const [isFetching, setIsFetching] = useInfiniteScroll(fetchMoreListItems);
    const [page, setPage] = useState(1)
    const stackBorderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)

    useEffect(() => {
        setNotifications([])
        setNoMore(false)
        setPage(1)
        onLoad(1).then(res => {
            if (res.data.length < 10) {
                setNoMore(true)
            }
            setNotifications(res.data)
        })
    }, [filter])

    function fetchMoreListItems() {
        if (page === 1 && notifications.length === 0) {
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
            setNotifications(concat(notifications, ...res.data))
        }
        )
        //@ts-ignore
        setIsFetching(false)
    }


    return (
        <>
            {notifications.length !== 0 
                    ? 
                    <>
                    <VStack alignItems="left" px="4" spacing="4" pb="4" divider={<StackDivider borderColor={stackBorderColor} />}>
                       {notifications.map((p,i) => 
                        <HStack  key={i} alignItems="top" spacing="4">
                           <Image src={p.user.avatar} height="45px"/>
                           <VStack alignItems="left" >
                              <HStack>
                                <Link href={`/${p.user.username}`}><Heading fontSize="1rem" cursor="pointer">{getUserName(p.user)}</Heading></Link>
                                <Text >{p.title}</Text>
                              </HStack>
                              {p.subTitle && <Link href={`/${p.user.username}/${p.storyID}`}><Heading size="sm" color="teal" cursor="pointer">{p.subTitle}</Heading></Link>}
                              <Text fontSize=".8rem" layerStyle="textSecondary">{moment(p.created).fromNow()} {!p.read&& <Tag size="sm" colorScheme="orange">unread</Tag>}</Text>
                           </VStack>
                        </HStack>)}
                    </VStack>
                        {noMore && <Center><Text layerStyle="textSecondary" fontSize="sm" py="4">没有更多消息了</Text></Center>}
                    </>
                    :
                    <Empty />
                }
        </>
    )
}

export default Notifications
