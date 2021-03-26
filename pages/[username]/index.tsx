import { Box, chakra, Flex, HStack, VStack, Image, Heading, Text, Button, useColorModeValue, Divider, Wrap, Avatar, Center, useDisclosure, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, StackDivider, Stack, ModalHeader } from "@chakra-ui/react"
import Card from "components/card"
import Container from "components/container"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import useSession from "hooks/use-session"
import PageContainer1 from "layouts/page-container1"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { FaFacebook, FaFile, FaGithub, FaHeart, FaPlus, FaRegStar, FaStackOverflow, FaStar, FaTwitter, FaWeibo, FaZhihu } from "react-icons/fa"
import { ReserveUrls } from "src/data/reserve-urls"
import { Navbar, NavbarType, User } from "src/types/user"
import { requestApi } from "utils/axios/request"
import moment from 'moment'
import { Story } from "src/types/story"
import Stories from "components/story/stories"
import Link from "next/link"
import Empty from "components/empty"
import Count from "components/count"
import { Tag } from "src/types/tag"
import { IDType } from "src/types/id"
import UserCard from "components/users/user-card"
import userCustomTheme from "theme/user-custom"
import SearchFilters from "components/search-filters"
import Follow from "components/interaction/follow"
import { SearchFilter } from "src/types/search"

const UserPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()
  const username = router.query.username
  const nav = router.query.nav
  const session = useSession()
  const [user, setUser]: [User, any] = useState(null)
  const [tags, setTags]: [Tag[], any] = useState([])
  const [tagFilter, setTagFilter]: [string, any] = useState("")
  const [followers, setFollowers]: [User[], any] = useState([])
  const [navbars,setNavbars]:[Navbar[],any] = useState([])
  const borderColor = useColorModeValue('white', 'transparent')
  const stackBorderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)
  useEffect(() => {
    if (username) {
      initData(username)

    }
  }, [username])

  const loadStories  = (p) => {
    return user.type === IDType.User ?  requestApi.get(`/user/posts/${user.id}?filter=${tagFilter}&page=${p}&per_page=5`) : requestApi.get(`/story/posts/org/${user.id}?type=0&filter=${tagFilter}&page=${p}&per_page=5`)
  }

  const initData = async (username) => {
    const res = await requestApi.get(`/user/info/${username}`)
    setUser(res.data)

    getTags(res.data.id)
    getNavbars(res.data.id)
  }

  const getNavbars = async userID => {
    const res = await requestApi.get(`/user/navbars/${userID}`)
    setNavbars(res.data)
  }

  const getTags = async (userID) => {
    const res = await requestApi.get(`/tag/user/${userID}`)
    setTags(res.data)
  }



  const viewFollowers = async tp => {
    let res
    if (tp === 1) {
      // followings
      const res0 = await requestApi.get(`/interaction/following/${user.id}?type=${user.id.substring(0,1)}`)
      const ids = []
      for (const f of res0.data) {
        ids.push(f.id)
      }


      res = await requestApi.post(`/user/ids`, ids)
    } else if (tp === 0) {
      // followers
      res = await requestApi.get(`/interaction/followers/${user.id}?type=${user.id.substring(0,1)}`)
    } else if (tp === 2) {
      // org members
      res = await requestApi.get(`/org/members/${user.id}`)
    }
    setFollowers(res.data)
    if (res.data.length > 0) {
      onOpen()
    }
  }

  const isSubNavActive = (id) => {
    return id === nav
  }

  const onChangeTagFilter = id => {
    if (id === tagFilter) {
      setTagFilter("")
    } else {
      setTagFilter(id)
    }
  }

  return (
    <>
      <SEO
        title={siteConfig.seo.title}
        description={siteConfig.seo.description}
      />
      <PageContainer1 p="0">
        {
          user &&
          <Box alignItems="left" pb="6">
            <Card p="0" borderTop="none">
              <Box backgroundImage={`url(${user.cover})`} height="300px" width="100%" backgroundSize="cover" backgroundPosition="center" />
              <VStack maxHeight={user.tagline? "205px" : "165px"} position="relative" top="-70px" spacing="3">
                <Image src={user.avatar} height="130px" borderRadius="50%" border={`4px solid ${borderColor}`} />
                <Heading size="lg">{user.nickname}</Heading>
                {user.tagline && <Text layerStyle="textSecondary" fontWeight="450" fontSize="1.2rem" ml="1" mt="2">{user.tagline}</Text>}

                <HStack pt="3" spacing="5">
                  <Link href={`/${username}`}>
                    <Box cursor="pointer" fontWeight={isSubNavActive(undefined) ? "bold" : "550"} layerStyle={isSubNavActive(undefined) ? null : "textSecondary"}>
                      HOME
                    </Box>
                  </Link>
                   
                  {
                    navbars.map((nv,i) => 
                    <Link key={i} href={nv.type === NavbarType.Link ? nv.value : `${ReserveUrls.Series}/${nv.value}`}>
                      <Box cursor="pointer" fontWeight={isSubNavActive('react') ? "bold" : "550"} layerStyle={isSubNavActive('react') ? null : "textSecondary"}>
                        {nv.label}
                      </Box>
                    </Link>)
                  }
             

                </HStack>

                <Box pt="3" position="absolute" right="15px" top="60px">{session?.user.id === user.id ? <Button onClick={() => router.push(`${ReserveUrls.Settings}/profile`)} variant="outline" leftIcon={<svg height="1.3rem" fill="currentColor" viewBox="0 0 512 512"><path d="M493.255 56.236l-37.49-37.49c-24.993-24.993-65.515-24.994-90.51 0L12.838 371.162.151 485.346c-1.698 15.286 11.22 28.203 26.504 26.504l114.184-12.687 352.417-352.417c24.992-24.994 24.992-65.517-.001-90.51zm-95.196 140.45L174 420.745V386h-48v-48H91.255l224.059-224.059 82.745 82.745zM126.147 468.598l-58.995 6.555-30.305-30.305 6.555-58.995L63.255 366H98v48h48v34.745l-19.853 19.853zm344.48-344.48l-49.941 49.941-82.745-82.745 49.941-49.941c12.505-12.505 32.748-12.507 45.255 0l37.49 37.49c12.506 12.506 12.507 32.747 0 45.255z"></path></svg>}><chakra.span display={{ base: "none", md: "block" }}>Edit Profile</chakra.span></Button>
                  : <Follow followed={user.followed} targetID={user.id}/>}</Box>


              </VStack>
            </Card>
            <HStack spacing={[0, 0, 4, 4]} mt="4" alignItems="top">
              <VStack alignItems="left" spacing="4" width="350px" display={{ base: "none", md: "flex" }}>
                <Card>
                <Flex layerStyle="textSecondary" spacing="2" pt="1" alignItems="center">
                  <Box width="50%">
                    <Heading size="sm">Followers</Heading>
                    <Text mt="1" cursor="pointer" onClick={() => viewFollowers(0)}><Count count={user.follows} /></Text>
                  </Box>

                  <Box  width="50%">
                    <Heading size="sm">{user.type === IDType.User ? "Following" : "Members"}</Heading>
                    <Text mt="1" cursor="pointer" onClick={user.type === IDType.User ? () => viewFollowers(1) : () => viewFollowers(2)}><Count count={user.followings ?? 0} /></Text>
                  </Box>
                </Flex>
                </Card>
                <Card>
                  {user.about &&
                    <>
                      <Text layerStyle="textSecondary">{user.about}</Text>
                      <Divider my="4" />
                    </>}
                  {user.location && <HStack>
                    <chakra.span layerStyle="textSecondary" width="90px">Location: </chakra.span>
                    <chakra.span fontWeight="500" ml="2">{user.location}</chakra.span>
                  </HStack>}

                  {user.website && <HStack mt="1">
                    <chakra.span layerStyle="textSecondary" width="90px">Website: </chakra.span>
                    <chakra.a fontWeight="500" ml="2" href={user.website} target="_blank">{user.website}</chakra.a>
                  </HStack>}

                  {user.email && <HStack mt="1">
                    <chakra.span layerStyle="textSecondary" width="90px">联系邮箱: </chakra.span>
                    <chakra.a fontWeight="500" ml="2" href={user.email} target="_blank">{user.email}</chakra.a>
                  </HStack>}

                  <HStack mt="1">
                    <chakra.span layerStyle="textSecondary" width="90px">{user.type === IDType.User ? "Joined" : "Created"}: </chakra.span>
                    <chakra.span fontWeight="500" ml="2">{moment(user.created).fromNow()}</chakra.span>
                  </HStack>

                  <HStack layerStyle="textSecondary" fontSize="1.4rem" mt={(user.github || user.twitter || user.facebook || user.stackoverflow || user.weibo || user.zhihu) ? 4 : 0} spacing="5">
                    {user.github && <chakra.a href={user.github} target="_blank"><FaGithub /></chakra.a>}
                    {user.twitter && <chakra.a href={user.twitter} target="_blank"><FaTwitter /></chakra.a>}
                    {user.facebook && <chakra.a href={user.facebook} target="_blank"><FaFacebook /></chakra.a>}
                    {user.stackoverflow && <chakra.a href={user.stackoverflow} target="_blank"><FaStackOverflow /></chakra.a>}
                    {user.zhihu && <chakra.a href={user.zhihu} target="_blank"><FaZhihu /></chakra.a>}
                    {user.weibo && <chakra.a href={user.weibo} target="_blank"><FaWeibo /></chakra.a>}
                  </HStack>

                  {user.availFor && <Box>
                    <Divider my="4" />
                    <Text fontWeight="600" layerStyle="textSecondary">I am available for</Text>
                    <Text mt="2">{user.availFor}</Text>
                  </Box>}
                </Card>
                {user.rawSkills?.length > 0 && <Card>
                  <Heading size="sm" layerStyle="textSecondary" fontWeight="500">{user.type === IDType.User ? "擅长技术" : "组织技术栈"}</Heading>
                  <Wrap mt="4" p="1">
                    {
                      user.rawSkills.map(skill =>
                        <Link key={skill.id} href={`${ReserveUrls.Tags}/${skill.name}`}>
                          <HStack spacing="1" mr="4" mb="2" cursor="pointer">
                            <Avatar src={skill.icon} size="sm" />
                            <Text>{skill.title}</Text>
                          </HStack>
                        </Link>)
                    }
                  </Wrap>
                </Card>}

                {tags.length > 0 && <Card>
                  <Heading size="sm" layerStyle="textSecondary" fontWeight="500">博客标签</Heading>
                  <Wrap mt="4" p="1">
                    {
                      tags.map(tag =>
                        <Button key={tag.id} size="sm" variant="text" p="0" onClick={() => onChangeTagFilter(tag.id)} _focus={null}>
                          <Box className={tagFilter === tag.id ? "tag-bg" : null} py="2" px="1">{tag.name} &nbsp; {tag.posts}</Box>
                        </Button>
                      )
                    }
                  </Wrap>
                </Card>}
              </VStack>



              <Box width={["100%", "100%", "70%", "70%"]}>
                  <Card width="100%" height="fit-content" p="0">
                    {user.id && <Stories onLoad={p => loadStories(p)} showPinned={true} showOrg={user.type === IDType.User} filter={tagFilter}/>}
                  </Card>
              </Box>


            </HStack>
          </Box>
        }
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
          <ModalOverlay />
          <ModalContent mt="0">
            <ModalBody maxHeight="calc(100vh - 200px)" overflowY="scroll" >
              <VStack alignItems="left" divider={<StackDivider borderColor={stackBorderColor} />} >

                {followers.map(user =>
                  <UserCard user={user} />
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </PageContainer1>
    </>
  )
}

export default UserPage

