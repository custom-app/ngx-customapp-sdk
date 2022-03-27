## customapp-rxjs-websocket

A package for a websocket life cycle management.

[Documentation starts here](https://custom-app.github.io/ngx-customapp-sdk/interfaces/packages_rxjs_websocket_src.WebSocketControllerConfig.html)

A part of the [ngx-customapp-sdk](https://custom-app.github.io/ngx-customapp-sdk/).

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
