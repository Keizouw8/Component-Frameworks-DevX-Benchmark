import { parse } from "@babel/parser";

export default function jsxParser(content: string): Program {
	let ast = parse(content, {
		sourceType: "module",
		plugins: ["jsx", "typescript"],
		tokens: true
	});

	let tokens = ast.tokens?.map(t => t.type.label) as string[];
	let unique = new Set(tokens).size;
	let total = tokens.length;
	
	return { tokens, unique, total };
}