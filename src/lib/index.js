/**
 * @author bys
 * @date 2021-12-27 16:26:21
 * @description localStorage增强
 */
import { Decrypt, Encrypt } from "./utils.js";

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
  this.allowConso = allowConso;
  this.decimal = 10;
  this.expireTime = 24 * 60 * 60 * 1000;
}

TinyStorage.prototype = {
  constructor: TinyStorage,
  getItem: function() {

  },
  setItem: function() {

  },
  removeItem: function(params) {
    
  },
  clearAll: function() {

  },
  /**
   * clear expired key
   */
  clearHasExpired: function(key) {
    
  },
  /**
   * batch delete expired key
   */
  batchClearExpired: function(params) {
    
  }
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

  // 日志
  conso(...args) {
    if (!this.debug) return;
    console.log(...args);
  }

  // 数据类型判断
  judgeDataType(val) {
    const str = Object.prototype.toString.call(val);
    const len = str.length;
    const type = str.slice(8, len - 1).toLowerCase();
    const bool = this.dataTypeList.includes(type);
    return bool;
  }

  // 判断是否是合法的json字符串
  isJsonString(str) {
    let bool;
    try {
      JSON.parse(str);
      bool = true;
    } catch (e) {
      bool = false;
    }
    return bool;
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
