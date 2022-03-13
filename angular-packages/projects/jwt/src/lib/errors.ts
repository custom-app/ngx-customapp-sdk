export class AuthInterceptorDropsReportProgress extends Error {
  constructor() {
    super('The AuthInterceptor provided by the ngx-cutomapp-jwt is disabling report progress feature of the request, ' +
      'you need to use disableAuthInterception http context token');
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
