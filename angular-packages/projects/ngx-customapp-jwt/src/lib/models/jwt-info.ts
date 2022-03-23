/**
 * Describes a JWT.
 */
export interface JwtInfo {
  /** The JWT itself. */
  token: string;
  /** A timestamp, after which the token becomes invalid. */
  expiresAt: number;
}
