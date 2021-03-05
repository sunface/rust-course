import React, { useEffect, useState } from "react"
import { Box, Popover, PopoverTrigger, Button, PopoverContent, PopoverBody, Input, useDisclosure, Divider, useToast } from "@chakra-ui/react"
import { Tag } from "src/types/tag"
import { requestApi } from "utils/axios/request"
import { cloneDeep, findIndex } from "lodash"
import TagCard from 'components/story/tag-list-card'
import { config } from "configs/config"
interface Props {
    options: Tag[]
    selected: Tag[]
    onChange: any
    size?: 'lg' | 'md'
}


export const TagInput = (props: Props) => {
    const toast = useToast()
    const [tags, setTags]: [Tag[], any] = useState([])

    const { onOpen, onClose, isOpen } = useDisclosure()

    const filterTags = query => {
        if (query.trim() === "") {
            setTags([])
            return
        }

        const newTags = []
        props.options.forEach(tag => {
            if (tag.title.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                if (findIndex(props.selected,t => t.id === tag.id) === -1) {
                    newTags.push(tag)
                }
            }
        })

        setTags(newTags)
    }

    const addTag = tag => {
        const t = cloneDeep(props.selected)
        t.push(tag)
        props.onChange(t)
    }

    return (
        <>
            {props.selected.length <=config.posts.maxTags && <Input size={props.size} onChange={e => filterTags(e.target.value)} onFocus={onOpen} onBlur={onClose} placeholder="start typing to search.." variant="unstyled" _focus={null} mt="3" />}
            {tags.length > 0 && <Popover isOpen={isOpen} closeOnBlur={false} placement="bottom-start" onOpen={onOpen} onClose={onClose} autoFocus={false}>
                <PopoverTrigger><Box width="100%"></Box></PopoverTrigger>
                <PopoverContent width="100%">
                    <PopoverBody width="100%" p="0">
                            {tags.map((tag, i) => {
                                    return <Box key={tag.id} cursor="pointer" onClick={_ => addTag(tag)}>
                                    <Box py="2" px="4" >
                                        <TagCard tag={tag}/>
                                    </Box>
                                    {i < tags.length - 1 && <Divider />}
                                </Box>
                            })
                            }
                    </PopoverBody>
                </PopoverContent>
            </Popover>}
        </>
    )
}

export default TagInput
