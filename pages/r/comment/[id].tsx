import useSession from "hooks/use-session"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { requestApi } from "utils/axios/request"
import CommentCard from "components/comments/comment"
import { Comment } from "src/types/comments"
import { Box, Button } from "@chakra-ui/react"

const CommentPage = () => {
    const router = useRouter()
    const session = useSession()
    const [comment,setComment]:[Comment,any]  = useState(null)
    useEffect(() => {
        if (router.query.id) {
            initData()
        }
    }, [router.query.id])

    const initData = async () => {
        const res = await requestApi.get(`/story/comment/${router.query.id}`)
        res.data.replies = []
        setComment(res.data)
        console.log(res.data)
    }

    const gotoPost = async () => {
        const res = await requestApi.get(`/story/byCommentID/${comment.id}`)
        router.push(res.data + '#comments')
    }

    return (
        <Box p="4">
           <Button mb="2" onClick={() => gotoPost()}>前往文章</Button>
           {comment && session && <CommentCard user={session.user} comment={comment} onChange={null}/>}
        </Box>
    )
}

export default CommentPage

