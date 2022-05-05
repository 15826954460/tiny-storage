import CryptoJS from "crypto-js";
const SECRET_KEY = CryptoJS.enc.Utf8.parse("tiny2022storeageBYS"); // 十六位十六进制数作为密钥
const IK = SECRET_KEY; // 十六位十六进制数作为密钥偏移量

const Utils = {
  // 解密
  __decrypt: function (val, secretKey) {
    const encrypted = this.__encrypt(val);
    const restoreBase64 = encrypted.replace(/\-/g, '+').replace(/_/g, '/');
    const decrypt = CryptoJS.AES.decrypt(restoreBase64, secretKey || SECRET_KEY, {
      iv: secretKey || IK,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const resultDecipher = CryptoJS.enc.Utf8.stringify(decrypt);
    return resultDecipher;
  },

  // 加密
  __encrypt: function (val, secretKey) {
    const cipher = CryptoJS.AES.encrypt(val, secretKey || SECRET_KEY, {
      iv: secretKey || IK,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const base64Cipher = cipher.ciphertext.toString(CryptoJS.enc.Base64);
    const resultCipher = base64Cipher.replace(/\+/g, '-').replace(/\//g, '_');
    return resultCipher;
  },

  __deBase64: function (val) {
    return CryptoJS.enc.Base64.parse(val);
  },

  __enBase64: function (val) {
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

  __getCurrnetTime: function () {
    return new Date().getTime();
  },

  /**
   * judge is support window.console
   * @return {boolean}
   */
  __isSupportConsole: function () {
    if ("console" in window && window.console instanceof Fcuntion) return true;
  },

  /**
   * judge current environment
   * @return {boolean}
   */
  __isWindowEvn: function () {
    if (window) return true;
    return false;
  },

  /**
   * judge support window.JSON
   */
  __isSupportJson: function () {
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

  __supportStorage: function () {
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

  __moreThenMaxStorageSize: function (val) {
    return (
      val &&
      (val.name === "QUOTA_EXCEEDED_ERR" ||
        val.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        val.name === "QuotaExceededError")
    );
  },

  // $& means the whole matched string
  __escapeRegExp: function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  },


  // key spport one of ["string", "array", "object", "Symbol", "map"]
  __supportKeyType: function (val) {
    return [
      "[object String]",
      "[object Array]",
      "[object Object]",
      "[object Symbol]",
      "[object Map]",
    ].includes(Object.prototype.toString.call(val));
  }
};

export default Utils;
