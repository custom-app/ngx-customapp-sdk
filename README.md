# ngx-customapp-sdk

SDK allowing you to quickly setup authorization and websocket life cycle in an Angular app. Some utils are also included

# Contents

- [What's included](#whats-included)
- [Package structure](#package-structure)
    * [customapp-rxjs-websocket](#customapp-rxjs-websocket)
    * [ngx-customapp-jwt](#ngx-customapp-jwt)
    * [ngx-customapp-errors](#ngx-customapp-errors)
    * [ngx-customapp-proto-http](#ngx-customapp-proto-http)
    * [ngx-customapp-pattern-auth-before-socket](#ngx-customapp-pattern-auth-before-socket)

# What's included.

Suited for Angular.

- Supports a custom message serialization and usage of custom models (
  e.g. [protobuff](https://www.npmjs.com/package/typedoc-ngx-theme)).
- A websocket life cycle management with authorization and without.
- Supports multiple sockets and conditionally opening them in a specified order.
- JWT and authorization headers management, refreshing jwt before opening sockets and before each request.
- Login, logout functions and account management in the context of authorization.
- Supports logging in as another user (admin can log in as client and log out back to admin).
- Error handling.

# Package structure

There are packages, their requirements and exported functionality listed below.

## customapp-rxjs-websocket

A package for a websocket life cycle management.

[Documentation starts here](https://custom-app.github.io/ngx-customapp-sdk/modules/customapp_rxjs_websocket.html)

This package:

- Is not only an Angular package.
- Based on RxJs.
- Works with a single type for request messages and a single type for response messages.
- Support an auto reconnect. That is a part of the error handling, cos usually there is no way to handle the socket
  error, other than just reopen socket.
- A support for a request buffer. A support for not adding requests to the buffer, different buffers for authorized and
  unauthorized requests, and a support for setting the queue length.
- Supports sending an authorization request(s) just after the opening. Reconnect have to repeat the autorization.
- Supports sending a subscription request(s) just after the authorization.
- Counts successful and unsuccessful opening tries.
- Offers subscriptions for states: pending, opened, authorized, subscribed, closing, closed.
- Support for custom serializer and deserializer.
- Functions for request-response pattern.

## ngx-customapp-jwt

A package for an authorization and a JWT management.

[Documentation starts here](https://custom-app.github.io/ngx-customapp-sdk/modules/ngx_customapp_jwt.html)

This package:

- Is an Angular package.
- Based on RxJs and NgRx.
- Stores the JWT in the localStorage.
- Provides an http interceptor, which can pin the JWT to every http request and refresh it, if necessary.
- Provides a `JwtService` which is responsible for maintaining tokens fresh.
- Provides store for logging in, sending auth request, saving an account info, logging out.
- Supports logging in as another user.

## ngx-customapp-errors

A package for handling errors according to our own conventions.

[Documentation starts here](https://custom-app.github.io/ngx-customapp-sdk/modules/ngx_customapp_errors.html)

This package:

- Is an Angular package.
- Reports all errors, except ones from doNoSend list, to the backend.
- Works with normalized error strings.
- Just after handling and reporting the error, it is transformed into a human-readable error and shown to the user.

## ngx-customapp-proto-http

A package that handle details of working with proto over http. Helps to manage headers, errors, serialization,
deserialization.

[Documentation starts here](https://custom-app.github.io/ngx-customapp-sdk/modules/ngx_customapp_proto_http.html)

This package:

- Is an Angular package.
- Depends on ngx-customapp-errors and ngx-customapp-jwt (integration with authorization).
- Based on RxJs.
- Provides `RequestService` for sending http request.
- Optional version interceptor, to add a version header to every http request.
- Utils for handling different types of body when parsing proto response.

## ngx-customapp-pattern-auth-before-socket

Connects together rxjs-websocket and jwt packages to implement pattern "Auth before an authorized or unauthorized
socket".

[Documentation starts here](https://custom-app.github.io/ngx-customapp-sdk/modules/ngx_customapp_pattern_auth_before_socket.html)

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

# Example

Suppose you have an Angular + NgRx app using protocol buffers for communication with backend.
The app has login/password authorization and uses websockets to handle updates and send some requests.

Suppose your proto3 description of the api messages looks like this:
```
message Request {
  uint64 id = 1;  // id запроса
  reserved 2, 3, 4, 9;
  oneof data {
    option (validate.required) = true;
    CheckVersionRequest check_version = 5 [(validate.rules).message.required = true];  // проверка версии
    AuthCodeRequest auth_code = 6 [(validate.rules).message.required = true];  // запрос смс-кода авторизации
    AuthRequest auth = 7 [(validate.rules).message.required = true];  // авторизация
    SocketAuthRequest socket_auth = 8 [(validate.rules).message.required = true];  // авторизация WS
    ClientListRequest clients = 10 [(validate.rules).message.required = true];  // список клиентов
    ClientUpdateRequest client_update = 11 [(validate.rules).message.required = true];  // редактирование клиента
    ClientAddressListRequest client_addresses = 12 [(validate.rules).message.required = true];  // список адресов
    ClientAddressAddRequest client_address_add = 13 [(validate.rules).message.required = true];  // добавление адреса
    ClientAddressUpdateRequest client_address_update = 14 [(validate.rules).message.required = true];  // редактирование адреса
    ClientAddressDeleteRequest  client_address_delete = 15 [(validate.rules).message.required = true];  // удаление адреса
    CategoryListRequest categories = 16 [(validate.rules).message.required = true];  // список категорий
    CategoryAddRequest category_add = 17 [(validate.rules).message.required = true];   // добавление категории
    CategoryUpdateRequest category_update = 18 [(validate.rules).message.required = true];   // редактирование категории
    CategoryDeleteRequest category_delete = 19 [(validate.rules).message.required = true];   // удаление категории
    MenuListRequest menu = 20 [(validate.rules).message.required = true];      // список анализов
    MenuAddRequest menu_add = 21 [(validate.rules).message.required = true];   // добавление анализа
    MenuUpdateRequest menu_update = 22 [(validate.rules).message.required = true];   // редактирование анализа
    MenuDeleteRequest menu_delete = 23 [(validate.rules).message.required = true];   // удаление анализа
    CartInfoRequest cart = 24 [(validate.rules).message.required = true];   // корзина
    CartUpdateRequest cart_update = 25 [(validate.rules).message.required = true];  // редактирование корзины
    OrderListRequest orders = 26 [(validate.rules).message.required = true];  // список заказов
    OrderAddRequest order_add = 27 [(validate.rules).message.required = true];  // добавление заказа
    OrderUpdateRequest order_update = 28 [(validate.rules).message.required = true];  // редактирование заказа
    PageConfigRequest page_config = 29 [(validate.rules).message.required = true];  // конфиг постраничного вывода
    ConfigUpdateRequest config_update = 30 [(validate.rules).message.required = true]; // редактирование конфига
    BugReportRequest bug_report = 31 [(validate.rules).message.required = true]; // баг репорт
    SubscribeRequest sub = 32 [(validate.rules).message.required = true];  // подписка
    UnsubscribeRequest unsub = 33 [(validate.rules).message.required = true];  // отписка
  }
}
```

# Development

## Initial setup

Install deps for non-angular packages.

```shell
yarn
```

Install deps for angular packages.

```shell
cd angular-packages
yarn
```

Build all packages.

```shell
# go to the project root
cd ..
yarn build
```

## Tests

Running tests in watch mode is only available per single package.
For example, customapp-rxjs-websocket

```shell
cd packages/rxjs-websocket
yarn test
```

To run the tests for all packages once, use this command.

```shell
yarn test-ci
```

## Publishing

To set version of all packages to 1.2.3, run

```shell
yarn set-version 1.2.3
```

To publish all packages, run

```shell
yarn publish
```

## Adding a new Angular package

Create a new library in the Angular workspace. Package name should be prefixed with `ngx-customapp-`

```shell
cd angular-packages
ng g library ngx-customapp-jwt
```

Add watch:pkg, build:pkg and test:pkg scripts to package.json

```json
{
  "scripts": {
    "watch:jwt": "yarn build:jwt --watch --configuration=development",
    "build:jwt": "ng build ngx-customapp-jwt",
    "test:jwt": "ng test ngx-customapp-jwt"
  }
}
```

Modify common build script, by adding `&& yarn build:pkg && yarn`

```json
{
  "scripts": {
    "build": "/* ... old command */ && yarn build:jwt && yarn"
  }
}
```

Done! All other common scripts should just work.

## Debug

To reproduce and fix an error, you need to link local version of the ngx-customapp-sdk with a reproduction app.
To do so, the app needs to use yarn 2, because of new `portal:` [protocol](https://dev.to/arcanis/introducing-yarn-2-4eh1#new-protocol-raw-portal-endraw-).
[Yarn migration docs](https://yarnpkg.com/getting-started/migration).

Suppose your local ngx-customapp-sdk version is located in `~/WebstormProjects/ngx-customapp-sdk`.

Register packages from ngx-customapp-sdk for use in the app.

```sh
yarn link --all ~/WebstormProjects/ngx-customapp-sdk
yarn link --all ~/WebstormProjects/ngx-customapp-sdk/angular-packages/
```

Add preserveSymlink option to the `tsconfig.json`. This allows Typescript to properly resolve dependencies and 
peer dependencies of the linked packages.

```json
{
  "compilerOptions": {
    "preserveSymlinks": true
  }
}

```

Run the app and debug with pleasure (impossible).
