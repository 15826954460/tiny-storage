/**
 * @author bys
 * @date 2021-12-27 16:26:21
 * @description localStorage增强
 */
import {
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
} from "./utils.js";
import utils from "./utils.js";

/**
 * constructor version
 * @params {
 *    pordName: strung 项目名称
 *    env: string 当前环境
 *    version: 当前版本
 *    encrypt: 是否加密
 * }
 */
function TinyStorage({
  pordName = "",
  env = "prod",
  version = "",
  encrypt = false,
  allowConso = false,
} = {}) {
  this.pordName = pordName;
  this.env = env;
  this.version = version;
  this.encrypt = encrypt;
  this.encrypeKey = ""; // Encryption key
  this.allowConso = allowConso;
  this.prefix = "__tiny__";
}

TinyStorage.prototype = {
  constructor: TinyStorage,
  createKey: (key) => {
    return `${this.prefix}${this.pordName ? "_" + this.pordName : ""}${
      this.env ? "_" + this.env : ""
    }${this.version ? "_" + this.version : ""}${key ? "_" + key : ""}`;
  },
  /**
   * get all keys
   */
  getKeys: function () {
    if (!supportStorage() || !isWindowEvn()) return [];
    const len = window.localStorage.length;
    let keysList = [];
    for (let i = len; i > 0; i--) {
      const key = localStorage.key(i);
      new RegExp(/^__tiny__/).test(key) && keysList.push(key);
    }
    return keysList;
  },
  getItem: function (key) {
    if (!isWindowEvn() || !supportStorage()) return;
    const str = window.localStorage.getItem(this.createKey(key));
    let val, expires;
    try {
      val = val && JSON.parse(str);
      val.expiresTime < +new Date() && this.clearExpired(this.createKey(key));
    } catch (error) {
      warn(`current ${val} is not conformable`);
    }
    return;
  },
  /**
   * @param {
   *  key,
   *  value,
   *  time, // default cache one hour
   * }
   */
  setItem: function (key, value, time = 1 * 60 * 60 * 1000, encrypeKey) {
    if (!isWindowEvn() || !supportStorage() || isSupportJson()) return;
    if (!supportKeyType(key) || !supportKeyType(value)) {
      this.allowConso &&
        warn('key and value must be one of "string", "array", "object", "Symbol", "Map"');
      return;
    }
    const nkey = this.createKey(key);
    const regVal = escapeRegExp(value);
    const isEncrypeKey = encrypeKey || this.encrypeKey;
    let nval =
      this.encrypt && isEncrypeKey ? encrypt(regVal, isEncrypeKey) : regVal; // encrypt sensitive data
    let expiresTime = +new Date() + time;
    try {
      this.removeItem(nkey); // before setItem clear current item
      window.localStorage.setItem(
        nkey,
        JSON.stringify({
          nkey: nval,
          expiresTime,
        })
      );
    } catch (error) {
      if (moreThenMaxStorageSize(error)) {
        this.allowConso &&
          warn("storage space is full, remove item with key is" + key);
        // delete all item with has expired
        this.batchClearExpired();
        // after remove, try to set again
        try {
          window.localStorage.setItem(
            nkey,
            JSON.stringify({
              nkey: nval,
              expiresTime,
            })
          );
        } catch (error) {
          warn(`current item is to big, key is ${key}, error info ${error}`);
        }
      } else {
        warn(`can not is allow to add item`);
      }
    }
  },
  removeItem: function (key) {
    if (!isWindowEvn() || !supportStorage()) return;
    window.localStorage.removeItem(this.createKey(key));
  },
  clearAll: function () {
    window.localStorage.clear();
  },
  /**
   * clear expired key
   */
  clearExpired: function (key) {
    this.removeItem(key);
  },
  /**
   * batch delete expired key
   */
  batchClearExpired: function () {
    if (!isWindowEvn() || !supportStorage()) return;
    const keys = this.getKeys();
    while (Array.isArray(keys) && keys.length > 0) {
      const key = keys.length > 0 && keys.pop();
      const expireTiem =
        key && this.getItem(key) && JSON.parse(this.getItem(key)).expiresTime;
      if (+new Date() > expireTiem) {
        this.removeItem(key);
      }
    }
  },
};

const EXPIRES_TIME = 1 * 24 * 60 * 60; // 过期时间
class Storage {
  constructor(options) {
    const {
      productName = "default", // 项目名称
      env = "production", // 环境
      version = "default", // 版本
      encrypt = false,
      debug = false,
      ...params
    } = options;
    this.productName = productName;
    this.env = env;
    this.version = version;
    this.debug = debug;
    this.encrypt = encrypt;
    this.dataTypeList = ["string", "array", "object", "Symbol", "map"];
  }

  // 生成key
  createKey(key) {
    return `${this.productName}-${this.env}-${this.version}-${key}`;
  }

  // 设置key
  setItem(key, val, expires = undefined, isInfinite = false) {
    if (
      (typeof key === "string" && key.length === 0) ||
      typeof key === "undefined"
    )
      return;
    if (typeof key !== "string") {
      this.conso(`${key} is invalid, only string is allowed`);
      return;
    }
    if (!this.judgeDataType(val)) {
      this.conso(
        `${val} in invalid, must be one of string、array、object、symbol、map`
      );
      return;
    }
    let __val = this.encrypt ? Encrypt(JSON.stringify(val)) : val; // 加密
    let __expires = +new Date() + EXPIRES_TIME;
    const __key = this.createKey(key);
    let __valObj = { val: __val, isInfinite };
    // 自定义过期时间
    if (typeof expires === "number") {
      __valObj =
        expires !== 0
          ? {
              ...__valObj,
              expires: +new Date() / 1000 + expires,
            }
          : __valObj;
    } else {
      // 默认值
      __valObj = isInfinite
        ? __valObj
        : {
            ...__valObj,
            expires: __expires,
          };
    }

    window.localStorage.setItem(__key, JSON.stringify(__valObj));
  }

  getItem(key, cb) {
    if (
      (typeof key === "string" && key.length === 0) ||
      typeof key === "undefined"
    )
      return;
    if (typeof key !== "string") {
      this.conso(`${key} is invalid, only string is allowed`);
      return;
    }
    const cacheKey = this.createKey(key);
    const cacheVal = window.localStorage.getItem(cacheKey);
    if (!cacheVal) {
      this.conso(`current key:${key} is not json string type`);
      return "";
    }
    // 不合规的存储值进行删除处理
    if (cacheVal && !this.isJsonString(cacheVal)) {
      this.conso("current val is not json string type");
      cb instanceof Function && cb();
      this.removeItem(key);
      return "";
    }
    const { expires, val, isInfinite } = JSON.parse(cacheVal);
    // 过期处理
    if (!isInfinite && +new Date() / 1000 > expires) {
      this.conso("val has expiresed");
      this.removeItem(key);
      return "";
    }
    const __val = this.encrypt ? JSON.parse(Decrypt(val)) : val;
    return __val;
  }

  removeItem(key) {
    if (typeof key !== "string") {
      this.conso(`${key} is invalid, only string is allowed`);
      return;
    }
    const cacheKey = this.createKey(key);
    window.localStorage.removeItem(cacheKey);
  }

  clearAll() {
    window.localStorage.clear();
  }
}

export default Storage;
