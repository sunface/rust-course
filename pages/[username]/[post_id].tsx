import { Box, chakra, Divider, Flex, Heading, HStack, IconButton, Image, VStack } from "@chakra-ui/react"
import Comments from "components/comments/comments"
import Container from "components/container"
import LikeButton from "components/posts/unicorn-like"
import { MarkdownRender } from "components/markdown-editor/render"
import PostAuthor from "components/posts/post-author"
import TagTextCard from "components/posts/tag-text-card"
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
import UnicornLike from "components/posts/unicorn-like"

const PostPage = () => {
  const router = useRouter()
  const id = router.query.post_id
  const [post, setPost]: [Post, any] = useState(null)
  const [comments,setComments]: [Comment[],any] = useState([])
  const session = useSession()
  useEffect(() => {
    if (id) {
      getData()
    }
  }, [id])

  const getData = async () => {
    const res = await requestApi.get(`/post/${id}`)
    setPost(res.data)

    getComments(res.data.id)
  }

  const onLike = async () => {
    await requestApi.post(`/story/like/${post.id}`)
    const p = cloneDeep(post)

    if (post.liked) {
      p.likes += -1
      p.liked = false
    } else {
      p.likes += 1
      p.liked = true
    }
    setPost(p)
  }

  const getComments = async (id) => {
    const res = await requestApi.get(`/story/comments/${id}`)
    console.log(res.data)
    setComments(res.data)
  }

  return (
    <>
      <SEO
        title={siteConfig.seo.title}
        description={siteConfig.seo.description}
      />
      <PageContainer nav={<PostNav />} mt="2rem">
        {post &&
          <>
            <HStack alignItems="top" spacing={[0, 0, 14, 14]}>
              <Box width={["100%", "100%", "75%", "75%"]} height="fit-content" pl={[0,0,"0%","10%"]}>
                <Image src={post.cover} />
                <Box px="2">
                  <Heading size="xl" my="6" lineHeight="1.5">{post.title}</Heading>

                  <Divider my="4" />
                  <PostAuthor post={post} />
                  <Divider my="4" />

                  <MarkdownRender md={post.md} py="2" mt="6" />
                </Box>
                <HStack ml="4" spacing="3">{post.rawTags.map(tag => <TagTextCard tag={tag}/>)}</HStack>

                <Box mt="6" p="2"><Comments storyID={post.id} comments={comments} onChange={() => getComments(post.id)}/></Box>
              </Box>
              <Box>
                <VStack alignItems="left" pos="fixed" display={{ base: "none", md: 'flex' }} width={["100%", "100%", "15%", "15%"]}>
                  <Box pt="16">
                    {/* <HStack mt="16"> */}
                      {/* <LikeButton type="like" count={post.likes} onClick={onLike} /> */}
                      <UnicornLike count={post.likes} onClick={onLike} liked={post.liked}/>
                    {/* </HStack> */}
                  </Box>
                  <Box>
                    <IconButton
                      mt="6"
                      aria-label="go to github"
                      variant="ghost"
                      layerStyle="textSecondary"
                      _focus={null}
                      fontSize="1.7rem"
                      fontWeight="300"
                      icon={<svg height="1.7rem" fill="currentColor" viewBox="0 0 384 512"><path d="M336 0H48C21.49 0 0 21.49 0 48v464l192-112 192 112V48c0-26.51-21.49-48-48-48zm16 456.287l-160-93.333-160 93.333V48c0-8.822 7.178-16 16-16h288c8.822 0 16 7.178 16 16v408.287z"></path></svg>}
                    />
                    <Box mt="4">
                      <IconButton
                        aria-label="go to github"
                        variant="ghost"
                        layerStyle="textSecondary"
                        _focus={null}
                        fontWeight="300"
                        icon={<svg height="1.7rem" fill="currentColor" viewBox="0 0 448 512"><path d="M352 320c-28.6 0-54.2 12.5-71.8 32.3l-95.5-59.7c9.6-23.4 9.7-49.8 0-73.2l95.5-59.7c17.6 19.8 43.2 32.3 71.8 32.3 53 0 96-43 96-96S405 0 352 0s-96 43-96 96c0 13 2.6 25.3 7.2 36.6l-95.5 59.7C150.2 172.5 124.6 160 96 160c-53 0-96 43-96 96s43 96 96 96c28.6 0 54.2-12.5 71.8-32.3l95.5 59.7c-4.7 11.3-7.2 23.6-7.2 36.6 0 53 43 96 96 96s96-43 96-96c-.1-53-43.1-96-96.1-96zm0-288c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zM96 320c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zm256 160c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"></path></svg>}
                      />
                    </Box>

                    {post.creatorId === session?.user.id &&  <Box mt="4">
                      <IconButton
                        aria-label="go to github"
                        variant="ghost"
                        layerStyle="textSecondary"
                        _focus={null}
                        fontWeight="300"
                        onClick={() => router.push(`${ReserveUrls.Editor}/post/${post.id}`)}
                        icon={<svg height="1.5rem" fill="currentColor" viewBox="0 0 512 512"><path d="M493.255 56.236l-37.49-37.49c-24.993-24.993-65.515-24.994-90.51 0L12.838 371.162.151 485.346c-1.698 15.286 11.22 28.203 26.504 26.504l114.184-12.687 352.417-352.417c24.992-24.994 24.992-65.517-.001-90.51zm-95.196 140.45L174 420.745V386h-48v-48H91.255l224.059-224.059 82.745 82.745zM126.147 468.598l-58.995 6.555-30.305-30.305 6.555-58.995L63.255 366H98v48h48v34.745l-19.853 19.853zm344.48-344.48l-49.941 49.941-82.745-82.745 49.941-49.941c12.505-12.505 32.748-12.507 45.255 0l37.49 37.49c12.506 12.506 12.507 32.747 0 45.255z"></path></svg>}
                      />
                    </Box>}
                  </Box>


                </VStack>

              </Box>
            </HStack>

            <HStack display={{ base: "flex", md: 'none' }} spacing="4" justifyContent="center">
              <Box>
                {/* <LikeButton type="like" count={post.likes} onClick={onLike}/> */}
                <UnicornLike count={post.likes}  onClick={onLike} liked={post.liked}/>
              </Box>
              <Box>
                <IconButton
                  aria-label="go to github"
                  variant="ghost"
                  layerStyle="textSecondary"
                  _focus={null}
                  fontSize="1.7rem"
                  fontWeight="300"
                  icon={<svg height="1.8rem" fill="currentColor" viewBox="0 0 384 512"><path d="M336 0H48C21.49 0 0 21.49 0 48v464l192-112 192 112V48c0-26.51-21.49-48-48-48zm16 456.287l-160-93.333-160 93.333V48c0-8.822 7.178-16 16-16h288c8.822 0 16 7.178 16 16v408.287z"></path></svg>}
                />
                <IconButton
                  aria-label="go to github"
                  variant="ghost"
                  layerStyle="textSecondary"
                  _focus={null}
                  fontWeight="300"
                  icon={<svg height="1.8rem" fill="currentColor" viewBox="0 0 448 512"><path d="M352 320c-28.6 0-54.2 12.5-71.8 32.3l-95.5-59.7c9.6-23.4 9.7-49.8 0-73.2l95.5-59.7c17.6 19.8 43.2 32.3 71.8 32.3 53 0 96-43 96-96S405 0 352 0s-96 43-96 96c0 13 2.6 25.3 7.2 36.6l-95.5 59.7C150.2 172.5 124.6 160 96 160c-53 0-96 43-96 96s43 96 96 96c28.6 0 54.2-12.5 71.8-32.3l95.5 59.7c-4.7 11.3-7.2 23.6-7.2 36.6 0 53 43 96 96 96s96-43 96-96c-.1-53-43.1-96-96.1-96zm0-288c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zM96 320c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zm256 160c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"></path></svg>}
                />
              </Box>
            </HStack>
          </>
        }
      </PageContainer>
    </>
  )
}

export default PostPage

