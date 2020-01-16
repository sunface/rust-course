/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'
import {Responsive, useMediaQuery} from 'react-responsive' 

const Desktop = props => <Responsive {...props} minWidth={768} />
const Mobile = props => <Responsive {...props} maxWidth={767} />
const isMobile = useMediaQuery({
    query: '(max-device-width: 991px)'
})
export {
    Desktop,
    Mobile,
    isMobile
}
