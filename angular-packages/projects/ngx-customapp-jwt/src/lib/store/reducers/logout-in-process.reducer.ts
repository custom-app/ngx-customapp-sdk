import {JwtActions} from '../jwt.actions';
import {createReducer, on} from '@ngrx/store';

export const logoutInProcessFeatureKey = 'logoutInProcess';

export type State = boolean

export function reducers(actions: JwtActions<any, any, any>) {
  const initialState: State = false
  const {logout, logoutSucceed, logoutErrored} = actions
  return createReducer<State>(
    initialState,
    on(logout, () => true),
    on(logoutSucceed, logoutErrored, () => false)
  );
}
