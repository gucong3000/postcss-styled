"use strict";

const extract = require("../extract");
const expect = require("chai").expect;

describe("parser", () => {
	const opts = {
		syntax: {
			config: {},
		},
	};

	it("skip empty template literal", () => {
		const result = extract("``", opts);
		expect(result).to.have.lengthOf(0);
	});

	it("skip spaces template literal", () => {
		const result = extract("`    `", opts);
		expect(result).to.have.lengthOf(0);
	});

	it("skip double quotes", () => {
		const result = extract("\"$ {}\"", opts);
		expect(result).to.have.lengthOf(0);
	});

	it("skip standard comments", () => {
		const result = extract("/*`$ {}`*/", opts);
		expect(result).to.have.lengthOf(0);
	});

	it("skip single-line comments", () => {
		const result = extract("//`$ {}`", opts);
		expect(result).to.have.lengthOf(0);
	});

	it("2 template literal", () => {
		const result = extract([
			"//`${}`",
			"`${}`",
			"`${}",
			"\\``",
		].join("\n"), opts);
		expect(result).to.have.lengthOf(2);
		expect(result[0]).have.property("content", "${}");
		expect(result[0]).have.property("startIndex", 9);
		expect(result[1]).have.property("content", "${}\n\\`");
		expect(result[1]).have.property("startIndex", 15);
	});

	it("single line string in line 2", () => {
		const result = extract("\n`$ {}`", opts);
		expect(result).to.have.lengthOf(1);
		expect(result[0]).have.property("content", "$ {}");
		expect(result[0]).have.property("startIndex", 2);
	});
});
