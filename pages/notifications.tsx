import {
    Heading, HStack, Text, VStack, 
    Divider,
    Wrap,
  } from "@chakra-ui/react"
  import SEO from "components/seo"
  import siteConfig from "configs/site-config"
  import PageContainer1 from "layouts/page-container1"
  import React, { useEffect, useState } from "react"
  import { IndexSidebar } from 'pages/index'
  import Card from "components/card"
  import { requestApi } from "utils/axios/request"
import { getSvgIcon } from "components/svg-icon"
import Notifications from "components/notifications"

const filters = [
  {icon: 'bell',label:'All',type: 0},
  {icon: 'comments',label:'System',type: 7},
  {icon: 'comments',label:'Comments',type: 1},
  {icon: 'favorites',label:'Likes', type: 2},
  {icon: 'follow',label:'Follows', type: 5},
  // {icon: 'at',label: 'Mentions', type: 3},
  {icon: 'post',label: 'Stories', type: 4},
]
  
  const NotificationPage = () => {
    const [filter, setFilter]= useState(filters[0])
    
    useEffect(() => {
      initData()
    },[])

    const initData = async () => {
      await requestApi.post(`/notifications/unread`)
    }

    const getNotifications = async (p) => {
      const res = await requestApi.get(`/notifications/list/${filter.type}?page=${p}`)
      return res
    }

    const onFilterChange = (f) => {
      setFilter(f)
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
               <Notifications onLoad={getNotifications} filter={filter}/>
              </Card>
            </VStack>
            <IndexSidebar />
          </HStack>
        </PageContainer1>
      </>
    )
  }
  
  export default NotificationPage
  
  