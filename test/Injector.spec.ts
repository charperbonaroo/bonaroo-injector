import { Injector } from "../src";

Injector.inspect = require("util").inspect;

describe("Injector", () => {
  let injector: Injector;

  beforeEach(() => { injector = new Injector(); })

  test("get() returns constant()", () => {
    injector.constant("foo", "Bar");
    expect(injector.get("foo")).toEqual("Bar");
  });

  test("get() returns function assigned by factory()", () => {
    injector.constant("bar", "1");
    injector.factory("foo", (a) => a, ["bar"]);
    expect(injector.get("foo")).toEqual("1");
  });

  test("get() returns factory() function only once", () => {
    let c = 0;
    injector.factory("foo", () => c++);
    injector.get("foo");
    injector.get("foo");
    expect(c).toEqual(1);
  });

  test("get() returns alias()", () => {
    injector.constant("foo", "a");
    injector.alias("bar", "foo");
    expect(injector.get("bar")).toEqual("a");
  });

  test("get() returns service() (with args)", () => {
    injector.factory("xmas", () => Date.parse("2017-12-25 12:00:00 +00:00"));
    injector.service("date", Date, ["xmas"]);
    expect(injector.get("date")).toBeInstanceOf(Date);
    expect((injector.get("date") as Date).toISOString()).toEqual("2017-12-25T12:00:00.000Z");
  });

  test("get() returns service() (no args)", () => {
    injector.service("date", Date);
    expect(injector.get("date")).toBeInstanceOf(Date);
  });

  test("get() for undefined key returns error", () => {
    expect(() => injector.get("bar")).toThrowError("Injector has no value for 'bar'");
  });

  test("get() for undefined dependency returns descriptive error", () => {
    injector.service(SomeServer, ["port"]);
    injector.factory("foo", (x) => x, [SomeServer]);
    expect(() => injector.get("foo")).toThrowError("Failed to resolve value for 'foo':\n"
      + "Failed to resolve value for [class SomeServer]:\n"
      + "Injector has no value for 'port'");
  });

  test("get() returns instance of class assigned by service() given a constructor", () => {
    injector.factory("port", () => parseInt("9000", 10));
    injector.service(SomeServer, ["port"]);
    const value = injector.get(SomeServer);
    expect(value).toBeInstanceOf(SomeServer);
  });

  test("get() returns instance of class assigned by service() given a constructor", () => {
    injector.service(SomeServer);
    const value = injector.get(SomeServer);
    expect(value).toBeInstanceOf(SomeServer);
  });

  test("get() returns instance of subclass assigned by service() given a constructor", () => {
    injector.service(SomeServer, DefaultPortServer);
    const value = injector.get(SomeServer);
    expect(value).toBeInstanceOf(DefaultPortServer);
  });

  test("get() fails for faulty params (string-ID only)", () => {
    expect(() => { injector.service("foo" as any); })
      .toThrowError("Expected arg0 to be a constructor function, got 'foo'")
  });

  test("get() fails for faulty params (string-ID only)", () => {
    expect(() => { injector.service(DefaultPortServer, "foo" as any); })
      .toThrowError("Expected (id, fun) or (fun, arr), got")
  });

  test("get() fails for faulty params (string-ID only)", () => {
    expect(() => { injector.service(SomeServer, SomeServer, "foo" as any); })
      .toThrowError("Expected arg2 to be an array, got")
  });

  test("get() fails for faulty params (string-ID only)", () => {
    expect(() => { injector.service("foo", "foo" as any, []); })
      .toThrowError("Expected arg1 to be a constructor function, got 'foo'")
  });
});

class SomeServer {
  constructor(public port: number) {}
}

class DefaultPortServer extends SomeServer {
  constructor() { super(8080); }
}
