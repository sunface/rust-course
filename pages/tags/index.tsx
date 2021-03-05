import {
  chakra, Flex, Heading, HStack, Text, VStack, Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Divider
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

const tagsFilter = [{
  name: 'Popular',
  desc: 'Extremely active tags in terms of posts in the last 7 days.'
},
{
  name: "Recently Added",
  desc: "Tags that are recently added, sorted from newest to oldest."
},
{
  name: "Most Followers",
  desc: "Tags with the maximum number of followers and posts all time.",
},
{
  name: "New Proposals",
  desc: "Follow these tags to cast your vote. We periodically approve tags based on community interest."
}
]

const TagsPage = () => {
  const [filter, setFilter] = useState(tagsFilter[0])
  const [tags, setTags]: [Tag[], any] = useState([])
  const getTags = () => {
    requestApi.get(`/tag/all`).then((res) => setTags(res.data)).catch(_ => setTags([]))
  }

  useEffect(() => {
    getTags()
  }, [filter])

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
                  {tags.map(t => <TagCard key={t.id} tag={t}/>)}
              </VStack>
            </Card>
          </VStack>
          <HomeSidebar />
        </HStack>
      </PageContainer1>
    </>
  )
}

export default TagsPage

