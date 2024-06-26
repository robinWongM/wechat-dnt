import { match } from "./router";

export const sanitize = (url: string) => {
  const matched = match(url);
  if (!matched) {
    return null;
  }

  return matched.sanitize();
}
