import React, { useEffect, useState } from 'react'
import { Spin, Row, Col, Card, Pagination } from 'antd'

function Paginations() {
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setLoading(false)
        return () => {}
    }, [])
    function onShowSizeChange(current:number, pageSize:number) {
        console.log(current, pageSize)
    }
    return (
        <Spin spinning={loading} tip="Loading...">
            <div className='container'>
                <Row gutter={[8, 8]}>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Card title='基本分页' style={{borderRadius:'10px'}}>
                            <Pagination defaultCurrent={1} total={50} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Card title='更多分页' style={{borderRadius:'10px'}}>
                            <Pagination defaultCurrent={6} total={500} />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Card title='改变每页显示条目数' style={{borderRadius:'10px'}}>
                            <Pagination
                                showSizeChanger
                                onShowSizeChange={onShowSizeChange}
                                defaultCurrent={3}
                                total={500}
                            />
                            <br />
                            <Pagination
                                showSizeChanger
                                onShowSizeChange={onShowSizeChange}
                                defaultCurrent={3}
                                total={500}
                                disabled
                            />
                        </Card>
                    </Col>
                </Row>
                
            </div>
        </Spin>
    )
}
export default Paginations