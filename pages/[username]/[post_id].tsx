import { Box, chakra, Divider, Flex, Heading, HStack, IconButton, Image, storageKey, VStack } from "@chakra-ui/react"
import Comments from "components/comments/comments"
import Container from "components/container"
import LikeButton from "components/story/unicorn-like"
import { MarkdownRender } from "components/markdown-editor/render"
import PostAuthor from "components/story/post-author"
import TagTextCard from "components/story/tag-text-card"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import useSession from "hooks/use-session"
import Nav from "layouts/nav/nav"
import PostNav from "layouts/nav/post-nav"
import PageContainer from "layouts/page-container"
import { cloneDeep } from "lodash"
import { useRouter } from "next/router"
import { title } from "process"
import React, { useEffect, useState } from "react"
import { FaBookmark, FaGithub, FaRegBookmark, FaShare, FaShareAlt } from "react-icons/fa"
import { ReserveUrls } from "src/data/reserve-urls"
import { Comment } from "src/types/comments"
import { Post } from "src/types/posts"
import { Tag } from "src/types/tag"
import { requestApi } from "utils/axios/request"
import UnicornLike from "components/story/unicorn-like"
import SvgButton from "components/svg-button"
import Bookmark from "components/story/bookmark"
import PostSidebar from "components/story/post-sidebar"

const PostPage = () => {
  const router = useRouter()
  const id = router.query.post_id
  const [post, setPost]: [Post, any] = useState(null)
  useEffect(() => {
    if (id) {
      getData()
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
                <Heading size="lg" my="6" lineHeight="1.5">{post.title}</Heading>

                <Divider my="4" />
                <PostAuthor post={post} />
                <Divider my="4" />

                <MarkdownRender md={post.md} py="2" mt="6" />
              </Box>
              <HStack ml="2" spacing="3" mt="4">{post.rawTags.map(tag => <TagTextCard key={tag.id} tag={tag} />)}</HStack>

              <Box mt="6" p="2"><Comments storyID={post.id} /></Box>
            </Box>
            <Box pt="16">
              <PostSidebar post={post} />
            </Box>
          </HStack>

        </>
      </PageContainer>
      }
    </>
  )
}

export default PostPage


