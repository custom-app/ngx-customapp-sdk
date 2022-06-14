import {TestRequestType, TestResponseType} from './models.spec';


let requestCounter = 0;

export function testCreateRequest(): TestRequestType {
  requestCounter += 2;
  return {
    id: requestCounter,
    request: `request number ${requestCounter}`
  }
}

let responseCounter = 1;

export function testCreateResponse(req?: TestRequestType): TestResponseType {
  responseCounter += 2;
  const id = req?.id || responseCounter
  return {
    id,
    response: `response number ${id}` + (req ? `for request number ${req.id}` : '')
  }
}
