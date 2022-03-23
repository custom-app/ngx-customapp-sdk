import {ActionCreator} from '@ngrx/store'
import {TypedAction} from './typed-action';

export type ActionCreatorShort<ActionType extends string, Props> = ActionCreator<ActionType, (props: Props) => Props & TypedAction<ActionType>>;
export type ActionCreatorSimple<ActionType extends string> = ActionCreator<ActionType, () => TypedAction<ActionType>>;
