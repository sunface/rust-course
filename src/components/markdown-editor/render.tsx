import React, { useRef, useEffect, useState } from 'react';
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { chakra,PropsOf} from '@chakra-ui/react';
import WebsiteLink from 'components/website-link';
import { find, findIndex } from 'lodash';
import { isUsernameChar } from 'utils/user';


type Props = PropsOf<typeof chakra.div> & {
  md: string
  fontSize?: string
  scroll?: boolean
}

const ChakraMarkdown = chakra(Markdown)

export function MarkdownRender({ md,fontSize, ...rest }:Props) {
  const rootRef = useRef<HTMLDivElement>();
  const [renderMd,setRenderMd] = useState(md)
  useEffect(() => {
    rootRef.current.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });

    // deal with @username feature
    const indexes: number[] = []
    for (var i=0;i<md.length;i++) {
      if (md[i] === '@') {
        indexes.push(i)
      }
    }

    for (const index of indexes) {
      let nickname: string = ""
      let username:string = ""
      for (var i=index+1;i<md.length;i++) {
        if (isUsernameChar(md[i])) {
          username += md[i]
        } else {
          break
        }
      }
      
      if (username !== '') {
        setRenderMd(md.replace('@' + username, `[@${username}](/${username})`))
        console.log(username)
      }
    }
    console.log(indexes)
  }, [md]);

  return (
    <div ref={rootRef} style={{height:'100%'}}>
      <ChakraMarkdown 
        children={renderMd} 
        {...rest} 
        style={{height:'100%',fontSize: fontSize??'16px'}}
        className="markdown-render"
        options={{
          overrides: {
            WebsiteLink: {
              component: WebsiteLink,
            },
          },
        }}
        maxWidth={["800px","800px","800px","1000px"]}
        ></ChakraMarkdown>
    </div>
  );
}