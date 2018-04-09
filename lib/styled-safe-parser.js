"use strict";
const SafeParser = require("postcss-safe-parser/lib/safe-parser");
const styledTokenize = require("./styled-tokenize");
class StyledSafeParser extends SafeParser {
	createTokenizer () {
		this.tokenizer = styledTokenize(this.input, { ignoreErrors: true });
	}
}
module.exports = StyledSafeParser;
