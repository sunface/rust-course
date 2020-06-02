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

import './TextList.css';

type TextListProps = {
  data: string[];
};

export default function TextList(props: TextListProps) {
  const { data } = props;
  return (
    <div className="TextList u-simple-scrollbars">
      <ul className="TextList--List ">
        {data.map((row, i) => {
          return (
            // `i` is necessary in the key because row.key can repeat
            // eslint-disable-next-line react/no-array-index-key
            <li key={`${i}`}>{row}</li>
          );
        })}
      </ul>
    </div>
  );
}
