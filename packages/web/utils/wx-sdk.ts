type WeixinJSBridge = {
  invoke: (
    method: string,
    params: any,
    callback: (data: { err_msg: string }) => void
  ) => void;
};

declare global {
  interface Window {
    WeixinJSBridge?: WeixinJSBridge;
  }
}

const cache = {
  appId: "",
  verifyAppId: "",
  verifyNonceStr: "",
  verifyTimestamp: "",
  verifySignature: "",
  verifySignType: "sha1",
};

const useWeixinJSBridge = async () => {
  if (import.meta.server) {
    throw new Error("WeixinJSBridge is not available on server side");
  }

  if (window.WeixinJSBridge) {
    return window.WeixinJSBridge;
  }

  return new Promise<WeixinJSBridge>((resolve) => {
    document.addEventListener(
      "WeixinJSBridgeReady",
      () => {
        resolve(window.WeixinJSBridge!);
      },
      false
    );
  });
};

const invoke = async (method: string, params: any) => {
  if (import.meta.server) {
    return;
  }

  const bridge = await useWeixinJSBridge();
  const wrappedParams = {
    ...params,
    appId: cache.appId,
    verifyAppId: cache.appId,
    verifyNonceStr: cache.verifyNonceStr,
    verifyTimestamp: cache.verifyTimestamp,
    verifySignature: cache.verifySignature,
    verifySignType: cache.verifySignType,
  };

  return new Promise((resolve, reject) => {
    bridge.invoke(method, wrappedParams, (data) => {
      if (data.err_msg.endsWith(":ok")) {
        resolve(data);
      } else {
        reject(data);
      }
    });
  });
};

function config(options: {
  debug?: boolean;
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
  jsApiList?: string[];
  openTagList?: string[];
}) {
  cache.appId = options.appId;
  cache.verifyAppId = options.appId;
  cache.verifyNonceStr = options.nonceStr;
  cache.verifyTimestamp = `${options.timestamp}`;
  cache.verifySignature = options.signature;

  return invoke("preVerifyJSAPI", {
    verifyJsApiList: options.jsApiList ?? [],
    verifyOpenTagList: options.openTagList ?? [],
  });
}

function updateAppMessageShareData(options: {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}) {
  return invoke("updateAppMessageShareData", {
    title: options.title,
    desc: options.desc,
    link: options.link,
    imgUrl: options.imgUrl,
  });
}

export const useWxSdk = () => {
  return {
    config,
    updateAppMessageShareData,
  };
};
