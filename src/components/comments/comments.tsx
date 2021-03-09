import React, { useEffect, useState } from "react"
import {Text, Flex, HStack,  Button, VStack, Select } from "@chakra-ui/react"
import Card from "components/card"
import useSession from "hooks/use-session"
import { requestApi } from "utils/axios/request"
import CommentCard from "./comment"
import CommentEditor from "./editor"
import { Comment } from "src/types/comments"
import { SearchFilter } from "src/types/search"
import { upperFirst } from "lodash"

interface Props {
    storyID: string
}
export const Comments = ({storyID}: Props) => {
    const [comments, setComments]: [Comment[], any] = useState([])

    const [editorVisible,setEditorVisible] = useState(false)
    const [sorter,setSorter] = useState(SearchFilter.Favorites)
    const session = useSession()

    useEffect(() => {
        getComments()
    },[])
    const submitComment = async (md) => {
        await requestApi.post('/story/comment',{targetID: storyID, md: md})
        setEditorVisible(false)
        getComments()
    }
    
    const getComments = async (s?) => {
        const res = await requestApi.get(`/story/comments/${storyID}?sorter=${s??sorter}`)
        setComments(res.data)
    }

    const countComments = () => {
        let n = comments.length
        for (const c of comments) {
            n += c.replies.length
        }

        return n
    }

    return (
        <VStack spacing="4" alignItems="left" id="comments">
            <Card>
                <Flex justifyContent="space-between">
                    <HStack spacing="4">
                        <Text fontWeight="600" fontSize="1.1rem">Comments ({countComments()})</Text>
                        <Select fontWeight="550" cursor="pointer" width="120px" value={sorter} onChange={e => {setSorter(e.currentTarget.value as SearchFilter);getComments(e.currentTarget.value)}} variant="unstyled">
                            <option value={SearchFilter.Favorites}>{upperFirst(SearchFilter.Favorites)}</option>
                            <option value={SearchFilter.Recent}>{upperFirst(SearchFilter.Recent)}</option>
                        </Select>
                    </HStack>

                    <Button variant="outline" colorScheme="teal" onClick={() => setEditorVisible(true)} _focus={null}>Add comment</Button>
                </Flex>
            </Card>

            {editorVisible && session && <CommentEditor user={session.user} md="" onSubmit={md => submitComment(md)} onCancel={() => setEditorVisible(false)}/>}

            {comments.map(comment => <CommentCard user={session?.user} key={comment.id} comment={comment} onChange={getComments}/>)}
        </VStack>
    )
}

export default Comments
