import {createSelector} from '@ngrx/store';
import {selectSocketsState} from './reducers';
import {initInProcessFeatureKey} from './reducers/init-in-process.reducer';
import {closeInProcessFeatureKey} from './reducers/close-in-process.reducer';

export const selectSocketsInitInProcess = createSelector(
  selectSocketsState,
  state => state[initInProcessFeatureKey]
)

export const selectCloseInProcess = createSelector(
  selectSocketsState,
  state => state[closeInProcessFeatureKey]
)
