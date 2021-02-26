import React, { useRef, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { chakra,PropsOf} from '@chakra-ui/react';
import WebsiteLink from 'components/website-link';


type Props = PropsOf<typeof chakra.div> & {
  md: string
  fontSize?: string
  scroll?: boolean
}

const ChakraMarkdown = chakra(Markdown)

export function MarkdownRender({ md,fontSize, ...rest }:Props) {
  const rootRef = useRef<HTMLDivElement>();

  useEffect(() => {
    rootRef.current.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });
  }, [md]);

  return (
    <div ref={rootRef} style={{height:'100%'}}>
      <ChakraMarkdown 
        children={md} 
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