"use strict";

const StyledSafeParser = require("./styled-safe-parser");
const Input = require("postcss/lib/input");

function styledSafeParse (css, opts) {
	const input = new Input(css, opts);

	const parser = new StyledSafeParser(input);
	parser.parse();

	return parser.root;
}
module.exports = styledSafeParse;
