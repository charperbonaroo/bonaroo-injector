import {Injector} from "../../src/core/Injector";

describe("Injector", () => {
  test("get() returns constant()", () => {
    const injector = new Injector();
    injector.constant("foo", "Bar");
    expect(injector.get("foo")).toEqual("Bar");
  });

  test("get() returns function assigned by factory()", () => {
    const injector = new Injector();
    injector.constant("bar", "1");
    injector.factory("foo", (a) => a, ["bar"]);
    expect(injector.get("foo")).toEqual("1");
  });

  test("get() returns factory() function only once", () => {
    let c = 0;
    const injector = new Injector();
    injector.factory("foo", () => c++);
    injector.get("foo");
    injector.get("foo");
    expect(c).toEqual(1);
  });

  test("get() returns alias()", () => {
    const injector = new Injector();
    injector.constant("foo", "a");
    injector.alias("bar", "foo");
    expect(injector.get("bar")).toEqual("a");
  });

  test("get() returns service() (with args)", () => {
    const injector = new Injector();
    injector.factory("xmas", () => Date.parse("2017-12-25 12:00:00 +00:00"));
    injector.service("date", Date, ["xmas"]);
    expect(injector.get("date")).toBeInstanceOf(Date);
    expect((injector.get("date") as Date).toISOString()).toEqual("2017-12-25T12:00:00.000Z");
  });

  test("get() returns service() (no args)", () => {
    const injector = new Injector();
    injector.service("date", Date);
    expect(injector.get("date")).toBeInstanceOf(Date);
  });

  test("get() for undefined key returns error", () => {
    const injector = new Injector();
    expect(() => injector.get("bar")).toThrowError();
  });
});
