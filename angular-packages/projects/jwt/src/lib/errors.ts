export class AuthInterceptorDropsReportProgress extends Error {
  constructor() {
    super('The AuthInterceptor provided by the ngx-cutomapp-jwt is disabling report progress feature of the request, ' +
      'you need to use disableAuthInterception http context token');
  }
}
