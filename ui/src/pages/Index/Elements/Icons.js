import React, { useEffect, useState } from 'react'
import { Spin } from 'antd'

function Icons() {
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setLoading(false)
        return () => {}
    }, [])

    return (
        <Spin spinning={loading} tip="Loading...">
            <div className='container'>
                Icons
            </div>
        </Spin>
    )
}
export default Icons