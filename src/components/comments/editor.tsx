import React, { useState } from "react"
import { Box, Text, Flex, HStack, useColorModeValue, Button, VStack, Avatar, Heading, propNames } from "@chakra-ui/react"
import Card from "components/card"
import { MarkdownEditor } from "components/markdown-editor/editor"
import useSession from "hooks/use-session"
import { getUserName } from "utils/user"
import EditModeSelect from "components/edit-mode-select"
import { EditMode } from "src/types/editor"
import { MarkdownRender } from "components/markdown-editor/render"
import { Comment } from "src/types/comments"
import { User } from "src/types/session"

interface Props {
    user: User
    md: string
    onSubmit: any
    onCancel: any
    menu?: boolean
}

export const CommentEditor = (props: Props) => {
    const [editMode,setEditMode] = useState(EditMode.Edit)
    const [md,setMd] = useState(props.md)

    return (
        <Card>
                <Flex justifyContent="space-between"> 
                    <HStack>
                        <Avatar src={props.user.avatar} size="sm"></Avatar>
                        <Heading size="md">{getUserName(props.user)}</Heading>
                    </HStack> 
                    <EditModeSelect onChange={m => setEditMode(m)}/>
                </Flex>
                <Box mt="4" h="300px">
                    {editMode===EditMode.Edit ? <MarkdownEditor menu={props.menu?? true} md={md} onChange={md => setMd(md)}/> : <MarkdownRender md={md} overflowY="scroll"/>}
                </Box>

                <Flex justifyContent="flex-end">
                    <Button variant="ghost" onClick={props.onCancel}>Cancel</Button>
                    <Button variant="outline" onClick={() => props.onSubmit(md)}>Submit</Button>
                </Flex>
            </Card>
    )
}

export default CommentEditor
