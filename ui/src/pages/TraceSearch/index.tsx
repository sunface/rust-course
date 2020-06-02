import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import './index.less';
import { Col, Row, Tabs, Select } from 'antd';
import { ISystem } from '../../store/system'
import { inject, observer } from 'mobx-react'
import { FormattedMessage as Message } from 'react-intl'
import SearchForm from './SearchForm'
import ScatterPlot from './ScatterPlot/ScatterPlot';
import { testTraces } from './SearchForm/testData.js'
import ResultItem from './ResultItem'
import { getPercentageOfDuration } from '../../library/utils/date';

const TabPane = Tabs.TabPane;
const { Option } = Select;

const maxTraceDuration = 814199
function Index(props: { system: ISystem }) {
    let history = useHistory()
    let { system } = props

    let setTraces = (traces: any) => {
        console.log("in parent:", traces)
    }

    return (
        <div className="trace-search">
            <Row>
                <Col span={5}>
                    <Tabs size="large">
                        <TabPane tab={<Message id={'search'} />} key="searchForm">
                            <SearchForm setTraces={setTraces}></SearchForm>
                        </TabPane>
                    </Tabs>
                </Col>
                <Col span={17} offset={1}>
                    <div>
                        <ScatterPlot
                            data={testTraces.map((t: any) => (
                                {
                                    x: t.startTime,
                                    y: t.duration,
                                    traceID: t.traceID,
                                    size: t.spans.length,
                                    name: t.traceName,
                                }))}
                            onValueClick={(t: any) => {
                                history.push('/trace/3d1a8df214e156ba')
                            }}
                        />
                    </div>


                    <div className="trace-search-overview">
                        <h2>
                            {testTraces.length} Trace{testTraces.length > 1 && 's'}
                        </h2>
                        <div>
                            <span className="ub-mr2">Sort:</span>
                            <Select
                                placeholder="Please select"
                                defaultValue="MOST_RECENT"
                            >
                                <Option value='MOST_RECENT'>Most Recent</Option>
                                <Option value='LONGEST_FIRST'>Longest First</Option>
                                <Option value='SHORTEST_FIRST'>Shortest First</Option>
                                <Option value='MOST_SPANS'>Most Spans</Option>
                                <Option value='LEAST_SPANS'>Least Spans</Option>
                            </Select>
                        </div>

                    </div>

                    <ul className="ub-list-reset">
                        {testTraces.map(trace => (
                        <li className="ub-my3 ub-pl3 ub-pr3" key={trace.traceID}>
                            <ResultItem
                            durationPercent={getPercentageOfDuration(trace.duration, maxTraceDuration)}
                            trace={trace}
                            />
                        </li>
                        ))}
                    </ul>
                </Col>
            </Row>
        </div>
    );
}

let TraceSearch = inject('system')(observer(Index))

export default TraceSearch;
