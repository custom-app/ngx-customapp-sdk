import {defaultWebSocketMessageBufferSize, WebSocketMessageBuffer} from './web-socket-message-buffer';
import {TestRequestType, TestResponseType} from './tests/models.spec';
import {testCreateRequest} from './tests/helpers.spec';

describe('WebSocketMessageBuffer', () => {
  it('should be created and empty', () => {
    const buffer = new WebSocketMessageBuffer<TestRequestType, TestResponseType>();
    expect(buffer.removeAny()).toEqual([])
    expect(buffer.removeAuth()).toEqual([])
    expect(buffer.removeSub()).toEqual([])
  })
  it('should add and remove with default configuration', () => {
    const buffer = new WebSocketMessageBuffer<TestRequestType, TestResponseType>();
    const requests: TestRequestType[] = []
    for (let i = 0; i < defaultWebSocketMessageBufferSize; i++) {
      const req = testCreateRequest()
      requests.unshift(req)
      buffer.addAny(req)
    }
    expect(buffer.removeAny()).toEqual(requests)
  })
  it('should overflow with default configuration', () => {
    const buffer = new WebSocketMessageBuffer<TestRequestType, TestResponseType>();
    const requests: TestRequestType[] = []
    for (let i = 0; i < defaultWebSocketMessageBufferSize + 1; i++) {
      const req = testCreateRequest()
      requests.unshift(req)
      buffer.addAny(req)
    }
    expect(buffer.removeAny()).toEqual(requests.slice(0, requests.length - 1))
  })
})
