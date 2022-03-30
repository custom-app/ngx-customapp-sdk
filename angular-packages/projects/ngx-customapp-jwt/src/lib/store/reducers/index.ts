import {packageName} from '../../constants/package-name';
import * as fromUser from './user.reducer';
import * as fromLoginInProcess from './login-in-process.reducer';
import * as fromLogoutInProcess from './logout-in-process.reducer';
import * as fromLoginAsInProcess from './login-as-in-process.reducer';
import * as fromUserStash from './user-stash.reducer';
import * as fromLoginAgainInProcess from './login-again-in-process.reducer'
import {jwtActions} from '../jwt.actions';
import {ActionReducerMap, MetaReducer} from '@ngrx/store';


export const jwtFeatureKey = packageName

export interface JwtRootState<UserInfo> {
  [fromUser.userFeatureKey]: fromUser.State<UserInfo>
  [fromLoginInProcess.loginInProcessFeatureKey]: fromLoginInProcess.State;
  [fromLoginAgainInProcess.loginAgainInProcessFeatureKey]: fromLoginAgainInProcess.State
  [fromLoginAsInProcess.loginAsInProcessFeatureKey]: fromLoginAsInProcess.State;
  [fromLogoutInProcess.logoutInProcessFeatureKey]: fromLogoutInProcess.State;
  [fromUserStash.userStashFeatureKey]: fromUserStash.State<UserInfo>;
}

const actions = jwtActions<any, any, any>()

export const reducers: ActionReducerMap<JwtRootState<any>> = {
  [fromUser.userFeatureKey]: fromUser.reducers(actions),
  [fromLoginInProcess.loginInProcessFeatureKey]: fromLoginInProcess.reducers(actions),
  [fromLoginAgainInProcess.loginAgainInProcessFeatureKey]: fromLoginAgainInProcess.reducers(actions),
  [fromLoginAsInProcess.loginAsInProcessFeatureKey]: fromLoginAsInProcess.reducers(actions),
  [fromLogoutInProcess.logoutInProcessFeatureKey]: fromLogoutInProcess.reducers(actions),
  [fromUserStash.userStashFeatureKey]: fromUserStash.reducers(actions),
}

export const metaReducers: MetaReducer<JwtRootState<any>>[] = [];
