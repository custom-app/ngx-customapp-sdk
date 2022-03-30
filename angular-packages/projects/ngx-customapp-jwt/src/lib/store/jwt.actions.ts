import {packageName} from '../constants/package-name';
import {createAction, props} from '@ngrx/store'
import {ActionCreatorShort, ActionCreatorSimple} from '../models/action-creator-short';

const types = {
  login: `[${packageName}] login`,
  loginSucceed: `[${packageName}] login succeed`,
  loginErrored: `[${packageName}] login errored`,

  loginAgain: `[${packageName}] login again`,
  loginAgainSucceed: `[${packageName}] login again succeed`,
  loginAgainErrored: `[${packageName}] login again errored`,

  loginAs: `[${packageName}] login as`,
  loginAsSucceed: `[${packageName}] login as succeed`,
  loginAsErrored: `[${packageName}] login as errored`,

  logout: `[${packageName}] logout`,
  logoutSucceed: `[${packageName}] logout succeed`,
  logoutErrored: `[${packageName}] logout errored`,

  stashUser: `[${packageName}] stash user`,
  unstashUser: `[${packageName}] unstash user`,
  setUser: `[${packageName}] set user`
}

type Error = { error: string }

export interface JwtActions<Credentials, AuthResponse, UserInfo, UserId = number> {
  login: ActionCreatorShort<typeof types.login, { credentials: Credentials }>,
  loginSucceed: ActionCreatorShort<typeof types.loginSucceed, { response: AuthResponse }>,
  loginErrored: ActionCreatorShort<typeof types.loginErrored, Error>,

  loginAgain: ActionCreatorShort<typeof types.loginAgain, { credentials: Credentials }>,
  loginAgainSucceed: ActionCreatorShort<typeof types.loginAgainSucceed, { response: AuthResponse }>,
  loginAgainErrored: ActionCreatorShort<typeof types.loginAgainErrored, Error>,

  loginAs: ActionCreatorShort<typeof types.loginAs, { userId: UserId }>,
  loginAsSucceed: ActionCreatorShort<typeof types.loginAsSucceed, { response: AuthResponse }>,
  loginAsErrored: ActionCreatorShort<typeof types.loginAsErrored, Error>,

  logout: ActionCreatorShort<typeof types.logout, { fromAllDevices?: boolean }>,
  logoutSucceed: ActionCreatorSimple<typeof types.logoutSucceed>,
  logoutErrored: ActionCreatorShort<typeof types.logoutErrored, Error>,

  stashUser: ActionCreatorShort<typeof types.stashUser, { user: UserInfo }>,
  unstashUser: ActionCreatorSimple<typeof types.unstashUser>,
  setUser: ActionCreatorShort<typeof types.setUser, { user: UserInfo | undefined }>
}

/**
 * Actions of the JWT store.
 *
 * `login` - to be dispatched from login page (or, may be, login effects, if you have complex authorization)
 *
 * `loginSucceed`, `loginErrored` - to indicate the result of the authorization.
 *
 * `loginAgain` - internal, is dispatched from the JwtGuard. Mostly the same, as `login`,
 * but can have different effects (e.g. no navigation after `loginAgainSucceed`).
 *
 * `loginAgainSucceed`, `loginAgainErrored` - to indicate the result of the authorization,
 * triggered by the `loginAgain` action.
 *
 * `loginAs` - to be dispatched by the authorized user, who wants to log in as another user. Contains the target user's UserId.
 *
 * `loginAsSucceed`, `loginAsErrored` - to indicate the result of the authorization as another user.
 *
 * `logout` - to be dispatched by the authorized user. If there have been dispatched `loginAs` before, JWTs
 * of the current user are destroyed (via calling {@link JwtApi.logout}), and JWTs and the UserInfo of the previous
 * user are restored from the store.
 *
 * `logoutSucceed`, `logoutErrored` - to indicate the result of the logout.
 *
 * `stashUser`, `unstashUser`, `setUser` - internal, are used to implement restoration of the
 * previous user (if there have been dispatched `loginAs`) during logout.
 */
export function jwtActions<Credentials, AuthResponse, UserInfo, UserId = number>(): JwtActions<Credentials, AuthResponse, UserInfo, UserId> {
  return {
    login: createAction(
      types.login,
      props<{ credentials: Credentials }>()
    ),
    loginSucceed: createAction(
      types.loginSucceed,
      props<{ response: AuthResponse }>(),
    ),
    loginErrored: createAction(
      types.loginErrored,
      props<{ error: string }>(),
    ),

    loginAgain: createAction(
      types.loginAgain,
      props<{ credentials: Credentials }>()
    ),
    loginAgainSucceed: createAction(
      types.loginAgainSucceed,
      props<{ response: AuthResponse }>(),
    ),
    loginAgainErrored: createAction(
      types.loginAgainErrored,
      props<{ error: string }>(),
    ),

    loginAs: createAction(
      types.loginAs,
      props<{ userId: UserId }>()
    ),
    loginAsSucceed: createAction(
      types.loginAsSucceed,
      props<{ response: AuthResponse }>()
    ),
    loginAsErrored: createAction(
      types.loginAsErrored,
      props<{ error: string }>(),
    ),

    logout: createAction(
      types.logout,
      props<{ fromAllDevices?: boolean }>()
    ),
    logoutSucceed: createAction(
      types.logoutSucceed,
    ),
    logoutErrored: createAction(
      types.logoutErrored,
      props<Error>(),
    ),

    stashUser: createAction(
      types.stashUser,
      props<{ user: UserInfo }>(),
    ),
    unstashUser: createAction(
      types.unstashUser,
    ),
    setUser: createAction(
      types.setUser,
      props<{ user: UserInfo | undefined }>(),
    )
  }
}
