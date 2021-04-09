import {
  chakra, Flex, Heading, HStack, Text, VStack, Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Divider,
  Box,
  Image
} from "@chakra-ui/react"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import PageContainer1 from "layouts/page-container1"
import React, { useEffect, useState } from "react"
import Card, { CardBody, CardHeader } from "components/card"
import { config } from "configs/config"
import { Tag } from "src/types/tag"
import { requestApi } from "utils/axios/request"
import TagCard from 'src/components/tags/tag-card'
import useSession from "hooks/use-session"
import Link from "next/link"
import { IDType } from "src/types/id"
import { SearchFilter } from "src/types/search"

const tagsFilter = [{
  id: SearchFilter.Best,
  name: 'Popular',
  desc: 'Extremely active tags in terms of posts in the last 7 days.'
},
// {
//   id: SearchFilter.Latest,
//   name: "Recently Added",
//   desc: "Tags that are recently added, sorted from newest to oldest."
// },
{
  id: SearchFilter.Favorites,
  name: "Most Followers",
  desc: "Tags with the maximum number of followers and posts all time.",
}
]

const TagsPage = () => {
  const [filter, setFilter] = useState(tagsFilter[0])
  const [tags, setTags]: [Tag[], any] = useState([])
  const [userTags,setUserTags]:[Tag[],any] = useState([])

  const session = useSession()
  const getTags = () => {
    requestApi.get(`/tag/all?filter=${filter.id}`).then((res) => setTags(res.data)).catch(_ => setTags([]))
  }

  const getUserTags = async () => {
    const res = await requestApi.get(`/interaction/following/${session.user.id}?type=${IDType.Tag}`)
    const ids = []
    for (const f of res.data) {
        ids.push(f.id)
    }

    const res1 = await requestApi.post(`/tag/ids`, ids)
    setUserTags(res1.data)
  }

  useEffect(() => {
    getTags()
  }, [filter])

  useEffect(() => {
    if (session) {
      getUserTags()
    }
  },[session])
  return (
    <>
      <SEO
        title={siteConfig.seo.title}
        description={siteConfig.seo.description}
      />
      <PageContainer1>
        <HStack alignItems="top"  spacing="3">
          <VStack alignItems="left" width={["100%", "100%", "70%", "70%"]} spacing="3">
            <Card>
              <VStack py="3" spacing="3">
                <Heading size="md">Tags On {config.appName}</Heading>
                <Text layerStyle="textSecondary">Join communities on {config.appName}. Follow tags that interest you.</Text>
              </VStack>
            </Card>

            <Card>
              <Flex justifyContent="space-between" alignItems="top" p="3">
                <VStack alignItems="left" width="80%">
                  <Heading size="md">{filter.name}</Heading>
                  <Text fontSize=".9rem">{filter.desc}</Text>
                  <Text fontSize=".9rem" layerStyle="textSecondary">List updated daily at midnight PST.</Text>
                </VStack>
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
                    {
                      tagsFilter.map(f => <MenuItem key={f.name} onClick={() => setFilter(f)}>
                        {f.name}
                      </MenuItem>)
                    }
                  </MenuList>
                </Menu>
              </Flex>

              <Divider mt="3" mb="5" />
              <VStack alignItems="left" spacing="3">
                  {tags.map(t => <TagCard key={t.id} tag={t} unit={filter.id === SearchFilter.Best ? 'posts' : "followers"}/>)}
              </VStack>
            </Card>
          </VStack>
           <Card p="0" width="30%" display={{base: "none", md: "block"}}>
            <CardHeader>
              <Heading size="sm">我关注的Tags</Heading>
            </CardHeader>
            <Divider />
            {userTags.length > 0 && <CardBody>
                <VStack alignItems="left"  spacing="4">
                   {
                     userTags.map(tag => <Link key={tag.id} href={`/tags/${tag.name}`}>
                       <HStack cursor="pointer" spacing="4">
                          {tag.icon && <Image src={tag.icon} width="35px"/>}
                          <Text>#{tag.name}</Text>
                        </HStack>
                     </Link>)
                   }
                </VStack>
            </CardBody>}
          </Card>
        </HStack>
      </PageContainer1>
    </>
  )
}

export default TagsPage

