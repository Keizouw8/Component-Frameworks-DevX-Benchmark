import { parse } from "@babel/parser";

export const jsxOperands = ["name", "string", "num", "jsxName", "jsxText", "regexp", "bigint", "template"]; 

export const reactOperators = [
    // --- JSX Structural Punctuation ---
    "jsxTagStart", // <
    "jsxTagEnd",   // > or />
    "</",          // Closing tag start

    // --- JS Keywords (Logic & Declaration) ---
    "const", "let", "var", "function", "return", 
    "if", "else", "switch", "case", "default",
    "for", "while", "do", "break", "continue",
    "try", "catch", "finally", "throw",
    "import", "export", "default", "from",
    "class", "extends", "super", "this", "new",
    "await", "async", "yield", "typeof", "instanceof", "void", "delete",

    // --- Punctuation & Grouping ---
    "{", "}",      // Block/Object scoping, and JSX expression wrappers
    "(", ")",      // Function calls, grouping
    "[", "]",      // Arrays, computed properties
    ".",           // Property access
    ",",           // Separator
    ";",           // Statement terminator
    ":",           // Object key/value separator, TS types
    "...",         // Spread/Rest operator
    "?",           // Optional chaining / Ternary
    "?.",          // Optional chaining

    // --- Arrow Functions ---
    "=>",          

    // --- Assignment & Math ---
    "=", "+=", "-=", "*=", "/=", "%=", "**=",
    "+", "-", "*", "/", "%", "**",
    "++", "--",

    // --- Logical & Comparison ---
    "&&", "||", "??", "!", 
    "==", "===", "!=", "!==", 
    "<", "<=", ">", ">=",

    // --- Bitwise Operators ---
    "&", "|", "^", "~", "<<", ">>", ">>>"
];

export default function reactParser(content: string): Program {
	let ast = parse(content, {
		sourceType: "module",
		plugins: ["jsx", "typescript"],
		tokens: true
	});

	let tokens = ast.tokens?.map(function(t){
			let token = t.type.label;
			if(token == "eof") return false;
			if(!jsxOperands.includes(token)) return token
            let value = t.value !== undefined ? String(t.value).trim() : "";
            if (value == "") return false;
            return `${token}::${value}`;
		}).filter(t => t) as string[];
	
	return { tokens, unique:  Array.from(new Set(tokens)) };
}