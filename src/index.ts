type Value = unknown;
type Key = unknown;
type ValueFactory = (injector: Injector) => Value;
type ServiceConstructor = new (...args: any[]) => void;
type FactoryFunction = (...args: Value[]) => Value;

export class Injector {
  public static readonly instance = new Injector();
  public static inspect: (value: any) => string = (value) => `${JSON.stringify(value)}`;

  constructor(
    private values = new Map<Key, ValueFactory>(),
    private cached = new Map<Key, Value>(),
  ) {
  }

  public constant(id: Key, value: Value) {
    this.values.set(id, () => value);
  }

  public factory(id: Key, fn: FactoryFunction, args: Key[] = []) {
    this.values.set(id, (injector: Injector) => fn(...args.map((arg) => injector.get(arg))));
  }

  public service(constructor: ServiceConstructor): Value;
  public service(constructor: ServiceConstructor, args: Key[]): Value;
  public service(id: Key, constructor: ServiceConstructor): Value;
  public service(id: Key, constructor: ServiceConstructor, args: Key[]): Value;

  public service(arg0: ServiceConstructor|Key, arg1?: Key[]|ServiceConstructor, arg2?: Key[]) {
    let id: Key;
    let constructor: ServiceConstructor;
    let args: Key[];

    if (arg1 && arg2) {
      if (!(arg2 instanceof Array)) {
        throw new Error(`Expected arg2 to be an array, got ${Injector.inspect(arg2)}`);
      }
      if (typeof arg1 !== "function") {
        throw new Error(`Expected arg1 to be a constructor function, got ${Injector.inspect(arg1)}`);
      }
      id = arg0;
      constructor = arg1;
      args = arg2;
    } else if (arg1) {
      if (typeof arg1 === "function") {
        id = arg0;
        constructor = arg1;
        args = [];
      } else if (typeof arg0 === "function" && arg1 instanceof Array) {
        id = arg0;
        constructor = arg0 as ServiceConstructor;
        args = arg1;
      } else {
        throw new Error(`Expected (id, fun) or (fun, arr), got (${Injector.inspect(arg0)}, ${Injector.inspect(arg1)})`);
      }
    } else {
      if (typeof arg0 !== "function") {
        throw new Error(`Expected arg0 to be a constructor function, got ${Injector.inspect(arg0)}`);
      }
      id = arg0;
      constructor = arg0 as any as ServiceConstructor;
      args = [];
    }

    this.values.set(id, (injector: Injector) => new constructor(...args.map((arg) => injector.get(arg))));
  }

  public alias(id: Key, target: Key) {
    this.values.set(id, (injector: Injector) => injector.get(target))
  }

  public get(id: Key): Value {
    if (this.cached.has(id)) {
      return this.cached.get(id);
    }
    if (!this.values.has(id)) {
      throw new Error(`Injector has no value for ${Injector.inspect(id)}`);
    }
    try {
      const value = this.values.get(id)!(this);
      this.cached.set(id, value);
      return value;
    } catch (error) {
      throw new Error(`Failed to resolve value for ${Injector.inspect(id)}:\n${error.message}`)
    }
  }
}
