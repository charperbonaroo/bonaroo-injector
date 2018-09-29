export class Injector {
  public static readonly instance = new Injector();

  constructor(
    private values: { [key: string]: (injector: Injector) => any } = {},
    private cached: { [key: string]: any } = {},
  ) {
  }

  public constant(id: string, value: any) {
    this.values[id] = (injector: Injector) => value;
  }

  public factory(id: string, fn: (...args: any[]) => any, args: string[] = []) {
    this.values[id] = (injector: Injector) => fn(...args.map((arg) => injector.get(arg)));
  }

  public service(id: string, constructor: new (...args: any[]) => void, args: string[] = []) {
    this.values[id] = (injector: Injector) => new constructor(...args.map((arg) => injector.get(arg)));
  }

  public alias(id: string, target: string) {
    this.values[id] = (injector: Injector) => injector.get(target);
  }

  public get(id: string): any {
    if (id in this.cached) {
      return this.cached[id];
    }
    if (!(id in this.values)) {
      throw new Error(`Failed to get ${id} in injector`);
    }
    return this.cached[id] = this.values[id](this);
  }
}
