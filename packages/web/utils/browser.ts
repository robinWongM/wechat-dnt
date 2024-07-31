import { UAParser } from "ua-parser-js";

const isMajorAbove = (version: string | undefined, target: number) => {
  if (!version) {
    return false;
  }

  const [major] = version.split(".");
  return Number(major) >= target;
};

export const checkIsBrowserSupportsPreview = () => {
  if (import.meta.server) {
    return false;
  }

  const { userAgent } = useDevice();
  const { browser, os, engine } = UAParser(userAgent);

  if (browser.name === "Safari" || browser.name === "Mobile Safari") {
    return isMajorAbove(os.version, 14);
  }
  if (browser.name === "WeChat" && os.name === "iOS") {
    return isMajorAbove(os.version, 14);
  }
  if (engine.name === "Blink") {
    return isMajorAbove(engine.version, 120);
  }
  if (engine.name === "Gecko") {
    return isMajorAbove(engine.version, 115);
  }

  return false;
};
