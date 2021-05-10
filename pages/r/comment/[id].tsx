import { Box, Button, Flex, Heading, HStack, Image, Text, VStack } from "@chakra-ui/react"
import Card from "components/card"
import Empty from "components/empty"
import { MarkdownRender } from "components/markdown-editor/render"
import Stories from "components/story/stories"
import SEO from "components/seo"
import siteConfig from "configs/site-config"
import useSession from "hooks/use-session"
import PageContainer1 from "layouts/page-container1"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { ReserveUrls } from "src/data/reserve-urls"
import { Story } from "src/types/story"
import { Tag } from "src/types/tag"
import { requestApi } from "utils/axios/request"
import { isAdmin } from "utils/role"
import Follow from "components/interaction/follow"
import Count from "components/count"
import StoryFilters from "components/story/story-filter"
import CommentCard from "components/comments/comment"
import { Comment } from "src/types/comments"

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


    return (
        <>
           {comment && session && <CommentCard user={session.user} comment={comment} onChange={null}/>}
        </>
    )
}

export default CommentPage

