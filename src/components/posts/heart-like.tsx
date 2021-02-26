import { chakra, HStack, IconButton, Image, Tooltip, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface Props {
  count: number
  onClick: any
  liked: boolean
}
const UnicornLike = (props: Props) => {
  const label = "I like it"
  return (
    <HStack alignItems="center">
      <Tooltip label={label} size="sm">
          {props.liked? <IconButton
          aria-label="go to github"
          variant="ghost"
          _focus={null}
          color="red.400"
          icon={<FaHeart />}
          onClick={props.onClick}
          fontSize="20px"
        /> :
        <IconButton
          aria-label="go to github"
          variant="ghost"
          _focus={null}
          color="gray.500"
          icon={<FaRegHeart />}
          onClick={props.onClick}
          fontSize="20px"
        />}
        
      </Tooltip>
      <chakra.span layerStyle="textSecondary" fontWeight="600">{props.count}</chakra.span>
    </HStack>
  )
}

export default UnicornLike