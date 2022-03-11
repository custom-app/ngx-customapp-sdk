import {JwtInfo} from './jwt-info';

/**
 * A pair of tokens: refresh and access. When working with library, functions and services you provide
 * have to use this interface.
 */
export interface JwtGroup {
  accessToken: JwtInfo,
  refreshToken:  JwtInfo,
}
