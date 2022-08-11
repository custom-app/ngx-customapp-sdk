## ngx-customapp-pattern-auth-before-socket

Connects together rxjs-websocket and jwt packages to implement pattern "Auth before an authorized or unauthorized
socket".

[Documentation starts here](https://custom-app.github.io/ngx-customapp-sdk/modules/ngx_customapp_pattern_auth_before_socket.html)

A part of the [ngx-customapp-sdk](https://custom-app.github.io/ngx-customapp-sdk/).

This package:

- Is an Angular package.
- Depends on customapp-rxjs-websocket and ngx-customapp-jwt packages.
- Based on RxJs and NgRx
- Provides actions to init sockets and close. Sockets support the auto reconnect and the message buffer.
- Supports opening multiple sockets concurrently and in sequence.

Implemented flow:

- The user logs in.
- An http request with user credentials is sent to the backend.
- An http response with JWT and maybe user info is received.
- JWT tokens being saved and included in headers of every request (except explicitly stated).
- The socket opened.
- An optional auth request is sent in the socket.
- An auth response received from the socket.
- Optional Subscription requests are sent in the socket.
- Subscription responses received from the socket.
- Optionally more sockets are opened and more auth and subscription messages are sent.
- The user can log out, logout from every device, maybe log in as another user.
- After logout all the sockets are closed.
