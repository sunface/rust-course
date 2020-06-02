// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { actions } from './duck';
import TimelineHeaderRow from './TimelineHeaderRow';
import VirtualizedTraceView from './VirtualizedTraceView';
import { merge as mergeShortcuts } from '../keyboard-shortcuts';
import { Accessors } from '../ScrollManager';
import { TUpdateViewRangeTimeFunction, IViewRange, ViewRangeTimeUpdate } from '../types';
import { TNil, ReduxState } from '../../../types';
import { Span, Trace } from '../../../types/trace';

import './index.css';

type TDispatchProps = {
  setSpanNameColumnWidth: (width: number) => void;
  collapseAll: (spans: Span[]) => void;
  collapseOne: (spans: Span[]) => void;
  expandAll: () => void;
  expandOne: (spans: Span[]) => void;
};

type TProps = TDispatchProps & {
  registerAccessors: (accessors: Accessors) => void;
  findMatchesIDs: Set<string> | TNil;
  scrollToFirstVisibleSpan: () => void;
  spanNameColumnWidth: number;
  trace: Trace;
  updateNextViewRangeTime: (update: ViewRangeTimeUpdate) => void;
  updateViewRangeTime: TUpdateViewRangeTimeFunction;
  viewRange: IViewRange;
};

const NUM_TICKS = 5;

/**
 * `TraceTimelineViewer` now renders the header row because it is sensitive to
 * `props.viewRange.time.cursor`. If `VirtualizedTraceView` renders it, it will
 * re-render the ListView every time the cursor is moved on the trace minimap
 * or `TimelineHeaderRow`.
 */
export class TraceTimelineViewerImpl extends React.PureComponent<TProps> {
  componentDidMount() {
    mergeShortcuts({
      collapseAll: this.collapseAll,
      expandAll: this.expandAll,
      collapseOne: this.collapseOne,
      expandOne: this.expandOne,
    });
  }

  collapseAll = () => {
    this.props.collapseAll(this.props.trace.spans);
  };

  collapseOne = () => {
    this.props.collapseOne(this.props.trace.spans);
  };

  expandAll = () => {
    this.props.expandAll();
  };

  expandOne = () => {
    this.props.expandOne(this.props.trace.spans);
  };

  render() {
    const {
      setSpanNameColumnWidth,
      updateNextViewRangeTime,
      updateViewRangeTime,
      viewRange,
      ...rest
    } = this.props;
    const { spanNameColumnWidth, trace } = rest;

    return (
      <div className="TraceTimelineViewer">
        <TimelineHeaderRow
          duration={trace.duration}
          nameColumnWidth={spanNameColumnWidth}
          numTicks={NUM_TICKS}
          onCollapseAll={this.collapseAll}
          onCollapseOne={this.collapseOne}
          onColummWidthChange={setSpanNameColumnWidth}
          onExpandAll={this.expandAll}
          onExpandOne={this.expandOne}
          viewRangeTime={viewRange.time}
          updateNextViewRangeTime={updateNextViewRangeTime}
          updateViewRangeTime={updateViewRangeTime}
        />
        <VirtualizedTraceView {...rest} currentViewRangeTime={viewRange.time.current} />
      </div>
    );
  }
}

function mapStateToProps(state: ReduxState) {
  const spanNameColumnWidth = state.traceTimeline.spanNameColumnWidth;
  return { spanNameColumnWidth };
}

function mapDispatchToProps(dispatch: Dispatch<ReduxState>): TDispatchProps {
  const { setSpanNameColumnWidth, expandAll, expandOne, collapseAll, collapseOne } = bindActionCreators(
    actions,
    dispatch
  );
  return { setSpanNameColumnWidth, expandAll, expandOne, collapseAll, collapseOne };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TraceTimelineViewerImpl);
