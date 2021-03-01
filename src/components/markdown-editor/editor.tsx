/*eslint-disable*/
import React, { useRef, useEffect, useState } from 'react';
import 'highlight.js/styles/atom-one-dark.css';
import { chakra, Popover, PopoverTrigger, PopoverContent, PopoverBody, Box, PropsOf, useDisclosure, Textarea, VStack, HStack, Avatar, Heading, Text, useColorModeValue } from '@chakra-ui/react';

import useCaretPosition from './position'
import CaretStyles from 'theme/caret.styles'
import { isUsernameChar } from 'utils/user';
import { requestApi } from 'utils/axios/request';
import Card from 'components/card';
import { User } from 'src/types/session';
import userCustomTheme from 'theme/user-custom';
import { cloneDeep } from 'lodash';



type Props = PropsOf<typeof chakra.div> & {
  md: string
  onChange: any
  menu?: boolean
}



export function MarkdownEditor(props: Props) {
  const bg = useColorModeValue(userCustomTheme.hoverBg.light,userCustomTheme.hoverBg.dark)
  const [at,setAt] = useState('')
  const [atUsers,setAtUsers]:[User[],any] = useState([])

  const triggerRef = useRef(null)
  const [showTrigger, setShowTrigger] = useState(false)
  const {
    x: triggerX,
    y: triggerY,
    getPosition: getPositionTrigger,
  } = useCaretPosition(triggerRef)

  useEffect(() => {
    if (triggerRef.current) {
      getPositionTrigger(triggerRef)
    }
  }, [])

  useEffect(() => {
    if (at !== '') {
      requestApi.get(`/users?query=${at.trim()}`).then(res => setAtUsers(res.data))
    }
  },[at])
  
  function handleEditorChange(e) {
    handleAt(e)
    props.onChange(e.currentTarget.value)
  }

  
  const handleAt = (e) => {
    // 当输入时，找到上一个@的位置，切之前的字母都必须是合法的username字符
    // 若找到，则记录该字符串，同时设置showTrigger = true 
    let at0 = ''
    let show = false 
    for(let i=triggerRef.current.selectionStart; i--; i >= 0) {
      if (e.target.value.charAt(i) === '@') {
        show = true 
        break
      }

      if (!isUsernameChar(e.target.value.charAt(i))) {
        show = false
        break
      }

      at0 = e.target.value.charAt(i) + at0
    }

    if (show) {
      if (at !== at0) {
        setAt(at0)
      }
      setShowTrigger(true)
    } else {
      setShowTrigger(false)
      setAt('')
    }
  }



  const selectAtUser = (user:User) => {
    const md = cloneDeep(props.md)

    let end = triggerRef.current.selectionStart
    let start: number
    for(let i=end; i--; i >= 0) {
      if (md.charAt(i) === '@') {
        start = i
        break
      }
    }

    const newMd = md.substr(0,start) + '@'+user.username+ md.substr(end,md.length)
    props.onChange(newMd)
    setShowTrigger(false)

    const gap = user.username.length - at.length
    setAt('')
    setTimeout(() => {
      triggerRef.current.selectionStart = end + gap
      triggerRef.current.selectionEnd = end + gap
      triggerRef.current.focus()
    },0)
}

  return (
    <>
      <CaretStyles />
      <Textarea
        ref={triggerRef}
        placeholder="Type the @ symbol to trigger UI"
        spellCheck="false"
        onInput={() => getPositionTrigger(triggerRef)}
        height="100%"
        border={null}
        value={props.md}
        onChange={handleEditorChange}
        _focus={null}
      />
      <span
        className="marker marker--trigger"
        style={{
          display: showTrigger ? 'block' : 'none',
          //@ts-ignore
          '--y': triggerY,
          '--x': triggerX,
        }}>
         {atUsers.length > 0 && <Card role="img" p="0">
            <VStack>
              {
                atUsers.map(user =>               
                <HStack key={user.id} py="3" px="5" cursor="pointer" onClick={() => selectAtUser(user)} _hover={{bg: bg}}>
                  <Avatar src={user.avatar} size="sm"/>
                  <VStack alignItems="left"> 
                     {user.nickname !== '' && <Heading size="sm">{user.nickname}</Heading>}
                     <Text>{user.username}</Text>
                  </VStack>
                </HStack>)
              }
            </VStack>
         </Card>}
      </span>
      {/* <Popover isOpen={isOpen} closeOnBlur={false} placement="bottom-start" onOpen={onOpen} onClose={onClose} autoFocus={false}>
                <PopoverTrigger><Box width="100%"></Box></PopoverTrigger>
                <PopoverContent width="100%" transform="translate3d(176px, 2071px, 0px)">
                    <PopoverBody width="100%" p="0">
                          ssssss
                    </PopoverBody>
                </PopoverContent>
            </Popover> */}
    </>
  );
}

