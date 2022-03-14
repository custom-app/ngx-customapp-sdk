import {packageName} from '../../constants/package-name';
import * as fromUser from './user.reducer';
import * as fromLoginInProcess from './login-in-process.reducer';
import * as fromLogoutInProcess from './logout-in-process.reducer';
import * as fromLoginAsInProcess from './login-as-in-process.reducer';
import * as fromUserStash from './user-stash.reducer';


export const jwtFeatureKey = packageName

export interface JwtRootState<UserInfo> {
  [fromUser.userFeatureKey]: fromUser.State<UserInfo>
  [fromLoginInProcess.loginInProcessFeatureKey]: fromLoginInProcess.State;
  [fromLogoutInProcess.logoutInProcessFeatureKey]: fromLogoutInProcess.State;
  [fromLoginAsInProcess.loginAsInProcessFeatureKey]: fromLoginAsInProcess.State;
  [fromUserStash.userStashFeatureKey]: fromUserStash.State<UserInfo>;
}

/**
 * Used to create selectors, not expected to be used anywhere else
 */
export interface AppRootStateBase<UserInfo> {
  [jwtFeatureKey]: JwtRootState<UserInfo>,
}
