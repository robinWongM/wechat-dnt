import { ObjectSchema, object, Output } from "valibot";
import type { Optional } from "utility-types";
import { char, createRegExp, oneOrMore } from "magic-regexp/further-magic";
import type { CheerioAPI } from "cheerio";

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

type SanitizerOutput = {
  fullLink: string;
  shortLink?: string;
  universalLink?: string;
  customSchemeLink?: string;
  iframeLink?: string;
  embedLink?: string;
};
export type Sanitizer<
  Param extends OptionalObjectSchema,
  Query extends OptionalObjectSchema
> = (input: {
  param: InferOutput<Param>;
  query: InferOutput<Query>;
}) => SanitizerOutput;

type ExtractMetadata = {
  label: string;
  icon: string;
  value: string;
};
type ExtractorOutput = {
  title: string;
  description?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  metadata?: ExtractMetadata[];
  images: string[];
};
export type Extractor = (
  input: SanitizerOutput,
  context: {
    fetch: typeof fetch;
    loadHtml: (html: string) => CheerioAPI;
  }
) => ExtractorOutput | PromiseLike<ExtractorOutput>;

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
};

const defaultExtractor: Extractor = async (
  { fullLink },
  { fetch, loadHtml }
) => {
  const resp = await fetch(fullLink);
  const html = await resp.text();
  const $ = loadHtml(html);

  const title =
    $("meta[property='og:title']").attr("content") ||
    $("meta[name='og:title']").attr("content") ||
    $("title").text();
  const description =
    $("meta[property='og:description']").attr("content") ||
    $("meta[name='og:description']").attr("content") ||
    $("meta[name='description']").attr("content") ||
    "";
  const ogImage =
    $("meta[property='og:image']").attr("content") ||
    $("meta[name='og:image']").attr("content");

  return { title, description, images: ogImage ? [ogImage] : [] };
};

export const defineHandler = <
  Param extends OptionalObjectSchema = undefined,
  Query extends OptionalObjectSchema = undefined
>(input: {
  pattern: Optional<Pattern<Param, Query>, "protocol" | "param" | "query">;
  sanitizer: Sanitizer<Param, Query>;
  extractor?: Extractor;
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
    extractor: input.extractor ?? defaultExtractor,
  };
};

export type Handler = ReturnType<typeof defineHandler>;
export const defineRouter = (
  config: { id: string; name: string; icon?: string },
  ...handlers: Handler[]
) => {
  return { config, handlers };
};
