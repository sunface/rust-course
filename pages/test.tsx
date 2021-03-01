import useCaretPosition from 'components/markdown-editor/position'
import TestStyles from 'theme/caret.styles'
import React, { useRef, useState, useEffect, Fragment } from 'react'
import { render } from 'react-dom'


const App = () => {
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
      <TestStyles />
      <section>
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
      </section>
    </>
  )
}

export default App