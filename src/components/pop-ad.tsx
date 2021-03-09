import React from "react"
import { Box, BoxProps, useColorModeValue } from "@chakra-ui/react"

export const Card = (props: BoxProps) => {
  const bg = useColorModeValue("white", "gray.780")
  return (
    <Box
      bg={bg}
      borderRadius=".5rem"
      borderWidth="1px"
      p={[2,2,4,4]}
      // boxShadow="0 1px 1px 0 rgb(0 0 0 / 5%)"
      backgroundImage="linear-gradient(45deg, rgb(237, 132, 129) 0%, rgb(51, 128, 236) 100%)"
      backgroundPosition="initial initial"
      backgroundRepeat="initial initial"
      {...props}
    />
  )
} 

export default Card
