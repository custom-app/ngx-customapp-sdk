import {createReducer, on} from '@ngrx/store';
import {closeSockets, closeSocketsFinished} from '../sockets.actions';


export const closeInProcessFeatureKey = 'closeInProcess';

export type State = boolean

export const initialState: State = false

export const reducer = createReducer(
  initialState,
  on(closeSockets, () => true),
  on(closeSocketsFinished, () => false)
);
