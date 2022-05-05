// 加密解密测试代码
import { Decrypt, Encrypt } from "./utils.js";
const test = JSON.stringify({ age: 108 });
const EncryptTest = Encrypt(test);
console.log("--Encrypt-------", EncryptTest);
console.log("---Decrypt------", Decrypt(EncryptTest));
console.log("---------", test === Decrypt(EncryptTest));