/**
 * @author bys
 * @date 2021-12-27 16:26:21
 * @description localStorage增强
 */
import {
  decrypt,
  encrypt,
  isWindowEvn,
  supportStorage,
  isSupportJson,
  moreThenMaxStorageSize,
  supportKeyType,
  isSupportConsole,
} from "./utils.js";
import utils from "./utils.js";
import { version } from "../../package.json";

(function() {
  if (isWindowEvn() && isSupportConsole()) {
    warn(`current version ${version}`);
  };
})()

/**
 * @param {
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
  this.catchTime = 1 * 60 * 60 * 1000;
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
  getItem: function (key, encrypeKey) {
    if (!isWindowEvn() || !supportStorage()) return;
    const newkey = this.createKey(key);
    const str = window.localStorage.getItem(newkey);
    let val;
    try {
      val = str && JSON.parse(str);
      // expired
      if (val.expiresTime < +new Date()) {
        this.clearExpired(this.createKey(key));
      } else {
        encrypeKey = encrypeKey || this.encrypeKey;
        val = encrypeKey ? decrypt(val[newkey], encrypeKey) : val;
      }
    } catch (error) {
      utils.warn(`current ${val} is not conformable`);
    }
    return val;
  },
  /**
   * @param {
   *  key,
   *  value,
   *  time, // default cache one hour
   * }
   */
  setItem: function (key, value, time, encrypeKey) {
    if (!isWindowEvn() || !supportStorage() || isSupportJson()) return;
    if (!supportKeyType(key) || !supportKeyType(value)) {
      this.allowConso &&
        utils.warn(
          'key and value must be one of "string", "array", "object", "Symbol", "Map"'
        );
      return;
    }
    const nkey = this.createKey(key);
    const isEncrypeKey = encrypeKey || this.encrypeKey;
    let nval =
      this.encrypt && isEncrypeKey ? encrypt(value, isEncrypeKey) : value; // encrypt sensitive data
    let expiresTime = +new Date() + (time || this.catchTime);
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
          utils.warn("storage space is full, remove item with key is" + key);
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
          utils.warn(
            `current item is to big, key is ${key}, error info ${error}`
          );
        }
      } else {
        utils.warn(`can not is allow to add item`);
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
      key && this.getItem(key);
    }
  },
};

export default TinyStorage;
