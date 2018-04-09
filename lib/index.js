"use strict";
const parser = require("./parser");
const syntax = require("postcss-syntax/lib/syntax")(parser);

module.exports = syntax;
