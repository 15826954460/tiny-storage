// import CryptoJS from "crypto-js";
// const SECRET_KEY = CryptoJS.enc.Utf8.parse("tiny2022storeageBYS"); // 十六位十六进制数作为密钥
// const IK = SECRET_KEY; // 十六位十六进制数作为密钥偏移量

const Utils = {
  // 解密
  decrypt: function (val, secretKey) {
    // const encrypted = this.encrypt(val);
    // const restoreBase64 = encrypted.replace(/\-/g, "+").replace(/_/g, "/");
    // const decrypt = CryptoJS.AES.decrypt(
    //   restoreBase64,
    //   secretKey || SECRET_KEY,
    //   {
    //     iv: secretKey || IK,
    //     mode: CryptoJS.mode.CBC,
    //     padding: CryptoJS.pad.Pkcs7,
    //   }
    // );
    // const resultDecipher = CryptoJS.enc.Utf8.stringify(decrypt);
    // return resultDecipher;
  },

  // 加密
  encrypt: function (val, secretKey) {
    // const cipher = CryptoJS.AES.encrypt(val, secretKey || SECRET_KEY, {
    //   iv: secretKey || IK,
    //   mode: CryptoJS.mode.CBC,
    //   padding: CryptoJS.pad.Pkcs7,
    // });
    // const base64Cipher = cipher.ciphertext.toString(CryptoJS.enc.Base64);
    // const resultCipher = base64Cipher.replace(/\+/g, "-").replace(/\//g, "_");
    // return resultCipher;
  },

  deBase64: function (val) {
    return CryptoJS.enc.Base64.parse(val);
  },

  enBase64: function (val) {
    return CryptoJS.enc.Base64.stringify(val);
  },

  /**
   * print log
   */
  warn: function (msg) {
    if (this.isWindowEvn() && this.isSupportConsole()) {
      msg && window.console.warn(`${msg}`);
    }
  },

  log: function(msg) {
    if (this.isWindowEvn() && this.isSupportConsole()) {
      msg && window.console.log(`${msg}`);
    }
  },

  getCurrnetTime: function () {
    return new Date().getTime();
  },

  /**
   * judge is support window.console
   * @return {boolean}
   */
  isSupportConsole: function () {
    if ("console" in window && (window.console.log && window.console.warn) instanceof Function) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * judge current environment
   * @return {boolean}
   */
  isWindowEvn: function () {
    if (window) return true;
    return false;
  },

  /**
   * judge support window.JSON
   */
  isSupportJson: function () {
    if (!this.isWindowEvn()) return false;
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

  supportStorage: function () {
    if (!this.isWindowEvn()) return false;
    if (!("localStorage" in window)) return false;
    let supportStorage;
    const TEST_KEY = "text_key";
    try {
      localStorage.setItem(TEST_KEY, "testValue");
      supportStorage = true;
    } catch (error) {
      if (this.moreThenMaxStorageSize(error) && localStorage.length) {
        supportStorage = true;
      } else {
        supportStorage = false;
      }
    }
    supportStorage && localStorage.removeItem(TEST_KEY);
    return supportStorage;
  },

  moreThenMaxStorageSize: function (val) {
    return (
      val &&
      (val.name === "QUOTA_EXCEEDED_ERR" ||
        val.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        val.name === "QuotaExceededError")
    );
  },

  // $& means the whole matched string
  escapeRegExp: function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  },

  // key spport one of ["string", "array", "object", "Symbol", "map"]
  supportKeyType: function (val) {
    return [
      "[object String]",
      "[object Array]",
      "[object Object]",
      "[object Symbol]",
      "[object Map]",
    ].includes(Object.prototype.toString.call(val));
  },
};

export default Utils;
