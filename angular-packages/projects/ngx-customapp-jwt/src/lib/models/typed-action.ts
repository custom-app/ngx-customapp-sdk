import {Action} from '@ngrx/store'

// cos @ngrx/store doesn't export TypedAction
export declare interface TypedAction<T extends string> extends Action {
  readonly type: T;
}
