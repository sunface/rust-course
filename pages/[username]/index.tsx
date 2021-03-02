import { Box, chakra, Flex, HStack, VStack ,Image, Heading, Text, Button, useColorModeValue} from "@chakra-ui/react"
import Card from "components/card"
import Container from "components/container"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import useSession from "hooks/use-session"
import Nav from "layouts/nav/nav"
import VerticalNav from "layouts/nav/vertical-nav"
import PageContainer from "layouts/page-container"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { FaEdit, FaPlus } from "react-icons/fa"
import { User } from "src/types/session"
import { requestApi } from "utils/axios/request"

const UserPage = () => {
  const router = useRouter()
  const username = router.query.username
  const session = useSession()
  const [user,setUser]:[User,any] = useState(null)
  const borderColor = useColorModeValue('white','transparent')
  useEffect(() => {
    if (username) {
      requestApi.get(`/user/info/${username}`).then(res => setUser(res.data))
    }
  },[username])
  return (
  <>
    <SEO
      title={siteConfig.seo.title}
      description={siteConfig.seo.description}
    />
    <Flex px={[0,0,16,16]}>
      <VerticalNav width={["100px","100px","200px","200px"]}/>
      <Box width="100%" ml={["100px","100px","200px","200px"]}>
        {
          user && 
          <VStack alignItems="left">
            <Card p="0">
              <Box backgroundImage={`url(${user.cover})`} height="300px" width="100%" backgroundSize="cover" backgroundPosition="center"/>
              <VStack maxHeight="190px">
                <Image src={user.avatar} height="140px" borderRadius="50%" border={`4px solid ${borderColor}`} position="relative" top="-66px" left="-140px"/>
                <Box position="relative" top="-130px">
                  <Heading fontSize="1.8rem">{user.nickname}</Heading>
                  <Text layerStyle="textSecondary" fontWeight="450" fontSize="1.3rem" ml="1" mt="2">{user.tagline}</Text>
                  {session?.user.id === user.id ? 
                    <Button variant="ghost" ml="-15px" mt="6" leftIcon={<svg height="1.3rem" fill="currentColor" viewBox="0 0 512 512"><path d="M493.255 56.236l-37.49-37.49c-24.993-24.993-65.515-24.994-90.51 0L12.838 371.162.151 485.346c-1.698 15.286 11.22 28.203 26.504 26.504l114.184-12.687 352.417-352.417c24.992-24.994 24.992-65.517-.001-90.51zm-95.196 140.45L174 420.745V386h-48v-48H91.255l224.059-224.059 82.745 82.745zM126.147 468.598l-58.995 6.555-30.305-30.305 6.555-58.995L63.255 366H98v48h48v34.745l-19.853 19.853zm344.48-344.48l-49.941 49.941-82.745-82.745 49.941-49.941c12.505-12.505 32.748-12.507 45.255 0l37.49 37.49c12.506 12.506 12.507 32.747 0 45.255z"></path></svg>}>Edit Profile</Button>  
                    :<Button variant="outline" leftIcon={<FaPlus />} colorScheme="teal" mt="6">Follow</Button>}
                </Box>
              </VStack>
            </Card>
          </VStack>
        }
      </Box>
    </Flex>
  </>
)}

export default UserPage

