import { chakra, HStack, IconButton, Image, Tooltip, useColorMode, useColorModeValue } from "@chakra-ui/react";
import SvgButton from "components/svg-button";
import { useState } from "react";
import { FaBan, FaHeart, FaRegHeart } from "react-icons/fa";
import { Story, StoryStatus } from "src/types/story";
import { requestApi } from "utils/axios/request";

interface Props {
    story: Story
}

const Forbidden = (props: Props) => {
    const { story } = props
    const [status,setStatus] = useState(story.status)
   
    const forbiddenStory = async () => {
        await requestApi.post(`/story/forbidden/${story.id}`)
        if (status != StoryStatus.Forbidden) {
            setStatus(StoryStatus.Forbidden)
        } else {
            setStatus(StoryStatus.Draft)
        }
    }

    return (
        <IconButton
            aria-label="a icon button"
            variant="ghost"
            _focus={null}
            layerStyle="textSecondary"
            onClick={forbiddenStory}
            icon={<FaBan fontSize="1.4rem" color={status === StoryStatus.Forbidden ? 'red' : null} />}
        />
    )
}

export default Forbidden