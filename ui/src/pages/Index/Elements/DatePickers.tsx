import React, { useEffect, useState } from 'react'
import { Spin } from 'antd'

function DatePickers() {
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setLoading(false)
        return () => {}
    }, [])

    return (
        <Spin spinning={loading} tip="Loading...">
            <div className='container'>
                DatePicker
            </div>
        </Spin>
    )
}
export default DatePickers