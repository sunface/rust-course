// Copyright (c) 2020 Uber Technologies, Inc.
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
import { CircularProgressbar as CircularProgressbarImpl } from 'react-circular-progressbar';

import 'react-circular-progressbar/dist/styles.css';

type TProps = {
  backgroundHue?: number;
  decorationHue?: number;
  maxValue: number;
  strokeWidth?: number;
  text?: string;
  value: number;
};

export default class CircularProgressbar extends React.PureComponent<TProps> {
  render() {
    const { backgroundHue, decorationHue = 0, maxValue, strokeWidth, text, value } = this.props;
    const scale = (value / maxValue) ** (1 / 4);
    const saturation = 20 + Math.ceil(scale * 80);
    const light = 50 + Math.ceil((1 - scale) * 30);
    const decorationColor = `hsl(${decorationHue}, ${saturation}%, ${light}%)`;
    const backgroundScale = ((maxValue - value) / maxValue) ** (1 / 4);
    const backgroundSaturation = 20 + Math.ceil(backgroundScale * 80);
    const backgroundLight = 50 + Math.ceil((1 - backgroundScale) * 30);
    const decorationBackgroundColor = `hsl(${backgroundHue}, ${backgroundSaturation}%, ${backgroundLight}%)`;

    return (
      <CircularProgressbarImpl
        styles={{
          path: {
            stroke: decorationColor,
            strokeLinecap: 'butt',
          },
          text: {
            fill: decorationColor,
          },
          trail: {
            stroke: backgroundHue !== undefined ? decorationBackgroundColor : 'transparent',
            strokeLinecap: 'butt',
          },
        }}
        maxValue={maxValue}
        strokeWidth={strokeWidth}
        text={text}
        value={value}
      />
    );
  }
}
