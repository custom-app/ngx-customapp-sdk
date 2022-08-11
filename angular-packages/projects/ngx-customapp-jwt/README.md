## ngx-customapp-jwt

A package for an authorization and a JWT management.

[Documentation starts here](https://custom-app.github.io/ngx-customapp-sdk/modules/ngx_customapp_jwt.html)

A part of the [ngx-customapp-sdk](https://custom-app.github.io/ngx-customapp-sdk/).

This package:

- Is an Angular package.
- Based on RxJs and NgRx.
- Stores the JWT in the localStorage.
- Provides an http interceptor, which can pin the JWT to every http request and refresh it, if necessary.
- Provides a `JwtService` which is responsible for maintaining tokens fresh.
- Provides store for logging in, sending auth request, saving an account info, logging out.
- Supports logging in as another user.
