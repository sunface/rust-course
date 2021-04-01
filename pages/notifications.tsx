import {
    Heading, HStack, Text, VStack, 
    Divider,
    Wrap,
    Image,
    useColorModeValue,
    Box,
    StackDivider,
    Tag
  } from "@chakra-ui/react"
  import SEO from "components/seo"
  import siteConfig from "configs/site-config"
  import PageContainer1 from "layouts/page-container1"
  import React, { useEffect, useState } from "react"
  import { IndexSidebar } from 'pages/index'
  import Card from "components/card"
  import { config } from "configs/config"
  import { requestApi } from "utils/axios/request"
import { Story } from "src/types/story"
import { find } from "lodash"
import Empty from "components/empty"
import StoryCard from "components/story/story-card"
import { FaBell } from "react-icons/fa"
import { getSvgIcon } from "components/svg-icon"
import { Notification } from "src/types/notification"
import { getUserName } from "utils/user"
import moment from 'moment'
import userCustomTheme from "theme/user-custom"
import Link from "next/link"

const filters = [
  {icon: 'bell',label:'All',type: 0},
  {icon: 'comments',label:'Comments',type: 1},
  {icon: 'favorites',label:'Likes', type: 2},
  {icon: 'follow',label:'Follows', type: 5},
  {icon: 'at',label: 'Mentions', type: 3},
  {icon: 'post',label: 'Stories', type: 4},
]
  
  const NotificationPage = () => {
    const [filter, setFilter]= useState(filters[0])
    const [notifications,setNotifications]: [Notification[],any] = useState([])
    const stackBorderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)
    
    useEffect(() => {
      initData()
    },[])

    const initData = async () => {
      await getNotifications()
      await requestApi.post(`/notifications/unread`)
    }

    const getNotifications = async (f?) => {
      const res = await requestApi.get(`/notifications/list/${f ? f.type : filter.type}`)
      setNotifications(res.data)
    }

    const onFilterChange = (f) => {
      setFilter(f)
      getNotifications(f)
    }
    
    return (
      <>
        <SEO
          title={siteConfig.seo.title}
          description={siteConfig.seo.description}
        />
        <PageContainer1>
          <HStack alignItems="top" p="4" spacing="3">
            <VStack alignItems="left" width={["100%", "100%", "70%", "70%"]} spacing="3">
              <Card>
                <HStack spacing="3">
                  <Heading size="md">Notifications</Heading>
                  {getSvgIcon("bell")}
                </HStack>
              </Card>
  
              <Card p="0">
                {<Wrap pt="4" pb="1" pl="4" alignItems="center">
                    {
                        filters.map(t => 
                        <HStack px="2" py="1" spacing="1" mr="2" cursor="pointer" key={t.label} className={t.label===filter?.label ?"tag-bg": null} onClick={() => onFilterChange(t)}>
                            <Text fontSize=".9rem">{t.label}</Text>
                            {getSvgIcon(t.icon,'1rem')}
                        </HStack>)
                    }
                </Wrap>}
                <Divider mt="3" mb="5" />
                {notifications.length !== 0 
                    ? 
                    <VStack alignItems="left" px="4" spacing="5" pb="4" divider={<StackDivider borderColor={stackBorderColor} />}>
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
                    :
                    <Empty />
                }
              </Card>
            </VStack>
            <IndexSidebar />
          </HStack>
        </PageContainer1>
      </>
    )
  }
  
  export default NotificationPage
  
  