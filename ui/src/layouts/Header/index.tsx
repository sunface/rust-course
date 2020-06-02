import React from 'react'
import { inject, observer } from 'mobx-react'
import { ISystem } from '../../store/system'
import { Layout, DatePicker } from 'antd'
import { MenuFoldOutlined } from '@ant-design/icons';
import './index.less'
import moment from 'moment';
import BreadcrumbWrapper from '../Breadcrumb'

const { Header } = Layout

function Index(props: { system: ISystem }) {
    let { system } = props
    const { RangePicker } = DatePicker;
    function changeDate(_: any, dateString: any) {
        system.setStartDate(dateString[0])
        system.setEndDate(dateString[1])
    }

    return (
        <Header className="site-layout-background" style={{ height: '46px', lineHeight: '46px', padding: '0 20px' ,position: 'fixed', zIndex: 1, width: 'calc(100% - 83px)'}} >
            <div className='header'>
                <div>
                    <BreadcrumbWrapper />
                </div>
                <div>
                    <div>
                    <RangePicker
                        className="date-picker"
                        showTime={{ format: 'HH:mm' }}
                        format="YYYY-MM-DD HH:mm"
                        onChange={changeDate}
                        value={[moment(system.startDate), moment(system.endDate)]}
                        ranges={{
                            '5m': [moment().subtract(5, 'm'), moment()],
                            '30m': [moment().subtract(30, 'm'), moment()],
                            '1h': [moment().subtract(1, 'h'), moment()],
                            '6h': [moment().subtract(6, 'h'), moment()],
                            '1d': [moment().subtract(1, 'd'), moment()],
                            '3d': [moment().subtract(3, 'd'), moment()],
                            '7d': [moment().subtract(7, 'd'), moment()],
                        }}
                    />
                    </div>
                </div>
            </div>
        </Header>
    )
}

let HeaderWrapper = inject('system')(observer(Index))

export default HeaderWrapper as any