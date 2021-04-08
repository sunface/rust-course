import {  Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaCheck, FaPlus, FaUserPlus } from "react-icons/fa";
import { requestApi } from "utils/axios/request";

interface Props {
    targetID: string
    followed: boolean
    size?: string
    buttonIcon?: boolean
}
const Follow = (props: Props) => {
    const {size="md",buttonIcon=true} =props
    const [followed, setFollowed] = useState(props.followed)

    const follow = async () => {
        await requestApi.post(`/interaction/follow/${props.targetID}`)
        setFollowed(!followed)
    }

    return (
        <>
            {followed ?
                <Button size={size} colorScheme="teal" onClick={follow} _focus={null} leftIcon={buttonIcon?<FaCheck />:null}>Following</Button>
                :
                <Button size={size} colorScheme="teal" variant="outline" leftIcon={buttonIcon ? <FaPlus /> : null} onClick={follow} _focus={null}>Follow</Button>
            }
        </>
    )
}

export default Follow