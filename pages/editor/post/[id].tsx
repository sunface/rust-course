import { Box, Button, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { MarkdownEditor } from 'components/markdown-editor/editor';
import PageContainer from 'layouts/page-container';
import EditorNav from 'layouts/nav/editor-nav'
import { EditMode } from 'src/types/editor';
import { MarkdownRender } from 'components/markdown-editor/render';
import { Story, StoryStatus } from 'src/types/story';
import { requestApi } from 'utils/axios/request';
import { useRouter } from 'next/router';
import { config } from 'configs/config';
import { cloneDeep } from 'lodash';
import Card from 'components/card';
import { updateUrl } from 'utils/url';
import { IDType } from 'src/types/id';



let saveDraftHandler = undefined;

function PostEditPage() {
  const router = useRouter()
  const { id } = router.query
  const [editMode, setEditMode] = useState(EditMode.Edit)
  const [saved,setSaved] = useState(null)
  const [ar, setAr]:[Story,any] = useState({
    type: IDType.Post, 
    md: '',
    title: '',
    status: StoryStatus.Draft
  })

  const toast = useToast()
  useEffect(() => {
    if (id && id !== 'new') {
      requestApi.get(`/story/post/${id}`).then(res => setAr(res.data))
    }
  }, [id])

  const onMdChange = newMd => {
    const newAr = {
      ...ar,
      md: newMd
    }
    setAr(newAr)

    if (ar.status === StoryStatus.Draft) {
      onSaveDraft(newAr)
    }
  }

  const onSaveDraft = (post?) => {
    if (saveDraftHandler === undefined) {
      // 没有任何保存动作，开始保存
      saveDraftHandler = setTimeout(() => saveDraft(post),2000)
      return 
    } else if (saveDraftHandler !== null) {
      // 不在保存过程中，连续输入, 取消之前的定时器，重新设置handler
      clearTimeout(saveDraftHandler)
      saveDraftHandler = setTimeout(() => saveDraft(post),2000)
      return 
    } 
  }

  const saveDraft = async (post?) => {
    saveDraftHandler = null
    setSaved(false)
    const res = await requestApi.post(`/story/post/draft`, post??ar)
    setSaved(true)
    saveDraftHandler = undefined
    if (!ar.id) {
      ar.id = res.data.id
      let url = window.location.origin + `/editor/post/${ar.id}`
      window.history.pushState({},null,url);
    }
  }

  const onChange = () => {
    const newAr = cloneDeep(ar)
    if (ar.status === StoryStatus.Draft) {
      onSaveDraft(newAr)
    }

    setAr(newAr)
  }

  const onChangeTitle = title => {
    if (title.length > config.posts.titleMaxLen) {
      toast({
        description: `Title长度不能超过${config.posts.titleMaxLen}`,
        status: "error",
        duration: 2000,
        isClosable: true,
      })
      return
    }

    const newAr = { ...ar, title: title }
    if (ar.status === StoryStatus.Draft) {
      onSaveDraft(newAr)
    }

    setAr(newAr)
  }

  const publish = async () => {
    if (!ar.tags || ar.tags?.length === 0) {
      toast({
        description: "请设置文章标签",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return 
    }
    const res = await requestApi.post(`/story`, ar)
    toast({
      description: "发布成功",
      status: "success",
      duration: 2000,
      isClosable: true,
    })
    router.push(`/${res.data.username}/${res.data.id}`)
  }

  return (
    <PageContainer
      nav={<EditorNav
        ar={ar}
        onChange={onChange}
        changeEditMode={(v) => setEditMode(v)}
        changeTitle={(e) => onChangeTitle(e.target.value)}
        publish={() => publish()}
        saved={saved}
      />}
    >
      {editMode === EditMode.Edit ?
        <Card style={{ height: 'calc(100vh - 145px)' }}>
          <MarkdownEditor
            onChange={(md) => onMdChange(md)}
            md={ar.md}
          /></Card> :
        <Card>
          <Box height="100%" p="6">
            <MarkdownRender md={ar.md} />
          </Box>
        </Card>
      }
    </PageContainer>
  );
}

export default PostEditPage


