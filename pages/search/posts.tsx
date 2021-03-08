import { Box, Divider, Flex, HStack, Input } from "@chakra-ui/react"
import Card from "components/card"
import Empty from "components/empty"
import SEO from "components/seo"
import Posts from "components/story/posts"
import  SearchFilters  from "components/search-filters"
import siteConfig from "configs/site-config"
import PageContainer1 from "layouts/page-container1"
import Sidebar from "layouts/sidebar/sidebar"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { searchLinks } from "src/data/links"
import { SearchFilter } from "src/types/search"

import { requestApi } from "utils/axios/request"
import { addParamToUrl, removeParamFromUrl } from "utils/url"

const PostsSearchPage = () => {
    let filter = SearchFilter.Best
    const router = useRouter()
    const q = router.query.q

    const [results,setResults] = useState([])
    const [query,setQuery] = useState("")
    const [tempQuery,setTempQuery] = useState("")
    
    useEffect(() => {
        if (q) {
            setQuery(q as string)
            setTempQuery(q as string)
            initData()
        }
    },[q])

    useEffect(() => {
      initData()
    },[query])
    
    const initData = async () => {
        if (query) {
            const res = await requestApi.get(`/search/posts/${filter}?query=${query}`)
            setResults(res.data)
        }
    }

    const onFilterChange = f => {
        filter = f
        initData()
    }

    const startSearch = e => {
        if (e.keyCode == 13) {
            if (tempQuery === '') {
                removeParamFromUrl(["q"])
                setResults([])
            } else {
                addParamToUrl({q: tempQuery})
            }
            setQuery(tempQuery)
        }
    }

    function getFilters():[] {
        for (const link of searchLinks) {
            if (link.path.indexOf("posts") > -1) {
                return link.filters
            }
        }

        return []
    }

    return (
        <>
            <SEO
                title={siteConfig.seo.title}
                description={siteConfig.seo.description}
            />
            <PageContainer1>
                <Flex width="100%">
                    <Sidebar query={query ?{q:query} : null} routes={searchLinks} title="全站搜索" />
                    <Box ml="3" width={['100%', '100%', '100%', '70%']}>
                        <Card p="5">
                            <Input value={tempQuery} onChange={(e) => setTempQuery(e.currentTarget.value)} onKeyUp={(e) => startSearch(e)} size="lg" placeholder="type to search..." variant="unstyled" />
                        </Card>
                        <Card mt="2" p="0" pt="4" px="4">
                            <SearchFilters filters={getFilters()} onChange={onFilterChange}/>
                            <Divider mt="3"/>
                            {results.length === 0 && <Empty /> }
                            {results.length > 0 &&
                                <Posts posts={results} showFooter={false} type="compact" highlight={query}/>}
                        </Card>
                    </Box>
                </Flex>
            </PageContainer1>
        </>
    )
}

export default PostsSearchPage


