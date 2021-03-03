import React from "react"
import { Image, Text, useColorModeValue, VStack } from "@chakra-ui/react"

export const Empty = () => {
  return (
    <VStack spacing="16" py="16">
    <Text fontSize="1.2rem">There doesn't seem to be anything here!</Text>
    <Image src="/not-found.png" height="260px" />
  </VStack>
  )
} 

export default Empty
