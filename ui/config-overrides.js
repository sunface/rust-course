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

/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const { fixBabelImports, addLessLoader, override ,addWebpackPlugin} = require('customize-cra');
const path = require('path')
const { getLessVars } = require('antd-theme-generator')
const AntDesignThemePlugin = require('antd-theme-webpack-plugin')

const themeVariables = getLessVars(path.join(__dirname, './src/styles/vars.less'))
const defaultVars = getLessVars('./node_modules/antd/lib/style/themes/default.less')
const darkVars = { ...getLessVars('./node_modules/antd/lib/style/themes/dark.less'), '@primary-color': defaultVars['@primary-color'] };
const lightVars = { ...getLessVars('./node_modules/antd/lib/style/themes/compact.less'), '@primary-color': defaultVars['@primary-color'] };


const newDarkVars = {...darkVars, ...themeVariables}
const newLightVars = {...lightVars, ...themeVariables}
fs.writeFileSync('./src/styles/dark.json', JSON.stringify(newDarkVars));
fs.writeFileSync('./src/styles/light.json', JSON.stringify(newLightVars));


const options = {
  antDir: path.join(__dirname, './node_modules/antd'), // antd包位置
  stylesDir: path.join(__dirname, './src'), //主题文件所在文件夹
  varFile: path.join(__dirname, './src/styles/vars.less'), // 自定义默认的主题色
  themeVariables: Array.from(new Set([
    ...Object.keys(darkVars),
    ...Object.keys(lightVars),
    ...Object.keys(themeVariables),
  ])),
  generateOnce: false // 是否只生成一次,
}

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true
  }),
  // 主题
  addWebpackPlugin(new AntDesignThemePlugin(options)),
  addLessLoader({
    javascriptEnabled: true,
  })
)
