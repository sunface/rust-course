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

export default function readJsonFile(fileList: { file: File }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Invalid result type'));
        return;
      }
      try {
        resolve(JSON.parse(reader.result));
      } catch (error) {
        reject(new Error(`Error parsing JSON: ${error.message}`));
      }
    };
    reader.onerror = () => {
      // eslint-disable-next-line no-console
      const errMessage = reader.error ? `: ${String(reader.error)}` : '';
      reject(new Error(`Error reading the JSON file${errMessage}`));
    };
    reader.onabort = () => {
      // eslint-disable-next-line no-console
      reject(new Error(`Reading the JSON file has been aborted`));
    };
    try {
      reader.readAsText(fileList.file);
    } catch (error) {
      // eslint-disable-next-line no-console
      reject(new Error(`Error reading the JSON file: ${error.message}`));
    }
  });
}
