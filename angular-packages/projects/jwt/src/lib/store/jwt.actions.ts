import {packageName} from '../constants/package-name';
import {createAction, props} from '@ngrx/store'
import {ActionCreatorShort, ActionCreatorSimple} from '../models/action-creator-short';

const types = {
  login: `[${packageName}] login`,
  loginSucceed: `[${packageName}] login succeed`,
  loginErrored: `[${packageName}] login errored`,

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

export interface JwtActions<Credentials, UserId, AuthResponse, UserInfo> {
  login: ActionCreatorShort<typeof types.login, { credentials: Credentials }>,
  loginSucceed: ActionCreatorShort<typeof types.loginSucceed, { response: AuthResponse }>,
  loginErrored: ActionCreatorShort<typeof types.loginErrored, Error>,

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

export function jwtActions<Credentials, UserId, AuthResponse, UserInfo>(): JwtActions<Credentials, UserId, AuthResponse, UserInfo> {
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
