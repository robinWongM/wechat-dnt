import {
  ObjectSchema,
  object,
  Output,
} from "valibot";
import type { Optional } from "utility-types";
import { char, createRegExp, oneOrMore } from "magic-regexp/further-magic";

type OptionalObjectSchema = ObjectSchema<{}> | undefined;
type InferOutput<T> = T extends ObjectSchema<{}> ? Output<T> : never;

export type Pattern<
  Param extends OptionalObjectSchema,
  Query extends OptionalObjectSchema
> = {
  protocol: string[];
  host: string[];
  path: string;
  query: Query;
  param: Param;
};

export type Sanitizer<
  Param extends OptionalObjectSchema,
  Query extends OptionalObjectSchema
> = (input: { param: InferOutput<Param>; query: InferOutput<Query> }) => {
  fullLink: string;
  shortLink?: string;
  universalLink?: string;
  customSchemeLink?: string;
};

export type Extractor = () => void;

const createRegExpFromPath = (path: string) => {
  const segments = path.split("/");
  const regExpPart = segments
    .slice(1)
    .map((segment) => {
      if (segment === "**") {
        return [oneOrMore(char)];
      }

      if (!segment.startsWith(":")) {
        return ["/", segment];
      }

      const paramName = segment.slice(1);
      return ["/", oneOrMore(char).groupedAs(paramName)];
    })
    .flat();

  return createRegExp(...regExpPart);
}

export const defineHandler = <
  Param extends OptionalObjectSchema = undefined,
  Query extends OptionalObjectSchema = undefined
>(input: {
  pattern: Optional<Pattern<Param, Query>, "protocol" | "param" | "query">;
  sanitizer: Sanitizer<Param, Query>;
}) => {
  const { path } = input.pattern;
  const fullPattern = {
    protocol: ["http:", "https:"],
    query: object({}),
    param: object({}),
    pathRegExp: createRegExpFromPath(path),
    ...input.pattern,
  };

  return {
    pattern: fullPattern,
    sanitizer: input.sanitizer,
  };
};

export type Handler = ReturnType<typeof defineHandler>;
export const defineRouter = (
  config: { name: string },
  ...handlers: Handler[]
) => {
  return { config, handlers };
};
