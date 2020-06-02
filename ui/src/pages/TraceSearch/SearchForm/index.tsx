import React, { useEffect,useState } from 'react';
import { Form, Input, Button, Select } from 'antd';
import { ISystem } from '../../../store/system'
import { inject, observer } from 'mobx-react'
import { FormattedMessage as Message } from 'react-intl'
import request from '../../../library/utils/http'
import { testApps, testTraces } from './testData.js'
const { Option } = Select;

function Index(props: { system: ISystem ,setTraces:any}) {
    const [apps, setApps] = useState([])
    let { system ,setTraces} = props
    useEffect(() => {
        setApps(testApps as any)
    },[apps])
    const onFinish = (values: any) => {
        // pass traces to parent
        setTraces(testTraces)
    };
    
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    let appOptions = apps.map(app => <Option value={app} key={app}>{app}</Option>);
    return (
        <Form
            name="basic"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            style={{ padding: '10px' }}
            size="small"
            initialValues={{
                ['resultsLimit']: 20,
            }}
        >
            <Form.Item
                label="Application"
                name="app"
            >
                <Select
                    placeholder="Please select"
                >
                    {appOptions}
                </Select>
            </Form.Item>

            <Form.Item
                label="Tags"
                name="tags"
            >
                <Input placeholder="http.status_code=200 error=true" />
            </Form.Item>

            <Form.Item
                label="Min Duration"
                name="minDuration"
            >
                <Input placeholder="e.g. 1.2s, 100ms, 500us" />
            </Form.Item>

            <Form.Item
                label="Max Duration"
                name="maxDuration"
            >
                <Input placeholder="e.g. 1.2s, 100ms, 500us" />
            </Form.Item>

            <Form.Item
                label="Limit Results"
                name="resultsLimit"
            >
                <Input type="number" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" ghost>
                    Submit
              </Button>
            </Form.Item>
        </Form>
    );
}

let SearchForm = inject('system')(observer(Index))

export default SearchForm as any;
