import { Box, Button, chakra, Divider, Flex, Heading, HStack, Image, Radio, RadioGroup, Stack, Tag, Text, Tooltip} from "@chakra-ui/react"
import Comments from "components/comments/comments"
import { MarkdownRender } from "components/markdown-editor/render"
import  { StoryAuthor } from "components/story/story-author"
import TagTextCard from "components/story/tag-text-card"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import PostNav from "layouts/nav/post-nav"
import PageContainer from "layouts/page-container"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { Story, StoryStatus } from "src/types/story"
import { requestApi } from "utils/axios/request"
import StorySidebar from "components/story/story-sidebar"
import Series from "components/story/series"
import Card from "components/card"
import { FaFlag, FaRegFlag } from "react-icons/fa"
import Head from "next/head"
import { getSvgIcon } from "components/svg-icon"
import Report from "components/report"

const PostPage = () => {
  const router = useRouter()
  const id = router.query.post_id
  const [post, setPost]: [Story, any] = useState(null)
  const [series,setSeries] = useState([])
  const [report,setReport] = useState(false)
  useEffect(() => {
    if (id) {
      getData()
      getSeries()
    }
  }, [id])


  useEffect(() => {
    if (router && router.asPath.indexOf("#comments") > -1) {
      setTimeout(() => {
        location.href = "#comments"
      }, 100)
    }
  }, [router])

  const getData = async () => {
    const res = await requestApi.get(`/story/post/${id}`)
    setPost(res.data)
  }

  const getSeries = async () => {
    const res = await requestApi.get(`/story/series/byPostID/${id}`)
    setSeries(res.data)
  }
  
  return (
    <>
      <SEO
        title={siteConfig.seo.title}
        description={siteConfig.seo.description}
      />
      {post && <PageContainer nav={<PostNav post={post} />} mt="2rem">
        <>
          <HStack alignItems="top" spacing={[0, 0, 14, 14]}>
            <Box width={["100%", "100%", "75%", "75%"]} height="fit-content" pl={[0, 0, "0%", "10%"]}>
              <Image src={post.cover} />
              <Box px="2">
                <HStack>
                  <Heading size="lg" my="6" lineHeight="1.5">{post.title}</Heading>
                  {post.status === StoryStatus.Forbidden && <Tooltip label="因为文章内容问题，你的文章已经被禁用，如需恢复，请修改内容后，发送邮件到官方邮箱"><Tag colorScheme="red">已禁用</Tag></Tooltip>}
                </HStack>


                <Divider my="4" />
                <Flex width="100%" justifyContent="space-between" display="flex" alignItems="start" layerStyle="textSecondary" cursor="pointer" onClick={() => setReport(true)}>
                  <StoryAuthor story={post} />
                  <HStack>
                    <FaRegFlag />
                    <Text>Report</Text>
                  </HStack>
                </Flex>
                <Divider my="4" />

                {report && <Report targetID={post.id} onClose={() => setReport(false)}/>}
                <MarkdownRender md={post.md} py="2" mt="6" />
              </Box>
              <HStack ml="2" spacing="3" mt="4">{post.rawTags.map(tag => <TagTextCard key={tag.id} tag={tag} />)}</HStack>

              {series.length > 0 && <Card p="0" mt="4"><Series postID={post.id} series={series}/></Card>}
              <Box mt="6" p="2"><Comments storyID={post.id} /></Box>
            </Box>
            <Box pt="16">
              <StorySidebar story={post} />
            </Box>
          </HStack>

        </>
      </PageContainer>
      }
    </>
  )
}

export default PostPage


