import {JwtActions} from '../jwt.actions';
import {createReducer, on} from '@ngrx/store';

export const loginAsInProcessFeatureKey = 'loginAsInProcess';

export type State = boolean

export function loginAsInProcessReducer(actions: JwtActions<any, any, any>) {
  const initialState: State = false
  const {loginAs, loginAsSucceed, loginAsErrored} = actions
  return createReducer<State>(
    initialState,
    on(loginAs, () => true),
    on(loginAsSucceed, loginAsErrored, () => false)
  );
}
