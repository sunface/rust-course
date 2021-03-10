import React from "react"
import { Popover, PopoverTrigger, IconButton, PopoverContent, useDisclosure, Stack, Box, Heading, Text, Divider, StackDivider, useColorModeValue, border, Button, Flex } from "@chakra-ui/react"
import { Story } from "src/types/story"
import { FaPlus } from "react-icons/fa"
import userCustomTheme from "theme/user-custom"
import { find } from "lodash"
import { CheckIcon } from "@chakra-ui/icons"

interface Props {
    posts: Story[]
    selected: any[]
    onSelect:any
}

export const PostSelect = (props: Props) => {
    const { onOpen, onClose, isOpen } = useDisclosure()
    const borderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)
    const beenSelected = id => {
        if (find(props.selected,v => id ===v.id)) {
            return true
        }

        return false
    }

    return (
        <Popover
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            placement="right"
            autoFocus={false}
        >
            <PopoverTrigger>
                <IconButton aria-label="select post" size="sm" icon={<FaPlus />} variant="ghost" _focus={null} />
            </PopoverTrigger>
            <PopoverContent maxHeight="400px" overflow="scroll">
                <Stack spacing="1" py="2"  divider={<StackDivider borderColor={borderColor} />}>
                    {
                        props.posts.map(p => 
                        <Flex key={p.id} justifyContent="space-between" alignItems="center" px="4" cursor="pointer" onClick={() => props.onSelect(p.id)}>
                            <Box py="2" >
                                <Heading size="xs">{p.title}</Heading>
                                <Text layerStyle="textSecondary" mt="2">{p.brief}</Text>
                            </Box>
                            {beenSelected(p.id) ? <CheckIcon color="green.400"/> : null}
                        </Flex>)
                    }
                </Stack>

            </PopoverContent>
        </Popover>
    )
}

export default PostSelect
