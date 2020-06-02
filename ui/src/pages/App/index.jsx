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

import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Route, Switch,BrowserRouter as Router  } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';

import NotFound from './NotFound';
// eslint-disable-next-line import/order, import/no-unresolved
import TracePage from '../Trace/components/TracePage';
// eslint-disable-next-line import/order, import/no-unresolved
import Login from '../Login'

import { ROUTE_PATH as tracePath } from '../Trace/components/TracePage/url';
import configureStore from '../Trace/utils/configure-store';
import processScripts from '../Trace/utils/config/process-scripts';



import './index.css';

import Layouts from '../../layouts/index.jsx'

const history = require("history").createBrowserHistory()


export default class UIApp extends Component {
  constructor(props) {
    super(props);
    this.store = configureStore(history);
    processScripts();
  }

  render() {
    return (
      <Provider store={this.store}>
        <ConnectedRouter history={history}>
          <Router>
            <Switch>
              <Route path={tracePath} component={TracePage} />
              <Route path="/ui" component={Layouts} />
              <Route path="/login" exact component={Login} />
              <Route component={NotFound} />
            </Switch>
            </Router>
        </ConnectedRouter>
      </Provider>
    );
  }
}
