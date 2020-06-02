// Copyright (c) 2019 Uber Technologies, Inc.
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

import * as React from 'react';
import _debounce from 'lodash/debounce';
import matchSorter from 'match-sorter';
import IoIosSearch from 'react-icons/lib/io/ios-search';
import { FixedSizeList as VList, ListOnItemsRenderedProps, ListOnScrollProps } from 'react-window';
import { Key as EKey } from 'ts-key-enum';

import ListItem from './ListItem';

import './index.css';

type TProps = {
  cancel: () => void;
  options: string[];
  value: string | null;
  setValue: (value: string) => void;
};

type TState = {
  filterText: string;
  visibleStartIndex: number;
  visibleStopIndex: number;
  focusedIndex: number | null;
};

export default class FilteredList extends React.PureComponent<TProps, TState> {
  inputRef: React.RefObject<HTMLInputElement> = React.createRef();
  vlistRef: React.RefObject<VList> = React.createRef();
  wrapperRef: React.RefObject<HTMLDivElement> = React.createRef();
  state: TState = {
    filterText: '',
    focusedIndex: null,
    visibleStartIndex: 0,
    visibleStopIndex: 0,
  };

  componentDidUpdate() {
    this.focusInput();
  }

  focusInput = () => {
    const { current } = this.inputRef;
    if (current) {
      current.focus();
    }
  };

  isMouseWithin() {
    const { current } = this.wrapperRef;
    return current != null && current.matches(':hover');
  }

  private getFilteredOptions = () => {
    const { options } = this.props;
    const { filterText } = this.state;
    return filterText ? matchSorter(options, filterText) : options;
  };

  private setValue = (value: string) => {
    this.props.setValue(value);
    this.setState({ filterText: '', focusedIndex: null });
  };

  private onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { focusedIndex: stFocused } = this.state;
    switch (event.key) {
      case EKey.Escape: {
        const { cancel } = this.props;
        this.setState({ filterText: '', focusedIndex: null });
        cancel();
        break;
      }
      case EKey.ArrowUp:
      case EKey.ArrowDown: {
        const { visibleStartIndex, visibleStopIndex } = this.state;
        let focusedIndex: number | void;
        if (stFocused == null) {
          focusedIndex = event.key === EKey.ArrowDown ? visibleStartIndex : visibleStopIndex;
          this.setState({ focusedIndex });
        } else {
          const offset = event.key === EKey.ArrowDown ? 1 : -1;
          const filteredOptions = this.getFilteredOptions();
          const i = stFocused + offset;
          focusedIndex = i > -1 ? i % filteredOptions.length : filteredOptions.length + i;
          this.setState({ focusedIndex });
        }
        const listInstance = this.vlistRef.current;
        if (listInstance && (focusedIndex < visibleStartIndex + 1 || focusedIndex > visibleStopIndex - 1)) {
          listInstance.scrollToItem(focusedIndex);
        }
        break;
      }
      case EKey.Enter: {
        const filteredOptions = this.getFilteredOptions();
        if (stFocused !== null) this.setValue(filteredOptions[stFocused]);
        else if (filteredOptions.length === 1) this.setValue(filteredOptions[0]);
        break;
      }
      default: // no-op
    }
  };

  private onListScrolled = _debounce((scrollInfo: ListOnScrollProps) => {
    if (!scrollInfo.scrollUpdateWasRequested) {
      this.setState({ focusedIndex: null });
    }
  }, 80);

  private onListItemsRendered = _debounce((viewInfo: ListOnItemsRenderedProps) => {
    const { visibleStartIndex, visibleStopIndex } = viewInfo;
    this.setState({ visibleStartIndex, visibleStopIndex });
  }, 80);

  private onFilterChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ filterText: event.target.value, focusedIndex: null });
  };

  render() {
    const { value } = this.props;
    const { filterText, focusedIndex } = this.state;
    const filteredOptions = this.getFilteredOptions();
    const data = {
      focusedIndex,
      highlightQuery: filterText,
      options: filteredOptions,
      selectedValue: value,
      setValue: this.setValue,
    };
    return (
      <div ref={this.wrapperRef}>
        <label className="FilteredList--filterWrapper">
          <IoIosSearch className="FilteredList--filterIcon" />
          <input
            className="FilteredList--filterInput"
            placeholder="Filter..."
            onChange={this.onFilterChanged}
            onKeyDown={this.onKeyDown}
            ref={this.inputRef}
            type="text"
            value={filterText}
          />
        </label>
        <VList
          key={filterText}
          className="FilteredList--list u-simple-scrollbars"
          height={375}
          itemCount={filteredOptions.length}
          itemData={data}
          itemSize={35}
          width={650}
          overscanCount={25}
          onItemsRendered={this.onListItemsRendered}
          onScroll={this.onListScrolled}
          ref={this.vlistRef}
        >
          {ListItem}
        </VList>
      </div>
    );
  }
}
