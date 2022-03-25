import {packageName} from '../../constants/package-name';
import * as fromUser from './user.reducer';
import {userReducer} from './user.reducer';
import * as fromLoginInProcess from './login-in-process.reducer';
import {loginInProcessReducer} from './login-in-process.reducer';
import * as fromLogoutInProcess from './logout-in-process.reducer';
import {logoutInProcessReducer} from './logout-in-process.reducer';
import * as fromLoginAsInProcess from './login-as-in-process.reducer';
import {loginAsInProcessReducer} from './login-as-in-process.reducer';
import * as fromUserStash from './user-stash.reducer';
import {userStashReducer} from './user-stash.reducer';
import {jwtActions} from '../jwt.actions';
import {ActionReducerMap, MetaReducer} from '@ngrx/store';


export const jwtFeatureKey = packageName

export interface JwtRootState<UserInfo> {
  [fromUser.userFeatureKey]: fromUser.State<UserInfo>
  [fromLoginInProcess.loginInProcessFeatureKey]: fromLoginInProcess.State;
  [fromLogoutInProcess.logoutInProcessFeatureKey]: fromLogoutInProcess.State;
  [fromLoginAsInProcess.loginAsInProcessFeatureKey]: fromLoginAsInProcess.State;
  [fromUserStash.userStashFeatureKey]: fromUserStash.State<UserInfo>;
}

const actions = jwtActions<any, any, any>()

export const reducers: ActionReducerMap<JwtRootState<any>> = {
  [fromUser.userFeatureKey]: userReducer(actions),
  [fromLoginInProcess.loginInProcessFeatureKey]: loginInProcessReducer(actions),
  [fromLoginAsInProcess.loginAsInProcessFeatureKey]: loginAsInProcessReducer(actions),
  [fromLogoutInProcess.logoutInProcessFeatureKey]: logoutInProcessReducer(actions),
  [fromUserStash.userStashFeatureKey]: userStashReducer(actions),
}

export const metaReducers: MetaReducer<JwtRootState<any>>[] = [];
