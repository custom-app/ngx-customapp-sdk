import {HumanReadableError, NormalizedError} from '../../../models/errors-text';

export const commonErrors: Record<NormalizedError, HumanReadableError> = {
  'no connection': 'Cannot connect to the server. Please, try later.',
  'unhandled error': 'Unknown error. Please, try later.',
  'not found': 'No such item.',
  'service unavailable': 'Server error. Please, try later.',
  'internal server error': 'Critical server error. Please, try later.',
  'bad gateway': 'Server error. Please, try later.',
  'gateway timeout': 'Server didn\'t respond in time. Please, try later.',
  'failed auth': 'Login or password wrong',
  forbidden: 'No access to this content',
  'timeout has occurred': 'Connection to the server have took too long',
  'permission denied': 'Permission denied',
  timeout: 'Request handling have took too long',
  'unknown method': 'Unknown method',
  'database failed': 'Fatal database error',
  'invalid image': 'Invalid image',
  'image disabled': 'Image disabled',
  'auth required': 'Auth required',
  'missing credentials': 'Missing credentials',
  'invalid version': 'Old version of the app loaded, pleas refresh the page.',
  'invalid token': 'Invalid authorization token',
}
