import { parse as babelParse } from "@babel/parser";
import { parse as vueParse } from "@vue/compiler-sfc";

export const jsOperands = ["name", "string", "num", "regexp", "bigint", "template"];

const VUE_NODE_TYPES: Record<number, string> = {
    1: "Element",
    2: "Text",
    3: "Comment",
    4: "SimpleExpression", // Interpolations like {{ count }} or directive values like="count > 5"
    5: "Interpolation",
    6: "Attribute",
    7: "Directive",
    8: "CompoundExpression",
    9: "If",
    10: "IfBranch",
    11: "For",
    12: "TextCall"
};
const vueTemplateOperands = ["Element", "Text", "Attribute"];
const vueTemplateOperators = ["If", "IfBranch", "For", "Interpolation", "CompoundExpression", "TextCall"];

export const vueOperators = [
    // ==========================================
    // 1. VUE TEMPLATE OPERATORS (From @vue/compiler-sfc)
    // ==========================================
    
    // Structural AST Nodes
    "If", 
    "IfBranch", 
    "For", 
    "Interpolation",      // The {{ }} brackets
    "CompoundExpression", // Connecting multiple inline expressions
    "TextCall",

    // Vue Directives (We prefixed these with "Directive::" in the parser)
    "Directive::if",
    "Directive::else-if",
    "Directive::else",
    "Directive::for",
    "Directive::on",      // v-on or @
    "Directive::bind",    // v-bind or :
    "Directive::model",   // v-model
    "Directive::slot",    // v-slot or #
    "Directive::show",
    "Directive::html",
    "Directive::text",
    "Directive::cloak",
    "Directive::once",
    "Directive::pre",
    "Directive::memo",

    // ==========================================
    // 2. JAVASCRIPT OPERATORS (From @babel/parser)
    // Used in <script> and inside template expressions
    // ==========================================

    // --- JS Keywords (Logic & Declaration) ---
    "const", "let", "var", "function", "return", 
    "if", "else", "switch", "case", "default",
    "for", "while", "do", "break", "continue",
    "try", "catch", "finally", "throw",
    "import", "export", "default", "from",
    "class", "extends", "super", "this", "new",
    "await", "async", "yield", "typeof", "instanceof", "void", "delete",

    // --- Punctuation & Grouping ---
    "{", "}",      // Block/Object scoping
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

export default function vueParser(content: string): Program {
	let tokens: string[] = [];
	
	const { descriptor } = vueParse(content);
	const scriptContent = [descriptor.script?.content || "", descriptor.scriptSetup?.content || ""].join("\n").trim();
	
	// if (scriptContent) babelParse(scriptContent, {
 //        sourceType: "module",
 //        plugins: ["typescript"],
 //        tokens: true
 //    }).tokens?.forEach(function (t) {
	// 	let label = t.type.label;
	// 	if (label == "eof") return;
	// 	if (!jsOperands.includes(label)) return tokens.push(label);
	// 	let value = t.value !== undefined ? String(t.value).trim() : "";
	// 	if (value != "") tokens.push(`${label}::${value}`);
	// });
	if (descriptor.template?.ast) walkTemplate(tokens, descriptor.template.ast);
	
	return { tokens, unique: Array.from(new Set(tokens)) };
}

function walkTemplate(tokens: string[], node: any) {
    if (!node) return;

    const typeName = VUE_NODE_TYPES[node.type] || `Node_${node.type}`;

    // Skip HTML Comments
    if (node.type === 3) return; 

    // Handle SimpleExpressions (JS hidden inside template directives/interpolations)
    if (node.type === 4) {
        const exprValue = (node.content || "").trim();
        if (exprValue) {
            // Pass embedded JS back through Babel to get accurate Operator/Operand counts
            try {
                let exprAst = babelParse(exprValue, { tokens: true });
                let exprTokens = exprAst.tokens?.map(t => {
                    let label = t.type.label;
                    if (label == "eof") return false;
                    if (!jsOperands.includes(label)) return label;
                    let val = t.value !== undefined ? String(t.value).trim() : "";
                    if (val == "") return false;
                    return `${label}::${val}`;
                }).filter(t => t) as string[];
                
                tokens.push(...exprTokens);
            } catch (e) {
                // Fallback if Babel fails to parse a partial expression
                tokens.push(`Expression::${exprValue}`);
            }
        }
    } 
    // Handle Directives (v-if, v-for, etc.)
    else if (node.type === 7) {
        // E.g., 'Directive::if', 'Directive::for'. These are Operators.
        tokens.push(`Directive::${node.name}`);
    } 
    // Handle Template Operands (Elements, Text, standard Attributes)
    else if (vueTemplateOperands.includes(typeName)) {
        let value = "";
        if (node.type === 1) value = node.tag;         // Element tag (div, span)
        if (node.type === 2) value = node.content;     // Text content
        if (node.type === 6) value = node.name;        // Attribute name (class, id)

        value = value.trim();
        if (value) tokens.push(`${typeName}::${value}`);
    } 
    // Handle Template Operators (Structure like <template v-if="..">)
    else {
        tokens.push(typeName);
    }

    // Recurse down the Vue AST branches
    if (node.children) node.children.forEach((e: any) => walkTemplate(tokens, e));
    if (node.branches) node.branches.forEach((e: any) => walkTemplate(tokens, e));
    if (node.exp) walkTemplate(tokens, node.exp);
    if (node.arg) walkTemplate(tokens, node.arg);
}