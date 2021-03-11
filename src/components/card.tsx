import React from "react"
import { Box, BoxProps, Flex, useColorModeValue } from "@chakra-ui/react"

interface Props {
  shadowed?: boolean
}

export const Card = ({shadowed, ...rest}: BoxProps&Props)  => {
  const bg = useColorModeValue("white", "gray.780")
  return (
    <Box
      bg={bg}
      borderRadius=".5rem"
      borderWidth="1px"
      p={[2,2,4,4]}
      boxShadow={shadowed? "0 1px 1px 0 rgb(0 0 0 / 5%)" : null}
      height="fit-content"
      {...rest}
    />
  )
} 

export default Card


export const CardHeader = (props) => {
 return (<Flex px="4" py="4" justifyContent="space-between" alignItems="center" {...props}/>)
}

export const CardBody = (props) => {
  return <Box  px="4" py="3" {...props} />
}