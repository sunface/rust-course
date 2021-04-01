import React, { useEffect, useState } from "react"
import { Box, BoxProps, chakra, HStack, IconButton, Text } from "@chakra-ui/react"
import Link from "next/link"
import { ReserveUrls } from "src/data/reserve-urls"
import { FaBell } from "react-icons/fa"
import { requestApi } from "utils/axios/request"

export const Notification = (props: BoxProps) => {
    const [unread, setUnread] = useState(0)
    useEffect(() => {
        queryUnread()
    }, [])

    const queryUnread = async () => {
        const res = await requestApi.get("/notifications/unread")
        setUnread(res.data)
        // await requestApi.post("/notifications/unread")
    }

    return (
        <>
            <Link
                aria-label="View notifications"
                href={ReserveUrls.Notifications}
            >
                <HStack cursor="pointer">
                <IconButton
                    size="md"
                    fontSize="1.4rem"
                    aria-label="view notifications"
                    variant="ghost"
                    color="current"
                    _focus={null}
                    icon={<FaBell />}
                />
                    {unread !== 0 && <Text fontSize=".9rem" pos="absolute" pl="25px" pb="18px" color="orange" fontWeight="bold">{unread}</Text>}
                </HStack>
            </Link>
        </>
    )

}
export default Notification
