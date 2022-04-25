import {createAction, props} from '@ngrx/store';
import {packageName} from '../constants/package-name';


/**
 * Used to make an authorization and a socket initialization an atomic action.
 * Is dispatched when BOTH the login action and the initSockets action succeed.
 */
export const loginAndInitSocketsSucceed = createAction(
  `[${packageName}] login and init sockets succeed`
)

/**
 * Used to make an authorization and a socket initialization an atomic action.
 * Is dispatched when either the login action OR the initSockets action errored.
 */
export const loginAndInitSocketsErrored = createAction(
  `[${packageName}] login and init sockets errored`,
  props<{ error: string }>()
)

/**
 * Used to make an authorization and a socket initialization an atomic action.
 * Is dispatched when BOTH the loginAs action and the initSockets action succeed.
 */
export const loginAsAndInitSocketsSucceed = createAction(
  `[${packageName}] login as and init sockets succeed`,
)


/**
 * Used to make an authorization and a socket initialization an atomic action.
 * is dispatched when either the loginAs action OR the initSockets action errored.
 */
export const loginAsAndInitSocketsErrored = createAction(
  `[${packageName}] login as and init sockets errored`,
  props<{ error: string }>()
)


/**
 * Used to make an authorization and a socket initialization an atomic action.
 * Is dispatched when BOTH the loginAgain action and the initSockets action succeed.
 */
export const loginAgainAndInitSocketsSucceed = createAction(
  `[${packageName}] login again and init sockets succeed`
)

/**
 * Used to make an authorization and a socket initialization an atomic action.
 * is dispatched when either the loginAgain action OR the initSockets action errored.
 */
export const loginAgainAndInitSocketsErrored = createAction(
  `[${packageName}] login again and init sockets errored`,
  props<{ error: string }>(),
)

export const initSockets = createAction(
  `[${packageName}] init sockets`,
)

export const initSocketsSucceed = createAction(
  `[${packageName}] init sockets succeed`,
)

export const initSocketsErrored = createAction(
  `[${packageName}] init sockets errored`,
  props<{ error: string }>(),
)

export const closeSockets = createAction(
  `[${packageName}] close sockets`,
)

// there is no way to handle close error, so there is only 'finish' action,
// that can be either success or error.
// It is also possible, that sockets are closed, even if the closing errored.
export const closeSocketsFinished = createAction(
  `[${packageName} close sockets finished`,
)
