"use strict";
const expect = require("chai").expect;
const syntax = require("../");
const fs = require("fs");

describe("styled-components", () => {
	it("basic", () => {
		const file = require.resolve("./fixtures/styled");
		let code = fs.readFileSync(file);

		const document = syntax.parse(code, {
			from: file,
		});

		code = code.toString();
		expect(document.toString(), code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");

		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(8);

		const lines = code.match(/^.+$/gm).slice(3).map(line => (line.replace(/^\s*(.+?);?\s*$/, "$1")));
		document.first.nodes.forEach((decl, i) => {
			if (i) {
				expect(decl).to.have.property("type", "decl");
			} else {
				expect(decl).to.have.property("type", "comment");
			}
			expect(decl.toString()).to.equal(lines[i]);
		});
	});

	it("empty template literal", () => {
		const code = [
			"function test() {",
			"  console.log(`debug`)",
			"  return ``;",
			"}",
			"",
		].join("\n");
		const document = syntax.parse(code, {
			from: "empty_template_literal.js",
		});
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");
		expect(document.nodes).to.have.lengthOf(0);
	});

	it("skip javascript syntax error", () => {
		const code = "\\`";
		const document = syntax.parse(code, {
			from: "syntax_error.js",
		});
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");
		expect(document.nodes).to.have.lengthOf(0);
	});

	it("illegal template literal", () => {
		const code = "`$\n{display: block}\n${g} {}`";
		const document = syntax.parse(code, {
			from: "illegal_template_literal.js",
		});
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");
		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(2);
		expect(document.first.first).have.property("type", "rule");
		expect(document.first.first).have.property("selector", "$");
		expect(document.last.last).have.property("type", "rule");
		expect(document.last.last).have.property("selector", "${g}");
	});

	it("skip CSS syntax error", () => {
		const code = "`a{`";
		const document = syntax.parse(code, {
			from: "css_syntax_error.js",
		});
		expect(document.toString()).to.equal(code);
		expect(document.source).to.haveOwnProperty("lang", "jsx");
		expect(document.nodes).to.have.lengthOf(0);
	});

	it("fix CSS syntax error", () => {
		const code = "`a{`";
		const document = syntax({
			css: "safe-parser",
		}).parse(code, {
			from: "postcss-safe-parser.js",
		});
		expect(document.toString()).to.equal("`a{}`");
		expect(document.source).to.haveOwnProperty("lang", "jsx");
		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(1);
		expect(document.first.first).have.property("type", "rule");
		expect(document.first.first).have.property("selector", "a");
	});

	it("fix styled syntax error", () => {
		const code = "`${ a } {`";
		const document = syntax({
			css: "safe-parser",
		}).parse(code, {
			from: "styled-safe-parse.js",
		});
		expect(document.toString()).to.equal("`${ a } {}`");
		expect(document.source).to.haveOwnProperty("lang", "jsx");
		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.nodes).to.have.lengthOf(1);
		expect(document.first.first).have.property("type", "rule");
		expect(document.first.first).have.property("selector", "${ a }");
	});
});
