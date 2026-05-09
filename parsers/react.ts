import { parse } from "@babel/parser";

export const jsxOperands = ["name", "string", "num", "jsxName", "jsxText", "regexp", "bigint", "template"];

export default function reactParser(content: string): Program {
	let ast = parse(content, {
		sourceType: "module",
		plugins: ["jsx", "typescript"],
		tokens: true
	});

	let tokens = ast.tokens?.map(t => t.type.label) as string[];
	let unique = Array.from(new Set(tokens));
	
	return { tokens, unique };
}