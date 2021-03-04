import React from "react"
import { chakra } from "@chakra-ui/react"
var shortNumber = require('short-number');

interface Props {
    count: number
}

export const Count = (props: Props) => {
  return (
    <chakra.span title={props.count.toString()}>{shortNumber(props.count)}</chakra.span>
  )
} 

export default Count
