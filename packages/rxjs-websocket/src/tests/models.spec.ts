import {WebSocketControllerConfig} from '../models/websocket-controller-config';

export interface TestRequestType {
  id: number,
  request: string,
}

export interface TestResponseType {
  id: number,
  response: string,
}

export type TestBufferConfig = WebSocketControllerConfig<TestRequestType, TestResponseType>['buffer']
