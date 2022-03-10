# ngx-customapp-sdk
SDK allowing you to quickly setup authorization and websocket life cycle in an Angular app. Some utils are also included

# Contents

- [Design](#design)
  - [Tech stack](#tech-stack)
  - [Requirements](#requirements)
  - [Packages](#packages)
  - [Authorization and websocket patterns](#authorization-and-websocket-patterns)
    * [Pattern 1, "Just auth"](#pattern-1-just-auth)
    * [Pattern 2 "Auth before a public socket"](#pattern-2-auth-before-a-public-socket)
    * [Pattern 3 "Auth after a public socket"](#pattern-3-auth-after-a-public-socket)
    * [Pattern 4 "Auth before an authorized socket"](#pattern-4-auth-before-an-authorized-socket)
    * [Pattern 5 "Auth after an authorized socket"](#pattern-5-auth-after-an-authorized-socket)
  - [Package structure](#package-structure)
    * [ngx-customapp-sdk/utils](#ngx-customapp-sdkutils)
    * [ngx-customapp-sdk/rxjs-websocket](#ngx-customapp-sdkrxjs-websocket)
    * [ngx-customapp-sdk/jwt](#ngx-customapp-sdkjwt)
    * [ngx-customapp-sdk/proto-http](#ngx-customapp-sdkproto-http)
    * [ngx-customapp-sdk/pattern-auth-before-authorized-socket](#ngx-customapp-sdkpattern-auth-before-authorized-socket)


# Design
## Tech stack

Suited for Angular.

Monorepo package management through [yarn workspace](https://yarnpkg.com/features/workspaces).

Testing with [Karma](https://karma-runner.github.io/latest/index.html) and [Jasmine](https://jasmine.github.io/)

Documentation is maintained with [TypeDoc](https://typedoc.org/) and [typedoc-ngx-theme](https://www.npmjs.com/package/typedoc-ngx-theme)

## Requirements

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
- A support for changing accounts back and forth (Admin can log in as client and login back to admin).
- A Support for receiving account info both inside a websocket life cycle and outside it.
- Access management (access guards).
- A Forms framework.
- Sync for difference in server time. Support setting time delta after auth, after socket auth or even with dedicated request.
- Some unpredictable functionality (just leave some extra settings and extra methods).

## Packages

To meet all the requierements following packages necessary:
- A package with widely used utils
- A package for a websocket life cycle management
- A package for an authorization and JWT and access management
- A package for working with protobuff over http and websocket
- A package for every pattern
- A package for a forms framework

## Authorization and websocket patterns

To determine exact classes and functions these packages must implement, we first need to consider authorisation and socket management patterns.

### Pattern 1, "Just auth"
Flow:
- The user logs in.
- An http request with user credentials is being sent.
- An http response with JWT tokens and maybe user info is received.
- May be a server time delta is requested or already received and saved.
- JWT tokens being saved and included in headers of every request (except explicitly stated).
- No subscriptions and sockets.
- The user can logout, logout from every device, may be change an account back and forth.

### Pattern 2 "Auth before a public socket"
Flow:
- The user logs in.
- An http request with user credentials is being sent.
- An http response with JWT tokens and maybe the user info is received.
- May be server a time delta is requested or already received and saved, may be after the socket is opened.
- JWT tokens being saved and included in headers of every request (except explicitly stated).
- The public socket is opened, may be multiple, may be in specified order, may be with subscriptions.
- The user can logout, logout from every device, may be change an account back and forth.
- After a logout socket is closed

### Pattern 3 "Auth after a public socket"
Flow:
- The public socket is opened, may be multiple, may be in specified order, may be with subscriptions.
- May be a server time delta is requested or already received and saved, may be after auth.
- The user logs in
- An http request with user credentials is being sent.
- An http response with JWT tokens and maybe the user info is received.
- JWT tokens being saved and included in headers of every request (except explicitly stated).
- Th user can logout, logout from every device, may be change an account back and forth.
- After a logout the socket is not closed. The socket does not depend on an account info.

### Pattern 4 "Auth before an authorized socket"
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
- The user can log out, logout from every device, may be change an account back and forth.
- After logout all the sockets are closed.

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

## Package structure

There are packages, their requirements and exported functionality listed below.

### ngx-customapp-sdk/utils

A package with widely used utils

### ngx-customapp-sdk/rxjs-websocket

A package for a websocket life cycle management.
Requirements and functionality:
- Based on RxJs
- Works with a single type for request messages and a single type for response messages.
- Support an auto reconnect.
- A support for a request buffer. A support for not adding requests to the buffer, different buffers for authorized and unauthorized requests, and a support for setting the queue length.
- Support sending an authorization request(s) just after the opening. Reconnect have to repeat the autorization.
- Support sending a subscription request(s) just after the authorization.
- Counts successful and unsuccessful opening tries.
- Offers to set a predicate for reopening socket.
- Offers subscriptions for states: pending, opened, authorized, subscribed, closing, closed.
- Offers subscriptions for not successful state transitions: notAuthorized, notSubscribed.
- But there is no "notAuthorized" or "notSubscribed" state, the socket is closed immediately.
- The error observable is provided, but it is useless, cos there is generally no way to handle a websocket error, 
- other than close the socket, which is made internally.
- Support for custom serializer and deserializer.
- Functions for request-response pattern.

### ngx-customapp-sdk/jwt

A package for an authorization and a JWT management

Requirements and functionality:
- Based on RxJs and NgRx.
- Stores the JWT in the localStorage.
- Does not expose a key, which is used to access the JWT in the localStorage. You do not need to access localStorage manualy.
- Provides an http interceptor, which can pin JWT to every http request and refresh it, if necessary.
- Provides a service which is responsible for maintaining tokens fresh.
- Provides store for sending auth request, saving response and account info, sending logout messages.
- Provides an access guard and models for managing permissions.

### ngx-customapp-sdk/proto-http

A package that handle details of working with proto over http. Helps to manage headers, errors, serialization, deserialization.
Requirements and functionality:
- Based on RxJs.
- Base service for sending http request.
- Version interceptor.
- Service for handling and reporting errors.
- Utils for handling different types of body when parsing proto response.

### ngx-customapp-sdk/forms

A package for a forms framework
Requirements and functionality:
- Suited for [template driven forms](https://angular.io/guide/forms).
- Compatible with Material inputs, Carbon Components.
- Implements useful utils for handling validation errors, preventing double clicks and managing disabled state of submit button.

### ngx-customapp-sdk/pattern-auth-before-authorized-socket

Connects together rxjs-websocket, jwt, proto-http packages to implement [Pattern 4 "Auth before an authorized socket"](#pattern-4-auth-before-an-authorized-socket)
