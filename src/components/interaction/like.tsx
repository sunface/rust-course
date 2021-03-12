import { chakra, HStack, IconButton, Tooltip} from "@chakra-ui/react";
import Count from "components/count";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { requestApi } from "utils/axios/request";

interface Props {
  storyID: string
  count: number
  liked: boolean
  fontSize?: string
  spacing?: string
}
const Like = (props: Props) => {
  const {fontSize="20px",spacing="0"} = props
  const label = "I like it"

  const [liked,setLiked] = useState(props.liked)
  const [count,setCount] = useState(props.count)
  const like = async () => {
    await requestApi.post(`/interaction/like/${props.storyID}`)
    

    if (liked) {
      setCount(count-1)
    } else {
      setCount(count+1)
    }

    setLiked(!liked)
  }

  return (
    <HStack alignItems="center" spacing={spacing}>
      <Tooltip label={label} size="sm">
          {liked? <IconButton
          aria-label="go to github"
          variant="ghost"
          _focus={null}
          color="red.400"
          icon={<FaHeart />}
          onClick={like}
          fontSize={fontSize}
        /> :
        <IconButton
          aria-label="go to github"
          variant="ghost"
          _focus={null}
          color="gray.500"
          icon={<FaRegHeart />}
          onClick={like}
          fontSize={fontSize}
        />}
        
      </Tooltip>
      <chakra.span opacity="0.8" fontSize={props.fontSize}><Count count={count} /></chakra.span>
    </HStack>
  )
}

export default Like