import path from "path";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import { babel } from "@rollup/plugin-babel";
import { uglify } from "rollup-plugin-uglify";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import serve from "rollup-plugin-serve";

const config = {
  input: path.resolve(__dirname, "src/lib/testindex.js"),
  output: {
    file: "dist/index.js", // 输出文件目录
    format: "umd", // 输出文件格式 es6 module
    name: "tinyStorage",
    // globals: {
    //   "crypto-js": "CryptoJS",
    // },
  },
  // 外部插件
  external: ["crypto-js"],
  plugins: [
    commonjs(),
    babel({
      babelHelpers: "bundled",
      exclude: ["node_modules/**"],
      include: ["src"],
    }),
    uglify({
      compress: {
        pure_getters: true,
      },
      output: {
        comments: "",
      },
      warnings: "verbose",
    }),
    json({
      compact: false,
      exclude: null, // string || Array[...String]
      indent: "\t",
      include: ["package.json"],
      namedExports: true,
      preferConst: true,
    }),
    terser(),
  ],
};

if (process.env.NODE_ENV !== "production") {
  config.plugins.push(
    nodeResolve({
      mainFields: ["browser", "jsnext:main", "module", "main"],
    }),
    serve({
      open: true,
      openPage: "/src/demo/index.html",
      port: 10008,
      contentBase: "",
    })
  );
}

export default config;
