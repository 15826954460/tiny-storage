import CryptoJS from "crypto-js";
const SECRET_KEY = CryptoJS.enc.Utf8.parse("tiny2022storeageBYS"); // 十六位十六进制数作为密钥
const IK = CryptoJS.enc.Utf8.parse("tiny2022storeageBYS"); // 十六位十六进制数作为密钥偏移量

const Utils = {
  // 解密
  __decrypt: (word) => {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, SECRET_KEY, {
      iv: IK,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
  },

  // 加密
  ___encrypt: (word) => {
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, SECRET_KEY, {
      iv: IK,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.ciphertext.toString().toUpperCase();
  },

  __deBase64: (val) => {
    return CryptoJS.enc.Base64.parse(val);
  },

  __enBase64: (val) => {
    return CryptoJS.enc.Base64.stringify(val);
  },

  /**
   * print log
   */
  __warn: function (msg) {
    if (this.__isWindowEvn() && this.__isSupportConsole()) {
      window.console.warn(`${msg}`);
    }
  },

  __getCurrnetTime: () => {
    return Math.floor(new Date().getTime() / (60 * 1000));
  },

  /**
   * judge is support window.console
   * @return {boolean}
   */
  __isSupportConsole: () => {
    if ("console" in window && window.console instanceof Fcuntion) return true;
  },

  /**
   * judge current environment
   * @return {boolean}
   */
  __isWindowEvn: () => {
    if (window) return true;
    return false;
  },

  /**
   * judge support window.JSON
   */
  __isSupportJson: () => {
    if (!this.__isWindowEvn()) return false;
    if (!window.JSON) return false;
    let supportFlug;
    try {
      JSON.stringify(new Array());
      supportFlug = true;
    } catch {
      supportFlug = false;
    }
    return supportFlug;
  },

  __supportStorage: () => {
    if (!this.__isWindowEvn()) return false;
    if (!("localStorage" in window)) return false;
    let supportStorage;
    const TEST_KEY = "text_key";
    try {
      localStorage.setItem(TEST_KEY, "testValue");
      supportStorage = true;
    } catch (error) {
      if (this.__moreThenMaxStorageSize(error) && localStorage.length) {
        supportStorage = true;
      } else {
        supportStorage = false;
      }
    }
    supportStorage && localStorage.removeItem(TEST_KEY);
    return supportStorage;
  },

  __moreThenMaxStorageSize: (val) => {
    return (
      val &&
      (val.name === "QUOTA_EXCEEDED_ERR" ||
        val.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        val.name === "QuotaExceededError")
    );
  },
};

const {
  __decrypt,
  __deBase64,
  ___encrypt,
  __enBase64,
  __getCurrnetTime,
  __supportStorage,
  __isSupportJson,
  __warn,
  __isWindowEvn,
} = Utils;

export {};
export default Utils;
