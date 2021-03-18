import React from "react"
import {chakra, Heading, Image, Text, HStack,Button, Flex,PropsOf,Box, Avatar, VStack, propNames, Tag} from "@chakra-ui/react"
import moment from 'moment'
import { FaGithub } from "react-icons/fa"
import { useRouter } from "next/router"
import { User } from "src/types/user"
import { getUserName } from "utils/user"
import Follow from "components/interaction/follow"
import Highlighter from 'react-highlight-words';
import Count from "components/count"

type Props = PropsOf<typeof chakra.div> & {
    user : User
    highlight?: string
    onEdit: any
}

export const OrgMember= ({user,highlight,onEdit}:Props) =>{
    const router = useRouter()
    return (
        <Flex alignItems="center" justifyContent="space-between">
            <HStack spacing="4" p="2">
                <Image width="40px" src={user.avatar} onClick={() => router.push(`/${user.username}`)} cursor="pointer"/>
                <VStack alignItems="left" spacing="1">
                    <HStack>
                        <Heading size="sm" onClick={() => router.push(`/${user.username}`)} cursor="pointer">
                        <Highlighter
                            highlightClassName="highlight-search-match"
                            textToHighlight={getUserName(user)}
                            searchWords={[highlight]}
                        /> 
                         <Tag colorScheme="cyan" ml="2">{user.role}</Tag>
                        </Heading>
             
                    </HStack>
                    <Text layerStyle="textSecondary">@
                        <Highlighter
                            highlightClassName="highlight-search-match"
                            textToHighlight={user.username}
                            searchWords={[highlight]}
                        /> </Text>
                </VStack>
            </HStack>
            <HStack>
                <Text fontWeight="600" fontSize=".95rem"><Count count={user.follows??0}/> followers</Text>
                <Button variant="outline" size="sm" onClick={() => onEdit(user)} _focus={null}>Edit</Button>
            </HStack>

        </Flex>
    )
} 

export default OrgMember
