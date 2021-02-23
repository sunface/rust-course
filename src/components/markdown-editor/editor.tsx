import React from 'react';
import 'highlight.js/styles/atom-one-dark.css';
import { chakra,PropsOf} from '@chakra-ui/react';

import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite/lib/index.css';

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});



type Props = PropsOf<typeof chakra.div> & {
  md: string
  onChange: any
}



export function MarkdownEditor(props) {
  function handleEditorChange({html, text}) {    
    props.onChange(text)
  }

  return (
        <MdEditor
          width="100%"
          value={props.md}
          style={{ height: "102%" }}
          renderHTML={_ => null}
          onChange={handleEditorChange}
          config={{
            canView: false,
            view:{
              menu: true,
              md: true,
              html: false,
              fullScreen: true,
            }
          }}
        />
  );
}

