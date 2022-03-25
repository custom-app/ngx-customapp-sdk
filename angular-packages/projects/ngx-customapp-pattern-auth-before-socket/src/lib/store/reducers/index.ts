import {ActionReducerMap, createFeatureSelector, MetaReducer} from '@ngrx/store';
import {packageName} from '../../constants/package-name';
import * as fromInitInProcess from './init-in-process.reducer';
import * as fromCloseInProcess from './close-in-process.reducer';


export const socketsFeatureKey = packageName;

export interface SocketsRootState {

  [fromInitInProcess.initInProcessFeatureKey]: fromInitInProcess.State;
  [fromCloseInProcess.closeInProcessFeatureKey]: fromCloseInProcess.State;
}

export const reducers: ActionReducerMap<SocketsRootState> = {

  [fromInitInProcess.initInProcessFeatureKey]: fromInitInProcess.reducer,
  [fromCloseInProcess.closeInProcessFeatureKey]: fromCloseInProcess.reducer,
};


export const metaReducers: MetaReducer<SocketsRootState>[] = [];

export const selectSocketsState = createFeatureSelector<SocketsRootState>(socketsFeatureKey)
