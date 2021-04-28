import React, { useState } from "react"
import { Box, Button, chakra, Flex, Heading, Radio, RadioGroup, Stack } from "@chakra-ui/react"
import { getSvgIcon } from "./svg-icon";
import { requestApi } from "utils/axios/request";

interface Props {
    targetID: string
    onClose: any
}

export const Report = (props: Props) => {
    const [reportValue, setReportValue] = useState("It's spam")

    const submit = async () => {
        await requestApi.post(`/report`,{targetID: props.targetID, content: reportValue})
        props.onClose()
    }

    return (
        <Box border="1px solid rgb(245, 158, 11)" p="4" borderRadius="8px">
            <Flex justifyContent="space-between">
                <Heading size="sm">Help us understand the problem. What is going on with this post?</Heading>
                <chakra.span layerStyle="textSecondary" cursor="pointer" onClick={props.onClose}>{getSvgIcon("close")}</chakra.span>
            </Flex>
            <RadioGroup
                //@ts-ignore
                onChange={setReportValue}
                value={reportValue} mt="4">
                <Stack spacing="3">
                    <Radio value="It's spam">It's spam</Radio>
                    <Radio value="It's abusive">It's abusive</Radio>
                    <Radio value="I am not interested">I am not interested</Radio>
                    <Radio value="This should not be on Hashnode">This should not be on Hashnode</Radio>
                </Stack>
            </RadioGroup>
            <Button variant="outline" mt="4" onClick={() => submit()}>Submit</Button>
        </Box>
    )
}

export default Report
