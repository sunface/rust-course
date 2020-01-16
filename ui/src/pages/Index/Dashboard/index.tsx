import React, { useState, useEffect} from 'react'
import { inject, observer } from 'mobx-react'
import { Spin, Row, Col, Card } from 'antd'
import {
    Chart,
    Geom,
    Axis,
    Tooltip
} from 'bizcharts'

const Dashboard = inject('system')(observer(() =>{
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setLoading(false)
        return () => {}
    }, [])

    const data = [
        {
            year: '1991',
            value: 3
        },
        {
            year: '1992',
            value: 4
        },
        {
            year: '1993',
            value: 3.5
        },
        {
            year: '1994',
            value: 5
        },
        {
            year: '1995',
            value: 4.9
        },
        {
            year: '1996',
            value: 6
        },
        {
            year: '1997',
            value: 7
        },
        {
            year: '1998',
            value: 9
        },
        {
            year: '1999',
            value: 13
        }
    ]
    const cols = {
        value: {
            min: 0
        },
        year: {
            range: [0, 1]
        }
    }
    return (
        <Spin spinning={loading} tip='Loading...'>
            <div className='container'>
                <Row gutter={24}>
                    <Col xs={24} sm={24} md={12} lg={12} xl={12} className='gutter-row'>
                        <Card style={{borderRadius:'10px'}}>
                            <Chart padding="auto" height={278} data={data} scale={cols} forceFit>
                                <Axis name='year' />
                                <Axis name='value' />
                                <Tooltip
                                    crosshairs={{
                                        type: 'y'
                                    }}
                                />
                                <Geom type='line' position='year*value' size={2} />
                                <Geom
                                    type='point'
                                    position='year*value'
                                    size={4}
                                    shape={'circle'}
                                    style={{
                                        stroke: '#fff',
                                        lineWidth: 1
                                    }}
                                />
                            </Chart>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Spin>
    )
}))
export default Dashboard