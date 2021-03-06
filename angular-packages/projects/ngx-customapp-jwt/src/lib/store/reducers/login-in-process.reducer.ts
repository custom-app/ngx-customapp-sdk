import {JwtActions} from '../jwt.actions';
import {createReducer, on} from '@ngrx/store';

export const loginInProcessFeatureKey = 'loginInProcess';

export type State = boolean

export function reducers(actions: JwtActions<any, any, any>) {
  const initialState: State = false
  const {login, loginSucceed, loginErrored} = actions
  return createReducer<State>(
    initialState,
    on(login, () => true),
    on(loginSucceed, loginErrored, () => false)
  );
}
