export class JwtInterceptorDropsReportProgress extends Error {
  constructor() {
    super('The JwtInterceptor provided by the ngx-cutomapp-jwt is disabling report progress feature of the request, ' +
      'you need to use disableJwtInterception http context token');
  }
}

export class LoginAsMethodUnimplemented extends Error {
  constructor() {
    super('You are trying to use loginAs feature, but have not implemented the JwtApi.loginAs method. ' +
      'You need to provide loginAs method when implementing JwtApi abstract class ' +
      'or you need to refuse to use the loginAs feature');
  }
}

export class LoginAsCalledWhenUnauthorized extends Error {
  constructor() {
    super('You are trying to use loginAs feature, you have not logged in as a normal user, so there are' +
      'no valid JWT available. It is supposed, that loginAs feature is only used by the authorized user,' +
      'otherwise it is just regular login');
  }
}

export class LoginAsApiMethodDoesNotHaveJwtInAuthResponse extends Error {
  constructor() {
    super('Your loginAs backend api method have returned AuthResponse, which has no JWT in it. Fresh ' +
      ' JWT of another user are required to make requests as that user.');
  }

}
