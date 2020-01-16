/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'
import {useMediaQuery,MediaQueryProps} from 'react-responsive' 
import MediaQuery from 'react-responsive' 
 
const Desktop = (props:MediaQueryProps) => <MediaQuery {...props} minWidth={768} />
const Mobile = (props:MediaQueryProps) => <MediaQuery {...props} maxWidth={767} />
const isMobile = () => useMediaQuery({
    query: '(max-device-width: 991px)'
})
const isDesktop = () => useMediaQuery({
    query: '(min-device-width: 992px)'
})
export {
    Desktop, 
    Mobile,
    isMobile,
    isDesktop
}
