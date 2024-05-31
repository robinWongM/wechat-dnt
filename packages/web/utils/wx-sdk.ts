declare global {
  interface Window {
    WeixinJSBridge: any;
  }
}

let cache = {
  appId: "",
  verifyAppId: "",
  verifyNonceStr: "",
  verifyTimestamp: 0,
  verifySignature: "",
};

function runWhenReady(callback: () => void) {
  if (import.meta.server) {
    return;
  }

  if (window.WeixinJSBridge) callback();
  document.addEventListener("WeixinJSBridgeReady", callback, false);
}

function prepareParams(params: any) {
  params.appId = cache.appId;
  params.verifyAppId = cache.verifyAppId;
  params.verifyNonceStr = cache.verifyNonceStr;
  params.verifyTimestamp = cache.verifyTimestamp;
  params.verifySignature = cache.verifySignature;

  return {
    appId: cache.appId,
    verifyAppId: cache.appId,
    verifyNonceStr: cache.verifyNonceStr,
    verifyTimestamp: cache.verifyTimestamp,
    verifySignature: cache.verifySignature,
    ...params,
  };
}
const invoke = (method: string, params: any, callback: (data: any) => void) => {
  window.WeixinJSBridge.invoke(method, prepareParams(params), callback);
};
const on = (event: string, handler: () => void) => {
  window.WeixinJSBridge.on(event, handler);
};

function callApi(apiName: string, params: any, options: any) {
  runWhenReady(() => {
    invoke(apiName, prepareParams(params), (data) => {
      console.log("invoke", apiName, data);
    });
  });
}

function config(options: {
  debug: boolean;
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
  openTagList: string[];
}) {
  cache.appId = options.appId;
  cache.verifyAppId = options.appId;
  cache.verifyNonceStr = options.nonceStr;
  cache.verifyTimestamp = options.timestamp;
  cache.verifySignature = options.signature;

  runWhenReady(() => {
    callApi(
      "preVerifyJSAPI",
      {
        verifyJsApiList: options.jsApiList,
        verifyOpenTagList: options.openTagList,
      },
      {}
    );
  });
}

function updateAppMessageShareData(options: {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}) {
  runWhenReady(() => {
    callApi(
      "updateAppMessageShareData",
      {
        title: options.title,
        desc: options.desc,
        link: options.link,
        imgUrl: options.imgUrl,
      },
      {}
    );
  });
}

export const useWxSdk = () => {
  return {
    config,
    updateAppMessageShareData,
  };
}
