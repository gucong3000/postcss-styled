"use strict";
const Parser = require("postcss/lib/parser");
const styledTokenize = require("./styled-tokenize");
class StyledParser extends Parser {
	createTokenizer () {
		this.tokenizer = styledTokenize(this.input);
	}
}
module.exports = StyledParser;
