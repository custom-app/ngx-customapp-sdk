/**
 * Used to start actions, when refresh jwt failed. Usually you want to
 * redirect user to the login page.
 */
export abstract class NoFreshJwtListener {
  abstract noFreshJwt: () => void
}

export interface NoFreshJwtListenerConstructor {
  new (...args: any[]): NoFreshJwtListener
}
