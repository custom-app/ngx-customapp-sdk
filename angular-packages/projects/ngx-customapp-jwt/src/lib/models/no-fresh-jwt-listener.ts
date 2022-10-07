/**
 * Used to start actions, when refresh jwt failed. Usually you want to
 * redirect user to the login page.
 *
 * Message describes, where the noFreshJwtListener was called
 */
export abstract class NoFreshJwtListener {
  abstract noFreshJwt: (message: string) => void
}

export interface NoFreshJwtListenerConstructor {
  new (...args: any[]): NoFreshJwtListener
}
