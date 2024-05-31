import {
  object,
  string,
  type Output,
  type ObjectSchema,
  type BaseSchema,
  type StringSchema,
  safeParse,
} from "valibot";
import { createRegExp, oneOrMore, char } from "magic-regexp";
import URLParse from "url-parse";

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

type SanitizerOutput = {
  fullLink: string;
  shortLink?: string;
  universalLink?: string;
  customSchemeLink?: string;
};

class Sanitizer<
  Path extends string,
  Query extends ObjectSchema<{}>,
  Params extends ObjectSchema<{}> = ObjectSchema<PartObject<Path, StringSchema>>
> {
  matchedScheme = ["http", "https"];
  matchedHost: string[] = [];
  matchedPath = "";
  matchedRegExp = /./;

  queryValidator = object({});
  paramsValidator = object({});
  outputCallback: (
    input: Output<ObjectSchema<{ query: Query; params: Params }>>
  ) => SanitizerOutput = () => {
    return {
      fullLink: "",
    };
  };
  openGraphHandler: () => void = () => {};

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
    const { regExp, validator } = this.getDefaultParamsValidator();
    this.matchedRegExp = regExp;

    return this.input({
      query: this.queryValidator,
      // @ts-ignore
      params: validator as ObjectSchema<
        PartObject<NewPath, StringSchema<string>>
      >,
    }) as unknown as Sanitizer<NewPath, Query>;
  }

  input<
    NewQuery extends ObjectSchema<{}>,
    NewParams extends ObjectSchema<PartObject<Path, BaseSchema<any, any>>>
  >({ query, params }: { query?: NewQuery; params?: NewParams }) {
    this.queryValidator = query || object({});
    this.paramsValidator = params || object({});
    return this as unknown as Sanitizer<Path, NewQuery, NewParams>;
  }

  output(
    callback: (
      input: Output<ObjectSchema<{ query: Query; params: Params }>>
    ) => SanitizerOutput
  ): this {
    this.outputCallback = callback;
    return this;
  }

  sanitize(parsedUrl: URLParse<any>) {
    const { protocol, hostname, pathname, query } = parsedUrl;
    const scheme = protocol.slice(0, -1);
    if (!this.matchedScheme.includes(scheme)) {
      return;
    }

    if (!this.matchedHost.includes(hostname)) {
      return;
    }

    const match = pathname.match(this.matchedRegExp);
    if (!match) {
      return;
    }

    const { success: paramSuccess, output: paramOutput } = safeParse(this.paramsValidator, match.groups || {});
    if (!paramSuccess) {
      return;
    }

    const { success: querySuccess, output: queryOutput } = safeParse(this.queryValidator, query || {});
    if (!querySuccess) {
      return;
    }

    // @ts-ignore
    return this.outputCallback({ query: queryOutput, params: paramOutput });
  }

  constructor(...host: string[]) {
    this.host(...host);
  }

  private getDefaultParamsValidator() {
    const segments = this.matchedPath.split("/");

    const regExpPart: any[] = [];
    const params: any = {};
    for (const segment of segments.slice(1)) {
      if (segment === '**') {
        regExpPart.push(oneOrMore(char));
        continue;
      }

      if (!segment.startsWith(":")) {
        regExpPart.push('/', segment);
        continue;
      }

      const paramName = segment.slice(1);
      regExpPart.push('/', oneOrMore(char).groupedAs(paramName));
      params[paramName] = string();
    }

    const regExp = createRegExp(...regExpPart);
    return {
      regExp,
      validator: object(params),
    };
  }
}

export const m = (...host: string[]) => new Sanitizer(...host);
export type SanitizerInstance = ReturnType<typeof m>;
