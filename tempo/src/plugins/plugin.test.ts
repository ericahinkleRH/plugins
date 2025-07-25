// Copyright 2025 The Perses Authors
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

import { DatasourceSpec } from '@perses-dev/core';
import { TraceQueryContext } from '@perses-dev/plugin-system';
import { MOCK_SEARCH_RESPONSE_VPARQUET4, MOCK_TRACE_DATA_SEARCHRESULT, MOCK_TRACE_RESPONSE_SMALL } from '../test';
import { TempoDatasourceSpec } from './tempo-datasource-types';
import { TempoDatasource } from './tempo-datasource';
import { TempoTraceQuery } from './tempo-trace-query/TempoTraceQuery';

jest.mock('echarts/core');

const datasource: TempoDatasourceSpec = {
  directUrl: '/test',
};

const tempoStubClient = TempoDatasource.createClient(datasource, {});
tempoStubClient.query = jest.fn(async () => MOCK_TRACE_RESPONSE_SMALL);
tempoStubClient.searchWithFallback = jest.fn(async () => MOCK_SEARCH_RESPONSE_VPARQUET4);

const getDatasourceClient: jest.Mock = jest.fn(() => {
  return tempoStubClient;
});

const getDatasource: jest.Mock = jest.fn((): DatasourceSpec<TempoDatasourceSpec> => {
  return {
    default: false,
    plugin: {
      kind: 'TempoDatasource',
      spec: datasource,
    },
  };
});

const stubTempoContext: TraceQueryContext = {
  variableState: {},
  datasourceStore: {
    getDatasource: getDatasource,
    getDatasourceClient: getDatasourceClient,
    listDatasourceSelectItems: jest.fn(),

    getLocalDatasources: jest.fn(),
    setLocalDatasources: jest.fn(),
    getSavedDatasources: jest.fn(),
    setSavedDatasources: jest.fn(),
  },
  absoluteTimeRange: {
    start: new Date('2023-12-16T21:57:48.057Z'), // last 1 hour
    end: new Date('2023-12-16T22:57:48.057Z'),
  },
};

describe('TempoTraceQuery', () => {
  it('should return trace query results', async () => {
    const results = await TempoTraceQuery.getTraceData(
      {
        query: 'duration > 900ms',
      },
      stubTempoContext
    );
    expect(results).toEqual(MOCK_TRACE_DATA_SEARCHRESULT);
  });

  it('should convert base64-encoded trace IDs and span IDs in the response to hex format', async () => {
    const results = await TempoTraceQuery.getTraceData({ query: 'FBD37845209D43CDCCD418DC5F9FF021' }, stubTempoContext);
    expect(results.trace?.resourceSpans[0]?.scopeSpans[0]?.spans[1]?.traceId).toEqual(
      'FBD37845209D43CDCCD418DC5F9FF021'
    );
    expect(results.trace?.resourceSpans[0]?.scopeSpans[0]?.spans[1]?.spanId).toEqual('8467BCA11377C166');
    expect(results.trace?.resourceSpans[0]?.scopeSpans[0]?.spans[1]?.parentSpanId).toEqual('9C22EB77CB5C14C7');
  });
});
