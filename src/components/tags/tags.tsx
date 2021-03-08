import React, { useEffect, useState } from "react"
import { Box, Tag as ChakraTag, TagCloseButton, TagLabel } from "@chakra-ui/react"
import TagInput from "./tag-input"
import { requestApi } from "utils/axios/request"
import { Tag } from "src/types/tag"
import { cloneDeep, remove } from "lodash"

interface Props {
    tags: string[]
    onChange: any
    size?: 'lg' | 'md'
}

export const Tags = (props: Props) => {
    // 所有的tags选项
    const [options, setOptions]: [Tag[], any] = useState([])
    // 当前已选择的tags
    const [tags, setTags]: [Tag[], any] = useState([])

    useEffect(() => {
        requestApi.get('/tag/all').then(res => {
            setOptions(res.data)
            const t = []
            props.tags?.forEach(id => {
                res.data.forEach(tag => {
                    if (tag.id === id) {
                        t.push(tag)
                    }
                })
            })

            setTags(t)
        })
    }, [])


    const addTag = t => {
        setTags(t)

        const ids = []
        t.forEach(tag => ids.push(tag.id))
        props.onChange(ids)
    }

    const removeTag = t => {
        const newTags = cloneDeep(tags)
        remove(newTags, tag => tag.id === t.id)
        setTags(newTags)

        const ids = []
        newTags.forEach(tag => ids.push(tag.id))

        props.onChange(ids)
    }

    return (
        <>
            <TagInput options={options} selected={tags} onChange={addTag} size={props.size}/>

            {tags.length > 0 && <Box mt={props.size === 'lg' ? 4 : 2}>
                {
                    tags.map(tag =>
                        <ChakraTag key={tag.id} mr="2" colorScheme="cyan" variant="solid" px="2" py={props.size === 'lg' ? 2 : 1}>
                            <TagLabel>{tag.title}</TagLabel>
                            <TagCloseButton onClick={_ => removeTag(tag)} />
                        </ChakraTag>)
                }
            </Box>
            }
        </>
    )
}

export default Tags
