import { parse } from "@babel/parser";

export const solidOperators = ["Show", "For", "Switch", "Match", "Index", "ErrorBoundary", "Suspense", "when", "each", "fallback"];

export default function solidParser(content: string): Program {
	let ast = parse(content, {
		sourceType: "module",
		plugins: ["jsx", "typescript"],
		tokens: true
	});

	let tokens = ast.tokens?.map(function (token) {
		if (token.type.label == "jsxName" && solidOperators.includes(token.value)) return token.value;
		return token.type.label;
	}) as string[];
	
	let unique = Array.from(new Set(tokens));
	
	return { tokens, unique };
}