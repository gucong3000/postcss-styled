"use strict";
const getSyntax = require("postcss-syntax/lib/get-syntax");

function literalParser (source, opts, styles) {
	styles = styles || [];
	let styledSyntax;

	function getStyledSyntax () {
		if (!styledSyntax) {
			const cssSyntax = getSyntax("css", opts);
			styledSyntax = {
				parse: require(cssSyntax.parse.name === "safeParse" ? "./styled-safe-parse" : "./styled-parse"),
				stringify: cssSyntax.stringify,
			};
		}
		return styledSyntax;
	}

	literal(source, (startIndex, endIndex, quote) => {
		if (quote !== "`") {
			return;
		}

		const strSource = source.slice(startIndex, endIndex);

		if (!strSource.trim()) {
			return;
		}

		styles.push({
			startIndex: startIndex,
			content: strSource,
			ignoreErrors: true,
			syntax: /(^|\s|\{|\}|;|:)\$\{/m.test(strSource) && getStyledSyntax(),
		});
	});

	return styles;
};

function literal (source, callback) {
	let insideString = false;
	let insideComment = false;
	let insideSingleLineComment = false;
	let strStartIndex;
	let openingQuote;

	for (let i = 0, l = source.length; i < l; i++) {
		const currentChar = source[i];

		// Register the beginning of a comment
		if (
			!insideString && !insideComment &&
			currentChar === "/" &&
			source[i - 1] !== "\\" // escaping
		) {
			// standard comments
			if (source[i + 1] === "*") {
				insideComment = true;
				continue;
			}
			// single-line comments
			if (source[i + 1] === "/") {
				insideComment = true;
				insideSingleLineComment = true;
				continue;
			}
		}

		if (insideComment) {
			// Register the end of a standard comment
			if (
				!insideSingleLineComment &&
				currentChar === "*" &&
				source[i - 1] !== "\\" && // escaping
				source[i + 1] === "/" &&
				source[i - 1] !== "/" // don't end if it's /*/
			) {
				insideComment = false;
				continue;
			}

			// Register the end of a single-line comment
			if (
				insideSingleLineComment &&
				currentChar === "\n"
			) {
				insideComment = false;
				insideSingleLineComment = false;
				continue;
			}
		}

		// Register the beginning of a string
		if (!insideComment && !insideString && (currentChar === "\"" || currentChar === "'" || currentChar === "`")) {
			if (source[i - 1] === "\\") continue; // escaping

			openingQuote = currentChar;
			insideString = true;

			strStartIndex = i + openingQuote.length;
			continue;
		}

		// Register the end of a string
		if (insideString && currentChar === openingQuote) {
			if (source[i - 1] === "\\") continue; // escaping
			insideString = false;
			if ((i - strStartIndex) > 1) {
				callback(strStartIndex, i, openingQuote);
			}
			continue;
		}
	}
}
module.exports = literalParser;
