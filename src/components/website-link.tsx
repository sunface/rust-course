import React from "react"
import { Box, BoxProps, Flex, useColorModeValue ,Text, Link, HStack} from "@chakra-ui/react"
import { FaGithub, FaGlobeAsia, FaGreaterThan, FaLink, FaLocationArrow, FaTwitter } from "react-icons/fa"
import userCustomTheme from "theme/user-custom"

interface Props {
   type: string
   url: string
}

export const WebsiteLink = ({type, url,...rest}: Props) => {
  let icon0 
  let title
  switch (type) {
      case "github":
            title= "Github"
            icon0 = <FaGithub />
          break;
      case "twitter":
          title = "Twitter"
          icon0 = <FaTwitter />
          break;
      default:
          title = "Official website"
          icon0 = <FaGlobeAsia />
          break;
  }
  return (
    <Flex justifyContent="space-between" alignItems="center" cursor="pointer" as="a" href={url} target="_blank" py="1" px="2" layerStyle="textSecondary" fontSize="1.1rem" {...rest} className="hover-bg">
        <HStack>
            {icon0}
            <Text ml="2">{title}</Text>
        </HStack>

        <FaLocationArrow fontSize="13px" />
    </Flex>
  )
} 

export default WebsiteLink
