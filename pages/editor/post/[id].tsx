import { Box, Button,createStandaloneToast} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { MarkdownEditor } from 'components/markdown-editor/editor';
import PageContainer from 'layouts/page-container';
import EditorNav from 'layouts/editor-nav'
import { EditMode } from 'src/types/editor';
import { MarkdownRender } from 'components/markdown-editor/render';
import { Post } from 'src/types/posts';
import { requestApi } from 'utils/axios/request';
import { useRouter } from 'next/router';
const toast = createStandaloneToast()

const content = `
# test原创
`

function PostEditPage() {
  const router = useRouter()
  const {id} = router.query
  const [editMode, setEditMode] = useState(EditMode.Edit)
  const [ar,setAr] = useState({
    md: content,
    title: ''
  })
  
  useEffect(() => {
    if (id && id !== 'new') {
      requestApi.get(`/editor/post/${id}`).then(res => setAr(res.data))
    }
  },[id])
  const onChange = newMd => {
    setAr({
      ...ar,
      md: newMd
    })
  }
  
  const publish = async () => {
    await requestApi.post(`/editor/post`, ar)
    toast({
        description: "发布成功",
        status: "success",
        duration: 2000,
        isClosable: true,
    })
    router.push('/editor/posts')
  }

  console.log(ar)
  return (
    <PageContainer
      nav={<EditorNav
        ar={ar}
        changeEditMode={(v) => setEditMode(v)}
        changeTitle={(e) => {setAr({...ar, title: e.target.value})}}
        publish={() => publish()}
      />}
    >
      <Box style={{ height: 'calc(100vh - 145px)' }}>
        {editMode === EditMode.Edit ?
          <MarkdownEditor
            options={{
              overrides: {
                Button: {
                  component: Button,
                },
              },
            }}
            onChange={(md) => onChange(md)}
            md={ar.md}
          /> :
          <Box height="100%" p="6">
            <MarkdownRender md={ar.md} />
          </Box>
        }
      </Box>
    </PageContainer>
  );
}

export default PostEditPage


