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

// site-prefix.js must be the first import of the main webpack entrypoint
// becaue it configures the webpack publicPath.
/* eslint-disable import/first */
import './site-prefix';

import React from 'react';
import ReactDOM from 'react-dom';
import { document } from 'global';

import { Provider } from 'mobx-react'

// eslint-disable-next-line import/order, import/no-unresolved
import UIApp from './pages/App';
import './styles/main.less'
import 'react-grid-layout/css/styles.css'

// these need to go after the App import
/* eslint-disable import/first */
import 'u-basscss/css/flexbox.css';
import 'u-basscss/css/layout.css';
import 'u-basscss/css/margin.css';
import 'u-basscss/css/padding.css';
import 'u-basscss/css/position.css';
import 'u-basscss/css/typography.css';

const UI_ROOT_ID = 'apm-ui-root';
 
import './index.css';

import stores from './store'
import ConfigProvider from './components/ConfigProvider'
import Intl from './components/Intl'
import * as serviceWorker from './serviceWorker';

  ReactDOM.render(
    <Provider {...stores}>
      <Intl>
        <ConfigProvider>
          <UIApp />
        </ConfigProvider>
      </Intl>
    </Provider>
    , document.getElementById(UI_ROOT_ID));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();