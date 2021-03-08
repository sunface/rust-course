import React, { useEffect, useState } from "react"
import { Box, BoxProps, Button, HStack, useColorModeValue } from "@chakra-ui/react"

import { getSvgIcon } from "components/svg-icon"
import { SearchFilter } from "src/types/search"

interface Props {
  filters?: SearchFilter[]
  onChange: any
}

export const SearchFilters = (props:Props) => {
  const {filters=[SearchFilter.Best,SearchFilter.Featured,SearchFilter.Recent],onChange} = props
  const [filter, setFilter] = useState(SearchFilter.Best)
  
  const changeFilter = f => {
      onChange(f)
      setFilter(f)
  }
  return (
    <HStack>
      {
        filters.map(f => 
          <Button _focus={null} onClick={() => changeFilter(f)} size="sm" colorScheme={filter === f ? 'teal' : null} leftIcon={getSvgIcon(f)} variant="ghost" >
            {f}
          </Button>)
      }
    </HStack>
  )
}

export default SearchFilters
