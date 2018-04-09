"use strict";

const StyledParser = require("./styled-parser");
const Input = require("postcss/lib/input");

function styledParse (css, opts) {
	const input = new Input(css, opts);

	const parser = new StyledParser(input);
	parser.parse();

	return parser.root;
}
module.exports = styledParse;
