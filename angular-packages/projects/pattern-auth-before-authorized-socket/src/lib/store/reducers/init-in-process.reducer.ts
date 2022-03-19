import {createReducer, on} from '@ngrx/store';
import {initSockets, initSocketsErrored, initSocketsSucceed} from '../sockets.actions';


export const initInProcessFeatureKey = 'initInProcess';

export type State = boolean

export const initialState: State = false

export const reducer = createReducer(
  initialState,
  on(initSockets, () => true),
  on(initSocketsSucceed, initSocketsErrored, () => false)
);
