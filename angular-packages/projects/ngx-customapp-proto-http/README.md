## ngx-customapp-proto-http

A package that handle details of working with proto over http. Helps to manage headers, errors, serialization,
deserialization.

[Documentation starts here](https://custom-app.github.io/ngx-customapp-sdk/modules/ngx_customapp_proto_http.html)

A part of the [ngx-customapp-sdk](https://custom-app.github.io/ngx-customapp-sdk/).

This package:

- Is an Angular package.
- Depends on ngx-customapp-errors, ngx-customapp-proto-http
- Based on RxJs.
- Provides `RequestService` for sending http request.
- Optional version interceptor, to add a version header to every http request.
- Utils for handling different types of body when parsing proto response.
