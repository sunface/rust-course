import React, { useState, useEffect} from 'react'
import { inject, observer } from 'mobx-react'
import { Spin, Row, Col, Card } from 'antd'
import {
    Chart,
    Geom,
    Axis,
    Tooltip,
    Coord,
    Legend
} from 'bizcharts'
import DataSet from '@antv/data-set'
  
// 分组柱状图
const Groupedcolumn = ()=>{
    const data = [
        {

            name: 'London',
            '1月': 18.9,
            '2月': 28.8,
            '3月': 39.3,
            '4月': 81.4,
            '5月': 47,
            '6月': 20.3,
            '7月': 24,
            '8月': 35.6,
            '9月': 5.6,
            '10月': 1.6,
            '11月': 31.6,
            '12月': 13.6
        },
        {
            name: 'Berlin',
            '1月': 12.9,
            '2月': 2.8,
            '3月': 43.3,
            '4月': 1.4,
            '5月': 90,
            '6月': 50.3,
            '7月': 21,
            '8月': 15.6,
            '9月': 12.6,
            '10月': 23.6,
            '11月': 21.6,
            '12月': 54.6
        }
    ]
    const ds = new DataSet()
    const dv = ds.createView().source(data)
    dv.transform({
        type: 'fold',
        fields: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        // 展开字段集
        key: '月份',
        // key字段
        value: '月均降雨量' // value字段
    })
    return (
        <>
            <Chart height={200} padding='auto' data={dv} forceFit>
                <Tooltip
                    crosshairs={{
                        type: 'y'
                    }}
                />
                <Geom
                    type='interval'
                    position='月份*月均降雨量'
                    color={'name'}
                    adjust={[
                        {
                            type: 'dodge',
                            marginRatio: 1 / 32
                        }
                    ]}
                />
            </Chart>
        </>
    )
}
// 基础柱状图
const Basiccolumn = ()=>{
    const data = [
        {
            year: '一月',
            sales: 38
        },
        {
            year: '二月',
            sales: 52
        },
        {
            year: '三月',
            sales: 61
        },
        {
            year: '四月',
            sales: 145
        },
        {
            year: '五月',
            sales: 48
        },
        {
            year: '六月',
            sales: 38
        },
        {
            year: '七月',
            sales: 38
        },
        {
            year: '八月',
            sales: 38
        }
    ]
    const cols = {
        sales: {
            tickInterval: 20
        }
    }
    return (
        <>
            <Chart height={200} padding='auto' data={data} scale={cols} forceFit>
                <Axis name='sales' />
                <Tooltip
                    crosshairs={{
                        type: 'y'
                    }}
                />
                <Geom type='interval' position='year*sales' />
            </Chart>
        </>
    )
}
// 区间条形图
const Range = () => {
    const data = [
        {
            profession: '两年制副学士学位',
            highest: 110000,
            minimum: 23000,
            mean: 56636
        },
        {
            profession: '执法与救火',
            highest: 120000,
            minimum: 18000,
            mean: 66625
        },
        {
            profession: '教育学',
            highest: 125000,
            minimum: 24000,
            mean: 72536
        },
        {
            profession: '心理学',
            highest: 130000,
            minimum: 22500,
            mean: 75256
        },
        {
            profession: '计算机科学',
            highest: 131000,
            minimum: 23000,
            mean: 77031
        }
    ]
    const ds = new DataSet()
    const dv = ds.createView().source(data)
    dv.transform({
        type: 'map',
        callback(row) {
            // 加工数据后返回新的一行，默认返回行数据本身
            row.range = [row.minimum, row.highest]
            return row
        }
    })
    return (
        <>
            <Chart height={200} padding='auto' data={dv} forceFit>
                <Coord transpose />
                <Axis
                    name='profession'
                    label={{
                        offset: 12
                    }}
                />
                <Axis name='range' />
                <Tooltip />
                <Geom type='interval' position='profession*range' />
            </Chart>
        </>
    )
}
// 百分比堆叠柱状图
const Stackedpercentagecolumn = ()=>{
    const data = [
        {
            country: 'Europe',
            year: '1750',
            value: 163
        },
        {
            country: 'Europe',
            year: '1800',
            value: 203
        },
        {
            country: 'Europe',
            year: '1850',
            value: 276
        },
        {
            country: 'Europe',
            year: '1900',
            value: 408
        },
        {
            country: 'Europe',
            year: '1950',
            value: 547
        },
        {
            country: 'Europe',
            year: '1999',
            value: 729
        },
        {
            country: 'Europe',
            year: '2050',
            value: 628
        },
        {
            country: 'Europe',
            year: '2100',
            value: 828
        },
        {
            country: 'Asia',
            year: '1750',
            value: 502
        },
        {
            country: 'Asia',
            year: '1800',
            value: 635
        },
        {
            country: 'Asia',
            year: '1850',
            value: 809
        },
        {
            country: 'Asia',
            year: '1900',
            value: 947
        },
        {
            country: 'Asia',
            year: '1950',
            value: 1402
        },
        {
            country: 'Asia',
            year: '1999',
            value: 3634
        },
        {
            country: 'Asia',
            year: '2050',
            value: 5268
        },
        {
            country: 'Asia',
            year: '2100',
            value: 7268
        }
    ]
    const ds = new DataSet()
    const dv = ds
        .createView()
        .source(data)
        .transform({
            type: 'percent',
            field: 'value',
            // 统计销量
            dimension: 'country',
            // 每年的占比
            groupBy: ['year'],
            // 以不同产品类别为分组
            as: 'percent'
        })
    const cols = {
        percent: {
            min: 0,
            formatter(val) {
                return (val * 100).toFixed(2) + '%'
            }
        }
    }
    return (
        <>
            <Chart height={200} padding='auto' data={dv} scale={cols} forceFit>
                <Legend />
                <Axis name='year' />
                <Axis name='percent' />
                <Tooltip />
                <Geom
                    type='intervalStack'
                    position='year*percent'
                    color={'country'}
                />
            </Chart>
        </>
    )
}
// 堆叠柱状图
const Stackedcolumn = ()=>{
    const data = [
        {
            name: 'London',
            'Jan.': 18.9,
            'Feb.': 28.8,
            'Mar.': 39.3,
            'Apr.': 81.4,
            May: 47,
            'Jun.': 20.3,
            'Jul.': 24,
            'Aug.': 35.6
        },
        {
            name: 'Berlin',
            'Jan.': 12.4,
            'Feb.': 23.2,
            'Mar.': 34.5,
            'Apr.': 99.7,
            May: 52.6,
            'Jun.': 35.5,
            'Jul.': 37.4,
            'Aug.': 42.4
        }]
    const ds = new DataSet()
    const dv = ds.createView().source(data)
    dv.transform({
        type: 'fold',
        fields: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.'],
        // 展开字段集
        key: '月份',
        // key字段
        value: '月均降雨量' // value字段
    })
    return (
        <>
            <Chart height={200} padding="auto" data={dv} forceFit>
                <Legend />
                <Axis name='月份' />
                <Axis name='月均降雨量' />
                <Tooltip />
                <Geom
                    type='intervalStack'
                    position='月份*月均降雨量'
                    color={'name'}
                    style={{
                        stroke: '#fff',
                        lineWidth: 1
                    }}
                />
            </Chart>
        </>
    )
}
const Charts = inject('system')(observer((props) =>{
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setLoading(false)
        return () => {}
    }, [loading])

    return (
        <Spin spinning={loading}>
            <div className='container'>
                <Row gutter={24}>
                    <Col span={24}>
                        <Card title='条形图' style={{borderRadius:'10px'}}>
                            <Col xs={24} sm={24} md={8} lg={8} xl={8} className='gutter-row'>
                                <Groupedcolumn />
                            </Col>
                            <Col xs={24} sm={24} md={8} lg={8} xl={8} className='gutter-row' span={8}>
                                <Basiccolumn />
                            </Col>
                            <Col xs={24} sm={24} md={8} lg={8} xl={8} className='gutter-row' span={8}>
                                <Range />
                            </Col>
                        </Card>
                    </Col>
                    <Col span={24} style={{marginTop: '20px'}}>
                        <Card title='堆叠柱形图' style={{borderRadius:'10px'}}>
                            <Col xs={24} sm={24} md={12} lg={12} xl={12} className='gutter-row' span={8}>
                                <Stackedpercentagecolumn />
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={12} xl={12} className='gutter-row' span={8}>
                                <Stackedcolumn />
                            </Col>
                        </Card>
                    </Col>
                    <Col span={24} style={{marginTop: '20px'}}>
                        <Card title='横图表' style={{borderRadius:'10px'}}>
                            <Col xs={24} sm={24} md={12} lg={12} xl={12} className='gutter-row' span={8}>
                                <Stackedpercentagecolumn />
                            </Col>
                            <Col xs={24} sm={24} md={12} lg={12} xl={12} className='gutter-row' span={8}>
                                <Stackedcolumn />
                            </Col>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Spin>
    )
}))
export default Charts