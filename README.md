#### wps-storage-sdk

wps-storage-sdk

#### 安装

设置海外私有源

```sh
# 方式一:
npm set @wps:registry http://npm.4wps.net
# 方式二: 项目根目录添加 .npmrc 文件,添加如下配置
@wps:registry=http://npm.4wps.net
```

#### 项目使用

##### 引用

```js
import TinyStorage from "@wpsovs/wps-tiny-storage";
const storage = new TinyStorage({
  // ...options
});
```

##### 方法

```js
// 获取所有本地储存的key
storage.getKeys();

/**
 * @description 添加 修改数据项
 * @param {
 *  key: '键', type string 必传
 *  val: '值', type ["string", "array", "object", "Symbol", "map"] 必传
 *  time: '过期时间(以秒为单位)', type number 默认：0
 * }
 */
storage.setItem(key, val, time);
/**
 * @description 获取数据项
 * @param {
 *  key: '键', type string 必传
 * }
 */
storage.getItem(key);

/**
 * @description 删除数据项
 * @param {
 *  key: '键', type string 必传
 * }
 */
storage.removeItem(key);

// 删除所有数据项
storage.clearAll();
```

#### 选项 options

|       参数       |  类型   |                         默认                          | 说明             |
| :--------------: | :-----: | :---------------------------------------------------: | ---------------- |
| **storageType**  | String  |                     localStorage                      | 项目名称         |
|   **pordName**   | String  |                          ''                           | 项目名称         |
|     **env**      | String  |                     'production'                      | 当前环境         |
|   **version**    | String  |                          ''                           | 当前版本         |
|  **allowConso**  | Boolean |                         false                         | 是否允许日志打印 |
|  **catchTime**   | number  |                        3600000                        | 缓存时长         |
| **dataTypeList** |  Array  | ["String","Number","Array","Object","Symbol", "Map",] | 默认数据类型检测 |

#### 版本功能介绍

version 0.0.6
[x] 支持默认缓存 1h
[x] 支持 sessionStorage & localStorage
[x] 支持日志打印
[x] 支持全局缓存以及局部缓存
[x] 支持自定义数据类型
