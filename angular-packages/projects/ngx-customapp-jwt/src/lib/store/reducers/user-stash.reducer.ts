import {JwtActions} from '../jwt.actions';
import {createReducer, on} from '@ngrx/store';

export const userStashFeatureKey = 'userStash';

export type State<UserInfo> = UserInfo[]

export function userStashReducer<UserInfo>(actions: JwtActions<any, any, UserInfo>) {
  const initialState: State<UserInfo> = []
  const {stashUser, unstashUser} = actions
  return createReducer<State<UserInfo>>(
    initialState,
    // @ts-ignore
    on(stashUser, (state: State, {user}: UserInfo): State => {
      return [...state, user]
    }),
    // @ts-ignore
    on(unstashUser, (state: State): State => {
      // works normal on zero-length arrays
      return state.slice(0, state.length - 1)
    })
  );
}
