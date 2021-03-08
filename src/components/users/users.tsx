import React from "react"
import { Box, BoxProps, chakra, PropsOf, useColorModeValue, VStack } from "@chakra-ui/react"
import UserCard from './user-card'
import { User } from "src/types/user"
import userCustomTheme from "theme/user-custom"

type Props = PropsOf<typeof chakra.div> & {
    users: User[]
    highlight?: string
}

export const Users = (props: Props) => {
    const { users,highlight, ...rest } = props
    const postBorderColor = useColorModeValue(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark)
    const showBorder = i => {
        if (i < users.length - 1) {
            return true
        }
    }
    return (
        <VStack alignItems="left" {...rest}>
            {users.map((u,i) =>
                <Box borderBottom={showBorder(i) ? `1px solid ${postBorderColor}` : null} key={u.id}>
                    <UserCard user={u} highlight={highlight}/>
                </Box>

            )}
        </VStack>
    )
}

export default Users
