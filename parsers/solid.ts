import { parse } from "@babel/parser";
import { jsxOperands, reactOperators } from "./react";

const solidControlOperators = ["Show", "For", "Switch", "Match", "Index", "ErrorBoundary", "Suspense", "when", "each", "fallback"];
export const solidOperators = [...solidControlOperators, ...reactOperators];

export default function solidParser(content: string): Program {
	let ast = parse(content, {
		sourceType: "module",
		plugins: ["jsx", "typescript"],
		tokens: true
	});

	let tokens = ast.tokens?.map(function (t) {
		let token = t.type.label;
		if (token == "eof") return false;
		if (token == "jsxName" && solidControlOperators.includes(t.value)) return t.value;
		if (!jsxOperands.includes(token)) return token;
		let value = t.value !== undefined ? String(t.value).trim() : "";
		if (value == "") return false;
		return `${token}::${value}`;
	}).filter(t => t) as string[];
	
	let unique = Array.from(new Set(tokens));
	
	return { tokens, unique };
}