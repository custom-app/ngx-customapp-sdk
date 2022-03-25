import {jwtFeatureKey, JwtRootState} from '../store/reducers';

/**
 * Used to create selectors, not expected to be used anywhere else
 */
export interface JwtAppRootStateBase<UserInfo> {
  [jwtFeatureKey]: JwtRootState<UserInfo>,
}
