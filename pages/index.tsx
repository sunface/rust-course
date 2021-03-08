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
import Posts from "components/story/posts"
import SimplePostCard from "components/story/simple-post-card"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import PageContainer1 from "layouts/page-container1"
import React, { useEffect, useState } from "react"
import { requestApi } from "utils/axios/request"

import { SearchFilter } from "src/types/search"
import SearchFilters from "components/search-filters"

const HomePage = () => {
  let filter:string
  const [posts, setPosts] = useState([])
  const initData = async () => {
    const res = await requestApi.get(`/story/posts/home/${filter}`)
    setPosts(res.data)
  }

  useEffect(() => {
    initData()
  }, [])

  const onFilterChange = filter => {

  }

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
                <SearchFilters onChange={onFilterChange}/>
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
            <Card width="100%" height="fit-content" p="0">
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
  const initData = async () => {
    const res = await requestApi.get(`/story/posts/home/aa`)
    setPosts(res.data)
  }

  useEffect(() => {
    initData()
  }, [])

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