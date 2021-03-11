import { Text, Box, Heading, Image, Divider, useToast, HStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Wrap, WrapItem } from "@chakra-ui/react"
import Card from "components/card"
import Sidebar from "layouts/sidebar/sidebar"
import React, { useEffect, useState } from "react"
import {interactionLinks} from "src/data/links"
import { requestApi } from "utils/axios/request"
import { useRouter } from "next/router"
import PageContainer1 from "layouts/page-container1"
import { IDType } from "src/types/id"
import Empty from "components/empty"


const TagsPage = () => {
    const [tags, setTags] = useState([])
    const [following, setFollowing] = useState([])
    useEffect(() => {
        getFollowing()
    }, [])
    const getFollowing = async () => {
        const res = await requestApi.get(`/interaction/following/0?type=${IDType.Tag}`)
        const ids = []
        for (const f of res.data) {
            ids.push(f.id)
        }
        setFollowing(res.data)

        const res1 = await requestApi.post(`/tag/ids`, ids)
        setTags(res1.data)
    }

    const getTagWeight = tag => {
        for (const f of following) {
            if (f.id === tag.id) {
                return f.weight
            }
        }

        return 0
    }

    return (
        <>
            <PageContainer1>
                <Box display="flex">
                    <Sidebar routes={interactionLinks} title="我的关注" />
                    <Card ml="4" p="6" width="100%">
                        <Text fontSize=".95rem" fontWeight="600">Adjust tag weight to modify your home feed. Higher values mean more appearances.</Text>
                        <Divider my="6" />
                        {
                            tags.length === 0 ?
                                <Empty />
                                :
                                <Wrap spacing="10px">
                                    
                                    {tags.map(tag =>
                                        <WrapItem width={["100%","100%","100%","31%"]}><FollowingTag key={tag.id} tag={tag} weight={getTagWeight(tag)} />  </WrapItem>
                                    )}
                                  
 
                                </Wrap>
                        }
                    </Card>
                </Box>
            </PageContainer1>
        </>
    )
}
export default TagsPage


function FollowingTag(props) {
    const [weight, setWeight] = React.useState(props.weight)
    const onWeightChange = async w => {
        await requestApi.post(`/interaction/following/weight`, { id: props.tag.id, weight: weight })
        setWeight(w)
    }

    return (
        <Card shadowed mt="2" width="100%">
            <HStack spacing="4">
                <Image src={props.tag.icon} width="50px" />
                <Box>
                    <Heading size="sm">{props.tag.title}</Heading>
                    <Text>#{props.tag.name}</Text>
                </Box>
            </HStack>
            <Box px="1">
                <Slider min={1} max={10} mt="4" size="sm" focusThumbOnChange={false} value={weight} onChange={w => setWeight(w)} onChangeEnd={onWeightChange}>
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb _focus={null} fontSize="sm" boxSize="32px" children={weight} />
                </Slider>
            </Box>
        </Card>
    )
}