import {createFeatureSelector, createSelector, Selector} from '@ngrx/store'
import * as fromJwtRoot from './reducers';
import * as fromUser from './reducers/user.reducer';
import * as fromLoginInProcess from './reducers/login-in-process.reducer';
import * as fromLoginAsInProcess from './reducers/login-as-in-process.reducer';
import * as fromLogoutInProcess from './reducers/logout-in-process.reducer';
import * as fromUserStash from './reducers/user-stash.reducer'
import {JwtAppRootStateBase} from '../models/jwt-root-state-base';


export interface JwtSelectors<UserInfo> {
  selectJwtRootState: Selector<JwtAppRootStateBase<UserInfo>, fromJwtRoot.JwtRootState<UserInfo>>,
  selectJwtUser: Selector<JwtAppRootStateBase<UserInfo>, UserInfo | undefined>,
  selectJwtLoginInProcess: Selector<JwtAppRootStateBase<UserInfo>, fromLoginInProcess.State>,
  selectJwtLoginAsInProcess: Selector<JwtAppRootStateBase<UserInfo>, fromLoginAsInProcess.State>
  selectJwtLogoutInProcess: Selector<JwtAppRootStateBase<UserInfo>, fromLogoutInProcess.State>,
  selectUserStash: Selector<JwtAppRootStateBase<UserInfo>, fromUserStash.State<UserInfo>>,
}

export function jwtSelectors<UserInfo>(): JwtSelectors<UserInfo> {
  const selectJwtRootState = createFeatureSelector<JwtAppRootStateBase<UserInfo>,
    fromJwtRoot.JwtRootState<UserInfo>>(fromJwtRoot.jwtFeatureKey)
  const selectJwtUser = createSelector(
    selectJwtRootState,
    state => state[fromUser.userFeatureKey]
  )
  const selectJwtLoginInProcess = createSelector(
    selectJwtRootState,
    state => state[fromLoginInProcess.loginInProcessFeatureKey]
  )
  const selectJwtLoginAsInProcess = createSelector(
    selectJwtRootState,
    state => state[fromLoginAsInProcess.loginAsInProcessFeatureKey]
  )
  const selectJwtLogoutInProcess = createSelector(
    selectJwtRootState,
    state => state[fromLogoutInProcess.logoutInProcessFeatureKey]
  )
  const selectUserStash = createSelector(
    selectJwtRootState,
    state => state[fromUserStash.userStashFeatureKey]
  )
  return {
    selectJwtRootState,
    selectJwtUser,
    selectJwtLoginInProcess,
    selectJwtLoginAsInProcess,
    selectJwtLogoutInProcess,
    selectUserStash
  }
}
