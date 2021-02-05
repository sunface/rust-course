import React from "react"
import { Box, BoxProps } from "@chakra-ui/react"

export const Card = (props: BoxProps) => (
  <Box
    borderRadius=".5rem"
    borderWidth="1px"
    p="1rem"
    boxShadow="0 1px 2px 0 rgb(0 0 0 / 5%)"
    {...props}
  />
)

export default Card
