import {createAction, props} from '@ngrx/store';
import {packageName} from '../constants/package-name';

export const initSockets = createAction(
  `[${packageName}] init sockets`,
)

export const initSocketsSucceed = createAction(
  `[${packageName}] init sockets succeed`,
)

export const initSocketsErrored = createAction(
  `[${packageName} init sockets errored]`,
  props<{ error: string }>(),
)

export const closeSockets = createAction(
  `[${packageName}] close sockets`,
)

// there is no way to handle close error, so there is only 'finish' action,
// that can be either success or error.
// It is also possible, that sockets are closed, even if the closing errored.
export const closeSocketsFinished = createAction(
  `[${packageName} close sockets succeed`,
)
