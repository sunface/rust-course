import { chakra, HStack, IconButton, Image, Tooltip, useColorMode, useColorModeValue } from "@chakra-ui/react";

interface Props {
  count: number
  onClick: any
  liked: boolean
}
const UnicornLike = (props: Props) => {
  const imgSrc = "https://cdn.hashnode.com/res/hashnode/image/upload/v1594643772437/FYDU5k2kQ.png?auto=compress"
  const label = "I love it"
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
          border={props.liked ? `1px solid ${useColorModeValue('gray', 'pink')}` : null}
        />
      </Tooltip>
      <chakra.span layerStyle="textSecondary" fontWeight="600" marginBottom="-3px">{props.count}</chakra.span>
    </HStack>
  )
}

export default UnicornLike