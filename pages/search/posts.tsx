import { Box, Divider, Flex, Input } from "@chakra-ui/react"
import Card from "components/card"
import SEO from "components/seo"
import Stories from "components/story/stories"
import SearchFilters from "components/search-filters"
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
    const router = useRouter()
    const q = router.query.q

    const [query, setQuery] = useState("")
    const [tempQuery, setTempQuery] = useState("")

    useEffect(() => {
        if (q) {
            setQuery(q as string)
            setTempQuery(q as string)
        }
    }, [q])

    const [filter, setFilter] = useState(SearchFilter.Favorites)
    const initPosts = (p) => {
        return requestApi.get(`/search/posts?query=${query}&filter=${filter}&page=${p}&per_page=5`)
    }

    const onFilterChange = f => {
        setFilter(f)
    }

    const startSearch = e => {
        if (e.keyCode == 13) {
            if (tempQuery === '') {
                removeParamFromUrl(["q"])
            } else {
                addParamToUrl({ q: tempQuery })
            }
            setQuery("")
            setTimeout(() => setQuery(tempQuery), 100)
        }
    }

    function getFilters(): [] {
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
                    <Sidebar query={query ? { q: query } : null} routes={searchLinks} title="全站搜索" />
                    <Box ml="3" width={['100%', '100%', '100%', '70%']}>
                        <Card p="5">
                            <Input value={tempQuery} onChange={(e) => setTempQuery(e.currentTarget.value)} onKeyUp={(e) => startSearch(e)} size="lg" placeholder="type and enter to search..." variant="unstyled" />
                        </Card>
                        <Card mt="2" p="0" pt="4" px="4">
                            <SearchFilters filters={getFilters()} onChange={onFilterChange} initFilter={filter} />
                            <Divider mt="3" />
                            {query && <Stories onLoad={initPosts} filter={filter} highlight={query} />}
                        </Card>
                    </Box>
                </Flex>
            </PageContainer1>
        </>
    )
}

export default PostsSearchPage


