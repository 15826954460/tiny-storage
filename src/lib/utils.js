import CryptoJS from "crypto-js";
const SECRET_KEY = CryptoJS.enc.Utf8.parse("tiny2022storeageBYS"); // 十六位十六进制数作为密钥
const IK = SECRET_KEY; // 十六位十六进制数作为密钥偏移量

const Utils = {
  // 解密
  __decrypt: (val, secretKey) => {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(val);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, secretKey || SECRET_KEY, {
      iv: secretKey || IK,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
  },

  // 加密
  __encrypt: (val, secretKey) => {
    let srcs = CryptoJS.enc.Utf8.parse(val);
    let encrypted = CryptoJS.AES.encrypt(srcs, secretKey || SECRET_KEY, {
      iv: secretKey || IK,
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
    return new Date().getTime();
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

  // $& means the whole matched string
  __escapeRegExp: (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),

  // key spport one of ["string", "array", "object", "Symbol", "map"]
  __supportKeyType: (val) =>
    [
      "[object String]",
      "[object Array]",
      "[object Object]",
      "[object Symbol]",
      "[object Map]",
    ].includes(Object.prototype.toString.call(val)),
};

const {
  __decrypt: decrypt,
  __deBase64: deBase64,
  __encrypt: encrypt,
  __enBase64: enBase64,
  __warn: warn,
  __isWindowEvn: isWindowEvn,
  __supportStorage: supportStorage,
  __isSupportJson: isSupportJson,
  __moreThenMaxStorageSize: moreThenMaxStorageSize,
  __escapeRegExp: escapeRegExp,
  __supportKeyType: supportKeyType,
} = Utils;

export {
  decrypt,
  deBase64,
  encrypt,
  enBase64,
  warn,
  isWindowEvn,
  supportStorage,
  isSupportJson,
  moreThenMaxStorageSize,
  escapeRegExp,
  supportKeyType,
};
export default Utils;
