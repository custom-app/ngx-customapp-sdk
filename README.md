# ngx-customapp-sdk
SDK allowing you to quickly setup authorization and websocket life cycle in an Angular app. Some utils are also included

# Design
## Tech stack

Suited for Angular.

Monorepo package management through [yarn workspace](https://yarnpkg.com/features/workspaces).

Documentation is maintained with [TypeDoc](https://typedoc.org/) with [typedoc-ngx-theme](https://www.npmjs.com/package/typedoc-ngx-theme)

## Main ideas

### Requirements

SDK must be as easy to setup as possible, but allow comprehensive customisation. This includes:
 - Support for a custom message serialization and usage of custom models (e.g. [protobuff](https://www.npmjs.com/package/typedoc-ngx-theme)).
 - Everything, that is Angular agnostic, must have a dedicated package, so it could be used without Angular.
 - It must be possible to use only features, that you need. Websockets, authorisation, protobuf, interceptors, account management must not be required.
 - Bundle must be optimized.
 - It should be tested as much as possible.
 - It must be easy to maintain.
 - It must have a good english documentation.
 - Some examples.

SDK must implement following functions:
- A websocket life cycle management with authorization and without.
- A support for multiple sockets and a support for conditionally opening them in a specified order.
- Subscribe/unsubscribe requests management.
- JWT and authorization headers management, refreshing jwt before opening sockets and before each request.
- Sync JWT between different packages. Prohibit concurrent refreshes.
- Login, logout functions and account management in the context of authorization.
- A support for changing accounts back and forth (Admin can login as client and login back to admin).
- A Support for receiving account info both inside a websocket life cycle and outside of it.
- Access management (access guards).
- A Forms framework.
- Sync for difference in server time. Support setting time delta after auth, after socket auth or even with dedicated request.
- Some unpredictable functionality (just leave some extra settings and extra methods).

### Packages

To meet all the requierements following packages necessary:
- A package for a websocket life cycle management
- A package for an authorization and JWT management
- A package for an access management
- A package for a forms framework
- A package for working with protobuff over http and websocket

### Authorization and websocket patterns

To determine exact classes and functions these packages must implement, we first need to consider authorisation and socket management patterns.

#### Pattern 1, "Just auth"
Flow:
- The user logs in.
- An http request with user credentials is being sent.
- An http response with JWT tokens and maybe user info is received.
- May be a server time delta is requested or already received and saved.
- JWT tokens being saved and included in headers of every request (except explicitly stated).
- No subscriptions and sockets.
- The user can logout, logout from every device, may be change an account back and fourth.

#### Pattern 2 "Auth before a public socket"
Flow:
- The user logs in.
- An http request with user credentials is being sent.
- An http response with JWT tokens and maybe the user info is received.
- May be server a time delta is requested or already received and saved, may be after the socket is opened.
- JWT tokens being saved and included in headers of every request (except explicitly stated).
- The public socket is opened, may be multiple, may be in specified order, may be with subscriptions.
- The user can logout, logout from every device, may be change an account back and fourth.
- After a logout socket is closed

#### Pattern 3 "Auth after a public socket"
Flow:
- The public socket is opened, may be multiple, may be in specified order, may be with subscriptions.
- May be a server time delta is requested or already received and saved, may be after auth.
- The user logs in
- An http request with user credentials is being sent.
- An http response with JWT tokens and maybe the user info is received.
- JWT tokens being saved and included in headers of every request (except explicitly stated).
- Th user can logout, logout from every device, may be change an account back and fourth.
- After a logout the socket is not closed. The socket does not depend on an account info.

#### Pattern 4 "Auth before an authorized socket"
Flow:
- The user logs in.
- An http request with user credentials is being sent.
- An http response with JWT tokens and maybe user info is received.
- May be a server time delta is requested or already received and saved, may be after a socket opened.
- JWT tokens being saved and included in headers of every request (except explicitly stated).
- The socket opened.
- An auth request is sent in the socket.
- An auth response received from the socket.
- Subscription requests are sent in the socket.
- Subscription responses received from the socket.
- May be more sockets are opened and more auth and subscription messages are sent.
- The user can logout, logout from every device, may be change an account back and fourth.
- After logout all of the sockets are closed.

### Pattern 5 "Auth after an authorized socket"
Flow:
- The user logs in.
- The socket is opened.
- An auth request is sent in the socket.
- An auth response received from the socket.
- Subscription requests are sent in the socket.
- Subscription responses received from the socket.
- May be more sockets are opened and more auth and subscription requests are sent.
- May be a server time delta is requested or already received and saved, may be after a socket opened.
- JWT tokens being saved and included in headers of every request (except explicitly stated).
- The user can logout, logout from every device, may be change an account back and fourth.
- After logout all of the sockets are closed.

