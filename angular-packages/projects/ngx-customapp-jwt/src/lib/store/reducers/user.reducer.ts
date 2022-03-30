import {JwtActions} from '../jwt.actions';
import {createReducer, on} from '@ngrx/store';

export const userFeatureKey = 'user';

export type State<UserInfo> = UserInfo | undefined

export function reducers<UserInfo>(actions: JwtActions<any, any, UserInfo>) {
  const initialState: State<UserInfo> = undefined
  const {setUser} = actions
  return createReducer<State<UserInfo>>(
    initialState as State<UserInfo>,
    // on() function typings break when working with generic types, so I'm using ts-ignore and
    // explicitly declare argument and return types of the reducer function
    // @ts-ignore
    on(setUser, (state: State, {user}): State => {
      return user
    })
  );
}
