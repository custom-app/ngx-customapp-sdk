import {createFeatureSelector, createSelector, Selector} from '@ngrx/store'
import * as fromJwtRoot from './reducers';
import * as fromUser from './reducers/user.reducer';
import * as fromLoginInProcess from './reducers/login-in-process.reducer';
import * as fromLoginAsInProcess from './reducers/login-as-in-process.reducer';
import * as fromLogoutInProcess from './reducers/logout-in-process.reducer';
import * as fromUserStash from './reducers/user-stash.reducer'


export interface JwtSelectors<UserInfo> {
  selectJwtRootState: Selector<fromJwtRoot.JwtAppRootStateBase<UserInfo>, fromJwtRoot.JwtRootState<UserInfo>>,
  selectJwtUser: Selector<fromJwtRoot.JwtAppRootStateBase<UserInfo>, fromUser.State<UserInfo>>,
  selectJwtLoginInProcess: Selector<fromJwtRoot.JwtAppRootStateBase<UserInfo>, fromLoginInProcess.State>,
  selectJwtLoginAsInProcess: Selector<fromJwtRoot.JwtAppRootStateBase<UserInfo>, fromLoginAsInProcess.State>
  selectJwtLogoutInProcess: Selector<fromJwtRoot.JwtAppRootStateBase<UserInfo>, fromLogoutInProcess.State>,
  selectUserStash: Selector<fromJwtRoot.JwtAppRootStateBase<UserInfo>, fromUserStash.State<UserInfo>>,
}

export function jwtSelectors<UserInfo>(): JwtSelectors<UserInfo> {
  const selectJwtRootState = createFeatureSelector<fromJwtRoot.JwtAppRootStateBase<UserInfo>,
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
