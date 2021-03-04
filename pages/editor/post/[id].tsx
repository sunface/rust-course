import { Box, Button, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { MarkdownEditor } from 'components/markdown-editor/editor';
import PageContainer from 'layouts/page-container';
import EditorNav from 'layouts/nav/editor-nav'
import { EditMode } from 'src/types/editor';
import { MarkdownRender } from 'components/markdown-editor/render';
import { Post } from 'src/types/posts';
import { requestApi } from 'utils/axios/request';
import { useRouter } from 'next/router';
import { config } from 'configs/config';
import { cloneDeep } from 'lodash';
import Card from 'components/card';

const content = `
# test原创
`

function PostEditPage() {
  const router = useRouter()
  const { id } = router.query
  const [editMode, setEditMode] = useState(EditMode.Edit)
  const [ar, setAr] = useState({
    md: content,
    title: ''
  })

  const toast = useToast()
  useEffect(() => {
    if (id && id !== 'new') {
      requestApi.get(`/editor/post/${id}`).then(res => setAr(res.data))
    }
  }, [id])

  const onMdChange = newMd => {
    setAr({
      ...ar,
      md: newMd
    })
  }

  const onChange = () => {
    setAr(cloneDeep(ar))
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

    setAr({ ...ar, title: title })
  }

  const publish = async () => {
    const res = await requestApi.post(`/editor/post`, ar)
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


