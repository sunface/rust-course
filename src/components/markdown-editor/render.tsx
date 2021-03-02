import React, { useRef, useEffect, useState } from 'react';
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { chakra,PropsOf} from '@chakra-ui/react';
import WebsiteLink from 'components/website-link';
import { cloneDeep, find, findIndex } from 'lodash';
import { isUsernameChar } from 'utils/user';
import { config } from 'utils/config';


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

    if (indexes.length == 0) {
      return 
    }

    const segments:string[] = []
    if (indexes.length >= 1) {
      if (md[0] !== '@') {
        // 首个字符不是@，需要把这一段先加入到分段中来
        segments.push(md.substr(0,indexes[0]))
      }
    }

    for (var i=0;i<indexes.length;i++) {
      if (i === indexes.length -1) {
        segments.push(md.substr(indexes[i],(md.length - indexes[i])))
        break
      }

      segments.push(md.substr(indexes[i],(indexes[i+1] - indexes[i])))
    }


    let newMd = ""
    for (const seg of segments) {
      let nickname: string = ""
      let username:string = ""
      let nickValid = false
      let userValid =false
      if (seg[0] !== '@') {
        newMd += seg
        continue 
      }


      if (seg[1] !== '[') {
        // @username 形式
        for (var i=1;i<seg.length;i++) {
          if ((i - 1) > config .user.usernameMaxLen) {
            break
          }

          if (isUsernameChar(seg[i])) {
            username += seg[i]
          } else {
            nickValid = true
            userValid = true
            break
          }
        }
      } else {
        // @[nickname](username)形式
        let tempI = 0
        for (var i=2;i<seg.length;i++) {
          // 超出nickname长度限制
          if ((i - 2) > config.user.nicknameMaxLen) {
            break
          }

          tempI = i
          if (seg[i] !== ']') {
            nickname += seg[i]
            continue
          }  else {
            nickValid = true 
            break
          }
        }

        if (nickValid) {
          if (seg[tempI+1] === '(') {
            for (var i=tempI+2;i<seg.length;i++) {
                // 超出username长度限制
              if ((i - tempI -2) > config .user.usernameMaxLen) {
                break
              }
              if (seg[i] === ')') {
                userValid = true 
                break 
              }

              if (isUsernameChar(seg[i])) {
                username += seg[i]
              } else {
                break
              }
            }
          }
        }
      }

      if (userValid && nickValid && username !== '') {
        if (nickname === '') {
          newMd +=  seg.replace(`@${username}`,`<a href="${username}" class="at-user-link">@${username}</a>`)
        } else {
          newMd +=  seg.replace(`@[${nickname}](${username})`,`<a href="${username}" class="at-user-link">${nickname}</a>`)
        }
      } else {
        newMd += seg
      }
    }

    setRenderMd(newMd)
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