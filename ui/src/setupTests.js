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

// NOTE: This must be above the enzyme related code below, and the enzyme
// related imports MUST use `require`
import { polyfill as rafPolyfill } from './utils/test/requestAnimationFrame';
// react requires requestAnimationFrame polyfill when using jsdom
rafPolyfill();

/* eslint-disable import/no-extraneous-dependencies */
const Enzyme = require('enzyme');
const EnzymeAdapter = require('enzyme-adapter-react-16');
const createSerializer = require('enzyme-to-json').createSerializer;

Enzyme.configure({ adapter: new EnzymeAdapter() });
expect.addSnapshotSerializer(createSerializer({ mode: 'deep' }));

// Calls to get-config.tsx warn if this global is not a function
// This file is executed before each test file, so this value may be overridden safely
window.getJaegerUiConfig = () => ({});
