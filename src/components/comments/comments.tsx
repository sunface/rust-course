import React, { useState } from "react"
import {Text, Flex, HStack,  Button, VStack } from "@chakra-ui/react"
import Card from "components/card"
import useSession from "hooks/use-session"
import { requestApi } from "utils/axios/request"
import CommentCard from "./comment"
import CommentEditor from "./editor"
import { Comment } from "src/types/comments"

interface Props {
    storyID: string
    comments: Comment[]
    onChange: any
}
export const Comments = ({storyID, comments,onChange }: Props) => {
    const [editorVisible,setEditorVisible] = useState(false)
    const session = useSession()
    const submitComment = async (md) => {
        await requestApi.post('/story/comment',{targetID: storyID, md: md})
        setEditorVisible(false)
        onChange()
    }
    
    const countComments = () => {
        let n = comments.length
        for (const c of comments) {
            n += c.replies.length
        }

        return n
    }

    return (
        <VStack spacing="4" alignItems="left">
            <Card>
                <Flex justifyContent="space-between">
                    <HStack>
                        <Text fontWeight="600" fontSize="1.1rem">Comments ({countComments()})</Text>
                    </HStack>

                    <Button variant="outline" colorScheme="teal" onClick={() => setEditorVisible(true)} _focus={null}>Add comment</Button>
                </Flex>
            </Card>

            {editorVisible && session && <CommentEditor user={session.user} md="" onSubmit={md => submitComment(md)} onCancel={() => setEditorVisible(false)}/>}

            {comments.map(comment => <CommentCard user={session?.user} key={comment.id} comment={comment} onChange={onChange}/>)}
        </VStack>
    )
}

export default Comments
