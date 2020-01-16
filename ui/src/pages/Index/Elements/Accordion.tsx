import React, { useEffect, useState } from 'react'
import { Spin, Row, Col, Card, Collapse } from 'antd'
const { Panel } = Collapse

function Accordion() {
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setLoading(false)
        return () => {}
    }, [])
    const text = `
        A dog is a type of domesticated animal.
        Known for its loyalty and faithfulness,
        it can be found as a welcome guest in many households across the world.
    `
    return (
        <Spin spinning={loading} tip="Loading...">
            <div className='container'>
                <Row gutter={[8, 8]}>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Card title='折叠面板' style={{borderRadius:'10px'}}>
                            <Collapse defaultActiveKey={['1']} onChange={ ()=>{} }>
                                <Panel header="This is panel header 1" key="1">
                                    <p>{text}</p>
                                </Panel>
                                <Panel header="This is panel header 2" key="2">
                                    <p>{text}</p>
                                </Panel>
                                <Panel header="This is panel header 3" key="3" disabled>
                                    <p>{text}</p>
                                </Panel>
                            </Collapse>
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Card title='更多分页' style={{borderRadius:'10px'}}>
                            
                        </Card>
                    </Col>
                </Row>
            </div>
        </Spin>
    )
}
export default Accordion