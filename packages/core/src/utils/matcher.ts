import {
  object,
  string,
  type Output,
  ObjectSchema,
  ObjectEntries,
  BaseSchema,
  StringSchema,
} from "valibot";
import type { RadixRouter } from "radix3";

// Type to parse a single segment of the path and extract the parameter name if it starts with ':'
type ExtractParam<Segment extends string> = Segment extends `:${infer Param}`
  ? Param
  : never;

// Recursive type to process each segment of the path and build an object type
type PartObject<
  Path extends string,
  Value extends any,
  Accumulator extends Record<string, Value> = {}
> = Path extends `/${infer Segment}/${infer Rest}` // Check if there's a segment followed by more segments
  ? PartObject<
      `/${Rest}`,
      Value,
      Accumulator & Record<ExtractParam<Segment>, Value>
    >
  : Path extends `/${infer Segment}` // Check if it's the last or only segment
  ? Accumulator & Record<ExtractParam<Segment>, Value>
  : Accumulator; // End of recursion, return the accumulated object type

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type MatcherOutput = {
  fullLink: string;
  shortLink?: string;
  universalLink?: string;
  customSchemeLink?: string;
};

class Matcher<
  Path extends string,
  Query extends ObjectSchema<{}>,
  Params extends ObjectSchema<{}> = ObjectSchema<PartObject<Path, StringSchema>>
> {
  matchedScheme = ["http", "https"];
  matchedHost: string[] = [];
  matchedPath = "";

  queryValidator = object({});
  paramsValidator = object({});
  outputCallback: (
    input: Output<ObjectSchema<{ query: Query; params: Params }>>
  ) => MatcherOutput = () => {
    return {
      fullLink: "",
    };
  };

  scheme(...scheme: string[]) {
    this.matchedScheme = scheme;
    return this;
  }

  host(...host: string[]) {
    this.matchedHost.push(...host);
    return this;
  }

  path<NewPath extends string>(path: NewPath) {
    this.matchedPath = path;
    const newParams = this.getDefaultParamsValidator() as ObjectSchema<
      PartObject<NewPath, StringSchema<string>>
    >;

    return this.input({
      query: this.queryValidator,
      // @ts-ignore
      params: newParams,
    }) as unknown as Matcher<NewPath, Query>;
  }

  input<
    NewQuery extends ObjectSchema<{}>,
    NewParams extends ObjectSchema<PartObject<Path, BaseSchema<any, any>>>
  >({ query, params }: { query?: NewQuery; params?: NewParams }) {
    this.queryValidator = query || object({});
    this.paramsValidator = params || object({});
    return this as unknown as Matcher<Path, NewQuery, NewParams>;
  }

  output(
    callback: (
      input: Output<ObjectSchema<{ query: Query; params: Params }>>
    ) => MatcherOutput
  ): this {
    this.outputCallback = callback;
    return this;
  }

  register(router: RadixRouter) {
    const path = this.matchedPath;
    for (const scheme of this.matchedScheme) {
      for (const host of this.matchedHost) {
        const prefix = `${scheme}/${host}${path}`;
        console.log(prefix);
        router.insert(`${scheme}/${host}${path}`, { matcher: this });
      }
    }
  }

  constructor(...host: string[]) {
    this.host(...host);
  }

  private getDefaultParamsValidator() {
    const segments = this.matchedPath.split("/");
    const params = segments
      .filter((segment) => segment.startsWith(":"))
      .map((segment) => [segment.slice(1), string()]);
    return object(Object.fromEntries(params));
  }
}

export const m = (...host: string[]) => new Matcher(...host);
export type MatcherInstance = ReturnType<typeof m>;
