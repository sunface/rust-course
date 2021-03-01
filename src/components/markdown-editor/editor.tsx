/*eslint-disable*/
import React, { useRef, useEffect,useState} from 'react';
import 'highlight.js/styles/atom-one-dark.css';
import { chakra,Popover,PopoverTrigger,PopoverContent,PopoverBody,Box,PropsOf, useDisclosure} from '@chakra-ui/react';

import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite-sunface/lib/index.css';
import useCaretPosition from './position'
import CaretStyles from 'theme/caret.styles'
const MdEditor = dynamic(() => import('node_modules/react-markdown-editor-lite-sunface'), {
  ssr: false
});



type Props = PropsOf<typeof chakra.div> & {
  md: string
  onChange: any
  menu?: boolean
}



export function MarkdownEditor(props:Props) {
  const { onOpen, onClose, isOpen } = useDisclosure()

  function handleEditorChange({html, text}) {    
    props.onChange(text)
    onOpen()
  }
  
  const triggerRef = useRef(null)
  const [showTrigger, setShowTrigger] = useState(false)
  const {
    x: triggerX,
    y: triggerY,
    getPosition: getPositionTrigger,
  } = useCaretPosition(triggerRef)

  const handleCustomUI = (e) => {
    const previousCharacter = e.target.value
      .charAt(triggerRef.current.selectionStart - 2)
      .trim()
    const character = e.target.value
      .charAt(triggerRef.current.selectionStart - 1)
      .trim()
    if (character === '@' && previousCharacter === '') {
      setShowTrigger(true)
    }
    if (character === '' && showTrigger) {
      setShowTrigger(false)
    }
  }

  useEffect(() => {
    if (triggerRef.current) {
      getPositionTrigger(triggerRef)
    }
  }, [])

  
  return (
    <>
        {/* <MdEditor
          height="100%"
          width="100%"
          value={props.md}
          style={{ height: "102%"}}
          renderHTML={_ => null}
          onChange={handleEditorChange}
          config={{
            canView: false,
            view:{
              menu: props.menu ?? true,
              md: true,
              html: false,
              fullScreen: true,
            }
          }}
        /> */}
      <CaretStyles />
        <textarea
          ref={triggerRef}
          placeholder="Type the @ symbol to trigger UI"
          spellCheck="false"
          onKeyUp={handleCustomUI}
          onInput={() => getPositionTrigger(triggerRef)}
        />
        <span
          className="marker marker--trigger"
          style={{
            display: showTrigger ? 'block' : 'none',
            //@ts-ignore
            '--y': triggerY,
            '--x': triggerX,
          }}>
          Triggered UI! <span role="img">😎</span>
        </span>
        <Popover isOpen={isOpen} closeOnBlur={false} placement="bottom-start" onOpen={onOpen} onClose={onClose} autoFocus={false}>
                <PopoverTrigger><Box width="100%"></Box></PopoverTrigger>
                <PopoverContent width="100%" transform="translate3d(176px, 2071px, 0px)">
                    <PopoverBody width="100%" p="0">
                          ssssss
                    </PopoverBody>
                </PopoverContent>
            </Popover>
            </>
  );
}

