/**
 * @author bys
 * @date 2022-07-14 14:43:37
 * @description 自定义LocalStorage
 */
import utils from "./utils.js";

const STORATE_TYPE_LIST = ["sessionStorage", "localStorage"];
const LOCAL_STORAGE = "localStorage";
const DEFAULT_DATA_TYPE_LIST = [
  "String",
  "Number",
  "Array",
  "Object",
  "Symbol",
  "Map",
];

class TinyStorage {
  constructor({
    storageType = "localStorage",
    env = "production",
    pordName = "",
    version = "",
    debug = false,
    catchTime = 0,
    dataTypeList = [], // 默认支持
  } = {}) {
    this.storageType = STORATE_TYPE_LIST.includes(storageType)
      ? storageType
      : LOCAL_STORAGE;
    this.pordName = pordName;
    this.env = env;
    this.version = version;
    this.debug = debug;
    this.prefix = "__tiny__";
    this.catchTime = catchTime || 1 * 60 * 60 * 1000; // 默认缓存一个小时
    this.dataTypeList = Array.isArray(dataTypeList)
      ? [...DEFAULT_DATA_TYPE_LIST, ...dataTypeList]
      : DEFAULT_DATA_TYPE_LIST;
  }

  // 创建storage key
  createKey(key) {
    const { prefix, pordName, env, version } = this;
    return `${prefix}${pordName ? pordName : ""}${env ? "_" + env : ""}${
      version ? "_" + version : ""
    }${key ? "_" + key : ""}`;
  }

  // 获取所有的keys
  getKeys() {
    if (!utils.supportStorage() || !utils.isWindowEvn()) return [];
    const len = window[this.storageType].length;
    let keysList = [];
    for (let i = len; i > 0; i--) {
      const key = window[this.storageType].key(i);
      new RegExp(/^__tiny__/).test(key) && keysList.push(key);
    }
    return keysList;
  }

  // 设置缓存
  setItem(key, value, expires) {
    if (
      !utils.isWindowEvn() ||
      !utils.supportStorage() ||
      !utils.isSupportJson()
    ) {
      return;
    }
    if (!utils.supportKeyType(key, this.dataTypeList)) {
      this.debug &&
        utils.warn(
          'key and value must be one of "string", "array", "object", "Symbol", "Map"'
        );
      return;
    }

    const nkey = this.createKey(key);
    let expiresTime = +new Date() + (expires || this.catchTime);
    try {
      this.removeItem(nkey); // before setItem clear current item
      const stv = {
        expiresTime,
      };
      stv[nkey] = value;
      window[this.storageType].setItem(nkey, JSON.stringify(stv));
    } catch (error) {
      // 超过最大空间
      if (utils.moreThenMaxStorageSize(error)) {
        this.debug &&
          utils.warn("storage space is full, remove item with key is" + key);

        // delete all item with has expired
        this.__batchClearExpired();

        // after remove, try to set again
        try {
          window[this.storageType].setItem(
            nkey,
            JSON.stringify({
              nkey: value,
              expiresTime,
            })
          );
        } catch (error) {
          utils.warn(
            `current item is to big, key is ${key}, error info ${error}`
          );
        }
      } else {
        utils.warn("can not is allow to add item");
      }
    }
  }

  // 获取item
  getItem(key) {
    if (!utils.isWindowEvn() || !utils.supportStorage()) {
      return;
    }
    const newkey = this.createKey(key);
    const str = window[this.storageType].getItem(newkey);
    let val = str && JSON.parse(str);
    if (!val) {
      return val;
    }
    try {
      if (val.expiresTime < +new Date()) {
        this.removeItem(key);
        val = null;
      } else {
        val = val[newkey];
      }
    } catch (error) {
      utils.warn(`current ${val} is not conformable`);
    }
    return val;
  }

  removeItem(key) {
    if (!utils.isWindowEvn() || !utils.supportStorage()) return;
    window[this.storageType].removeItem(this.createKey(key));
  }

  clearAll() {
    window[this.storageType].clear();
  }

  // 批量删除已过期的值
  __batchClearExpired() {
    if (!utils.isWindowEvn() || !utils.supportStorage()) return;
    const keys = this.getKeys();
    while (Array.isArray(keys) && keys.length > 0) {
      const key = keys.length > 0 && keys.pop();
      key && this.getItem(key);
    }
  }
}

export { TinyStorage };
