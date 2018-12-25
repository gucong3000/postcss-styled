"use strict";
const tokenize = require("postcss/lib/tokenize");

function templateTokenize () {
	const tokenizer = tokenize.apply(null, arguments);

	function nextToken () {
		let token = tokenizer.nextToken();
		if (token && token[0] === "word" && /(\\*)\$$/.test(token[1]) && !(RegExp.$1.length % 2)) {
			let next = tokenizer.nextToken();
			if (next[0] === "{" && next[2] === token[4] && next[3] === token[5] + 1) {
				const returned = [token];
				let depth = 1;

				do {
					returned.push(next);
					if (next[0] !== "word") {
						if (next[0] === "{") {
							++depth;
						} else if (next[0] === "}" && --depth <= 0) {
							break;
						}
					}
				} while (depth && (next = tokenizer.nextToken()));

				const lastToken = returned[returned.length - 1];
				token = [
					"word",
					returned.map(token => token[1]).join(""),
					returned[0][2],
					returned[0][3],
					lastToken[4],
					lastToken[5],
				];
			} else {
				tokenizer.back(next);
			}
		}
		return token;
	}
	return Object.assign({}, tokenizer, {
		nextToken,
	});
}

module.exports = templateTokenize;
