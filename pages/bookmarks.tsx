import {
    chakra, Flex, Heading, HStack, Text, VStack, Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Divider,
    Wrap,
    Image,
    useColorModeValue
  } from "@chakra-ui/react"
  import SEO from "components/seo"
  import siteConfig from "configs/site-config"
  import PageContainer1 from "layouts/page-container1"
  import React, { useEffect, useState } from "react"
  import { HomeSidebar } from 'pages/index'
  import Card from "components/card"
  import { config } from "configs/config"
  import { getSvgIcon } from "components/svg-icon"
  import { Tag } from "src/types/tag"
  import { requestApi } from "utils/axios/request"
  import TagCard from 'src/components/tags/tag-card'
import { Story } from "src/types/story"
import Stories from "components/story/stories"
import { find } from "lodash"
import userCustomTheme from "theme/user-custom"
import Empty from "components/empty"
  

  
  const BookmarksPage = () => {
    const [filter, setFilter]:[Tag,any] = useState(null)
    const [tags, setTags]: [Tag[], any] = useState([])
    const [rawPosts,setRawPosts]: [Story[],any] = useState([])
    const [posts,setPosts]: [Story[],any] = useState([])

    useEffect(() => {
        getBookmarkPosts()
    }, [])
    
    const getBookmarkPosts = async() => {
        const res = await requestApi.get(`/story/bookmark/posts`)
        setRawPosts(res.data)
        setPosts(res.data)
        const ts = []
        res.data.forEach(post => {
          for (let i=0;i<post.rawTags.length;i++) {
            const tag = post.rawTags[i]
            if (!find(ts, t => t.id === tag.id)) {
              ts.push(tag)
              break
          }
          }
        })
  
        setTags(ts)
      }
    
    const filterPostsByTag = (t:Tag) => {
        if (t.id === filter?.id) {
          setPosts(rawPosts)
          setFilter(null)
          return 
        }

        const newPosts = []
        rawPosts.forEach(post => {
          for (let i=0;i<post.rawTags.length;i++) {
            if (t.id === post.rawTags[i].id) {
              newPosts.push(post)
              break
            }
          }
             
        })

        setPosts(newPosts)
        setFilter(t)
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
                <VStack py="3" spacing="3">
                  <Heading size="md">Bookmarks</Heading>
                  <Text layerStyle="textSecondary">All the discussions, stories and comments you have bookmarked on {config.appName}.</Text>
                </VStack>
              </Card>
  
              <Card p="0">
                <Wrap pt="4" pb="1" pl="4" alignItems="center">
                    {
                        tags.map(t => 
                        <HStack px="2" py="1" spacing="1" mr="3" cursor="pointer" key={t.id} className={t.id===filter?.id ?"tag-bg": null} onClick={() => filterPostsByTag(t)}>
                            <Image src={t.icon} width="30px" height="30px" className="bordered"/>
                            <Text fontSize=".9rem">{t.title}</Text>
                        </HStack>)
                    }
                </Wrap>
                <Divider mt="3" mb="5" />
                {posts.length !== 0 
                    ? 
                    <Stories stories={posts} showFooter={false}/> 
                    :
                    <Empty />
                }
              </Card>
            </VStack>
            <HomeSidebar />
          </HStack>
        </PageContainer1>
      </>
    )
  }
  
  export default BookmarksPage
  
  