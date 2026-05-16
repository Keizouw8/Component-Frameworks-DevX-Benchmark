import { parse } from "svelte/compiler";

export const svelteOperators = [
    // --- Svelte Control Flow & Template Operators ---
    "IfBlock",
    "ElseBlock",
    "EachBlock",
    "AwaitBlock",
    "ThenBlock",
    "CatchBlock",
    "KeyBlock",
    "MustacheTag",
    "RawMustacheTag",
    "Slot",
    "SlotTemplate",

    // --- Svelte Attributes & Directives ---
    "Attribute",
    "EventHandler",
    "Binding",
    "Class",
    "Action",
    "Transition",
    "Animation",
    "Let",

    // --- JS/ESTree Declarations ---
    "VariableDeclaration",
    "VariableDeclarator",
    "FunctionDeclaration",
    "ImportDeclaration",
    "ImportSpecifier",
    "ImportDefaultSpecifier",
    "ExportNamedDeclaration",
    "ExportDefaultDeclaration",

    // --- JS/ESTree Statements ---
    "BlockStatement",
    "ReturnStatement",
    "IfStatement",
    "ExpressionStatement",
    "ForStatement",
    "ForInStatement",
    "ForOfStatement",
    "WhileStatement",
    "DoWhileStatement",
    "SwitchStatement",
    "SwitchCase",
    "TryStatement",
    "CatchClause",
    "ThrowStatement",
    "BreakStatement",
    "ContinueStatement",

    // --- JS/ESTree Expressions ---
    "BinaryExpression",      // e.g., a + b, a === b
    "LogicalExpression",     // e.g., a && b, a || b
    "AssignmentExpression",  // e.g., a = b
    "UpdateExpression",      // e.g., a++, b--
    "UnaryExpression",       // e.g., !a, typeof b
    "CallExpression",        // e.g., console.log()
    "MemberExpression",      // e.g., object.property
    "ArrowFunctionExpression",
    "FunctionExpression",
    "ObjectExpression",      // e.g., { a: 1 }
    "ArrayExpression",       // e.g., [1, 2, 3]
    "Property",              // Object property assignments
    "SpreadElement",         // e.g., ...args
    "TemplateLiteral",       // e.g., `string ${var}`
    "TemplateElement",
    "ConditionalExpression", // e.g., a ? b : c (Ternary)
    "AwaitExpression",
    "SequenceExpression",
    "NewExpression"
];;

export default function svelteParser(content: string): Program {
	let ast = parse(content);
	let tokens: string[] = [];

    function walk(node: any){
        if (!node || typeof node != 'object') return;
        if (Array.isArray(node)) return node.forEach(child => walk(child));
        for(const key in node) if (key != "parent" && typeof node[key] == "object") walk(node[key]);
        if(node.type && node.type != "Fragment"){
            if((node.type == "Text" || node.type == "Literal") && !String(node.value || node.data).trim()) return;
            
            let token = node.type;
            if (token == "Identifier" || token == "Element" ||  token == "InlineComponent" || token == "Attribute" || token == "EventHandler" || token == "Binding") token += `::${node.name}`;
            if (token == "Text" || token == "Literal") token += `::${String(node.value || node.data).trim()}`;
            
            tokens.push(token);
        }
    }

    walk(ast.html);
    if (ast.instance) walk(ast.instance);
    if (ast.module) walk(ast.module);
	
	return { tokens, unique: Array.from(new Set(tokens)) };
}