const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");

const isProduction = process.env.npm_lifecycle_event === "build";

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: "./main.ts",
  module: {
    rules: [
      {
        test: /.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ESLintPlugin(),
    new HtmlWebpackPlugin({
      title: "JS13kGames 2022",
      template: "./index.html",
      minify: isProduction && {
        collapseWhitespace: true,
        minifyCSS: true,
        removeComments: true,
      },
    }),
  ],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
