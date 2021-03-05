import {  Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaCheck, FaPlus, FaUserPlus } from "react-icons/fa";
import { requestApi } from "utils/axios/request";

interface Props {
    targetID: string
    followed: boolean
    fontSize?: string
}
const Follow = (props: Props) => {
    const [followed, setFollowed] = useState(props.followed)

    const follow = async () => {
        await requestApi.post(`/interaction/follow/${props.targetID}`)
        setFollowed(!followed)
    }

    return (
        <>
            {followed ?
                <Button colorScheme="teal" onClick={follow} _focus={null} leftIcon={<FaCheck />}>Following</Button>
                :
                <Button colorScheme="teal" variant="outline" leftIcon={<FaPlus />} onClick={follow} _focus={null}>Follow</Button>
            }
        </>
    )
}

export default Follow