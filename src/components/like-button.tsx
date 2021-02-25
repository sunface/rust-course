import { chakra, HStack, IconButton, Image, Tooltip, useColorMode, useColorModeValue } from "@chakra-ui/react";

interface Props {
  type: string
  count: number
  onClick: any
  liked: boolean
}
const LikeButton = (props: Props) => {
  let imgSrc: string
  let label: string
  switch (props.type) {
    case "like":
      imgSrc = "https://cdn.hashnode.com/res/hashnode/image/upload/v1594643814744/9iXxz71TL.png?auto=compress"
      label = "Love it"
      break;
    case "unicorn":
      imgSrc = "https://cdn.hashnode.com/res/hashnode/image/upload/v1594643772437/FYDU5k2kQ.png?auto=compress"
      label = "I love it"
    default:
      break;
  }
  return (
    <HStack>
      <Tooltip label={label} size="sm">
        <IconButton
          aria-label="go to github"
          variant="ghost"
          color="current"
          _focus={null}
          icon={<Image width="38px" src={imgSrc} />}
          onClick={props.onClick}
          border={props.liked ? `1px solid ${useColorModeValue('gray','pink')}` : null}
        />
      </Tooltip>
      <chakra.span layerStyle="textSecondary" fontWeight="600" marginBottom="-3px">{props.count}</chakra.span>
    </HStack>
  )
}

export default LikeButton