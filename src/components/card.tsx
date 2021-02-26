import React from "react"
import { Box, BoxProps, useColorModeValue } from "@chakra-ui/react"

export const Card = (props: BoxProps) => {
  const bg = useColorModeValue("white", "gray.780")
  return (
    <Box
      bg={bg}
      borderRadius=".5rem"
      borderWidth="1px"
      p={["0rem",".5rem","1rem"]}
      boxShadow="0 1px 1px 0 rgb(0 0 0 / 5%)"
      {...props}
    />
  )
} 

export default Card
