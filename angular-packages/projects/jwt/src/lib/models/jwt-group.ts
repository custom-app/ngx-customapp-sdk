/**
 * A pair of tokens: refresh and access. When working with library, functions and services you provide
 * have to use this interface.
 */
export interface JwtGroup<JwtInfoType> {
  accessToken: JwtInfoType,
  refreshToken: JwtInfoType,
}
