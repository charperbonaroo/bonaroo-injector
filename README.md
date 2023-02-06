## What is this?

This is a boring simple library for lazily initializing things based on other lazy initialized things.

This way things are only initialized when needed, and you can replace anything in the dependencies chain with something else, which is useful for testing.

It's called Injector because it is inspired by some dependency injection libraries.

Related: https://en.wikipedia.org/wiki/Dependency_injection#Dependency_Injection_Pattern

## Installing

    npm i bonaroo-injector

## Example usage

```ts
import {Injector} from "bonaroo-injector";
const injector = Injector.instance;
injector.constant("port", 4000);
injector.factory("server", (port, date) => `Server :${port} at ${date}`, ["port", "now"])
injector.service("now", Date)
injector.get("server") // 'Server :4000 at Sat Sep 29 2018 09:58:34 GMT+0200 (CEST)'

class MyServer {
  constructor(public port: number) {}

  public thing() { return this.port; }
}

class ServerMock extends MyServer {
  constructor(public port: number) {}

  public thing() { return 9000; }
}

injector.service(MyServer, ["port"])
injector.get(MyServer) // MyServer-instance port=4000

// substitute a class, useful for injecting mocks
const testInjector = new Injector()
testInjector.service(MyServer, ServerMock, ["port"])
testInjector.get(MyServer) // ServerMock-instance
```

## Relevant source

See src/index.ts

## Exports

- `new Injector()`: Create a new instance of `Injector`.
- `Injector.instance`: Shared instance of `Injector`.
- `injector.constant(name: any, value: any)`: Set a constant value
- `injector.factory(name: any, fn: (...args) => any, params?: any[])`: Set a value returned by a function. Function arguments can be added by adding an array of value names as a 3rd argument. Returned value will be cached.
- `injector.service(name: any, fn: constructor, params?: any[]`: Set a value returned by a constructor. Constructor arguments can be added by adding an array of value names as a 3rd argument. Returned value will be cached.
- `injector.service(fn: constructor, params?: string[]`: Set a value returned by a constructor, using the constructor as a name.
- `injector.alias(name: any, source: any)`: Set an alias.
- `injector.get(name: any)`: Get a value.

Note: You can use any value as a `name`, including functions and classes.
