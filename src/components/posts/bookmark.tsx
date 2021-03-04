import { chakra, HStack, IconButton, Image, Tooltip, useColorMode, useColorModeValue } from "@chakra-ui/react";
import SvgButton from "components/svg-button";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { requestApi } from "utils/axios/request";

interface Props {
  storyID: string
  bookmarked: boolean
  height?: string
}

const Bookmark = (props: Props) => {
    const {storyID, height="1.4rem"} = props

    const [bookmarked,setBookmarked] = useState(props.bookmarked)
    const bookmark = async () => {
        await requestApi.post(`/bookmark/${storyID}`)
        setBookmarked(!bookmarked)
    }
    
  return (
    <SvgButton
        aria-label="bookmark"
        variant="ghost"
        layerStyle="textSecondary"
        _focus={null}
        icon={bookmarked ?"bookmarked" :"bookmark"}
        onClick={bookmark}
        height={height}
    />
  )
}

export default Bookmark