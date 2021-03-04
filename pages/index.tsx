import { AddIcon } from "@chakra-ui/icons"
import {
  Box, Button, chakra, Flex, HStack, VStack, Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Heading,
  Divider
} from "@chakra-ui/react"
import Card from "components/card"
import PostCard from "components/posts/post-card"
import Posts from "components/posts/posts"
import SimplePostCard from "components/posts/simple-post-card"
import SEO from "components/seo"
import { getSvgIcon } from "components/svg-icon"
import siteConfig from "configs/site-config"
import PageContainer1 from "layouts/page-container1"
import React, { useEffect, useState } from "react"
import { PostFilter } from "src/types/posts"
import { requestApi } from "utils/axios/request"

const HomePage = () => {
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState(PostFilter.Best)
  const initData = async () => {
    const res = await requestApi.get(`/home/posts/${filter}`)
    setPosts(res.data)
  }

  useEffect(() => {
    initData()
  }, [filter])

  return (
    <>
      <SEO
        title={siteConfig.seo.title}
        description={siteConfig.seo.description}
      />
      <PageContainer1>
        <HStack alignItems="top" spacing="3">
          <VStack alignItems="left" width={["100%", "100%", "70%", "70%"]} spacing="3">
            <Card p="2">
              <Flex justifyContent="space-between" alignItems="center">
                <HStack>
                  <Button _focus={null} onClick={() => setFilter(PostFilter.Best)} size="sm" colorScheme={filter === PostFilter.Best ? 'teal' : null} leftIcon={getSvgIcon("hot")} variant="ghost" >Best</Button>
                  <Button _focus={null} onClick={() => setFilter(PostFilter.Featured)} size="sm" colorScheme={filter === PostFilter.Featured ? 'teal' : null} leftIcon={getSvgIcon("feature")} variant="ghost">Fetured</Button>
                  <Button _focus={null} onClick={() => setFilter(PostFilter.Recent)} size="sm" colorScheme={filter === PostFilter.Recent ? 'teal' : null} leftIcon={getSvgIcon("recent")} variant="ghost">Recent</Button>
                </HStack>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    icon={<svg fill="none" stroke="currentColor" opacity="0.75" height="1.3rem" viewBox="0 0 55 55"><path d="M2 2h51v21H2V2zm0 30h51v21H2V32z" stroke="stroke-current" strokeWidth="4"></path></svg>}
                    size="xs"
                    variant="ghost"
                    _focus={null}
                  />
                  <MenuList>
                    <MenuItem icon={<svg fill="none" stroke="currentColor" opacity="0.75" height="1.3rem" viewBox="0 0 55 55"><path d="M2 2h51v21H2V2zm0 30h51v21H2V32z" stroke="stroke-current" strokeWidth="4"></path></svg>}>
                      Modern
                  </MenuItem>
                    <MenuItem icon={<svg stroke="currentColor" height="1.2rem" viewBox="0 0 55 55" fill="none"><path d="M2 2h51v11H2V2zm0 40h51v11H2V42zm0-20h51v11H2V22z" stroke="stoke-current" strokeWidth="4"></path></svg>}>
                      Compact
                  </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            </Card>
            <Card width="100%" height="fit-content" p="0" px="3">
              <Posts posts={posts} />
            </Card>
          </VStack>
          <HomeSidebar />
        </HStack>

      </PageContainer1>
    </>
  )
}
export default HomePage


export const HomeSidebar = () => {
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState(PostFilter.Best)
  const initData = async () => {
    const res = await requestApi.get(`/home/posts/${filter}`)
    setPosts(res.data)
  }

  useEffect(() => {
    initData()
  }, [filter])

  return (
    <VStack alignItems="left" width="30%" display={{ base: "none", md: "flex" }}>
      <Card p="0">
        <Flex px="4" py="3" justifyContent="space-between" alignItems="center">
          <Heading size="sm">热榜</Heading>
          <HStack>
            <Button variant="ghost" size="sm">1d</Button>
            <Button variant="ghost" size="sm">1w</Button>
            <Button variant="ghost" size="sm">1m</Button>
          </HStack>
        </Flex>
        <Divider />
        <VStack px="4" pt="3" alignItems="left">
          <Posts posts={posts} card={SimplePostCard} size="sm" showFooter={false}></Posts>
        </VStack>
      </Card>
    </VStack>
  )
}