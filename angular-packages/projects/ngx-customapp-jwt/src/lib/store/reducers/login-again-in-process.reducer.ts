import {JwtActions} from '../jwt.actions';
import {createReducer, on} from '@ngrx/store';

export const loginAgainInProcessFeatureKey = 'loginAgainInProcess';

export type State = boolean

export function reducers(actions: JwtActions<any, any, any>) {
  const initialState: State = false
  const {loginAgain, loginAgainSucceed, loginAgainErrored} = actions
  return createReducer<State>(
    initialState,
    on(loginAgain, () => true),
    on(loginAgainSucceed, loginAgainErrored, () => false)
  );
}
