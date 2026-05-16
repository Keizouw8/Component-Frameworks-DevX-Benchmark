import { parse as babelParse } from "@babel/parser";
import { parseTemplate } from "@angular/compiler";
import { jsOperands } from "./vue";

export const angularOperators = [
    // ==========================================
    // 1. ANGULAR TEMPLATE OPERATORS
    // ==========================================
    "Template",        // <ng-template>
    "BoundText",       // {{ interpolation }}
    "IfBlock",         // @if
    "ForLoopBlock",    // @for
    "SwitchBlock",     // @switch
    
    // (Prefix matching for Bound properties)
    // "BoundEvent::*",      // e.g., BoundEvent::click
    // "BoundAttribute::*",  // e.g., BoundAttribute::class

    // ==========================================
    // 2. TYPESCRIPT / JAVASCRIPT OPERATORS (From @babel/parser)
    // Used in .ts logic and inside HTML bindings
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
    "{", "}", "(", ")", "[", "]", ".", ",", ";", ":", "...", "?", "?.",

    // --- Arrow Functions ---
    "=>",          

    // --- Assignment & Math ---
    "=", "+=", "-=", "*=", "/=", "%=", "**=",
    "+", "-", "*", "/", "%", "**", "++", "--",

    // --- Logical & Comparison ---
    "&&", "||", "??", "!", "==", "===", "!=", "!==", "<", "<=", ">", ">=",

    // --- Angular Pipes & Bitwise Operators ---
    "&", "|", "^", "~", "<<", ">>", ">>>",

    // --- TypeScript Specific ---
    "@", "implements", "interface", "type", "enum", "readonly", "declare", "public", "private", "protected"
];

export default function angularParser(content: string): Program {
    let tokens: string[] = [];

    // --- HELPER: Parse standard TS/JS logic via Babel ---
    function processBabel(scriptContent: string) {
        if (!scriptContent.trim()) return;
        try {
            let ast = babelParse(scriptContent, {
                sourceType: "module",
                plugins: ["typescript", ["decorators", { "decoratorsBeforeExport": true }]],
                tokens: true
            });

            const jsTokens = ast.tokens?.map(function(t) {
                let label = t.type.label;
                if (label === "eof") return false;
                
                if (!jsOperands.includes(label)) return label; // Operator
                
                let value = t.value !== undefined ? String(t.value).trim() : "";
                if (value === "") return false;
                return `${label}::${value}`; // Operand
            }).filter(Boolean) as string[];

            tokens.push(...(jsTokens || []));
        } catch (e) {
            // Fallback for expression fragments that Babel can't parse directly
            tokens.push(`Expression::${scriptContent.trim()}`);
        }
    }

    // --- STEP 1: Handle TypeScript Logic File ---
    // If the file looks like a TS component, parse its logic first
    if (content.includes("import ") || content.includes("@Component")) {
        processBabel(content);
        
        // Check for an inline template and extract it to parse as HTML
        const inlineTemplateMatch = content.match(/template:\s*`([^`]+)`/);
        if (inlineTemplateMatch && inlineTemplateMatch[1]) {
            content = inlineTemplateMatch[1]; // Parse the inline template next
        } else {
            // It's a TS file with an external templateUrl, we are done here.
            return { tokens, unique: Array.from(new Set(tokens)) }; 
        }
    }

    // --- STEP 2: Parse the HTML Template AST ---
    // Either the user passed raw HTML, or we extracted it from the inline TS component
    try {
        const { nodes } = parseTemplate(content, "template.html");

        function walkTemplate(node: any) {
            if (!node || typeof node !== 'object') return;

            let rawJs = "";

            // 1. Duck-Type Angular Template Nodes
            if (node.tagName) {
                if (node.tagName.toLowerCase() === "ng-template") {
                    tokens.push(`Template`); // Operator
                } else {
                    tokens.push(`Element::${node.tagName}`); // Operand
                }
            } 
            else if (node.name && node.handler) {
                // Event Binding (e.g., (click)="...")
                tokens.push(`BoundEvent::${node.name}`); // Operator
                rawJs = node.handler.source; // Extract the JS inside
            } 
            else if (node.name && node.value && typeof node.value === 'object') {
                // Property Binding (e.g., [disabled]="...")
                tokens.push(`BoundAttribute::${node.name}`); // Operator
                rawJs = node.value.source; // Extract the JS inside
            }
            else if (node.name && node.value !== undefined && typeof node.value === 'string') {
                // Static HTML Attribute (e.g., class="container")
                tokens.push(`Attribute::${node.name}`); // Operand
            } 
            else if (node.value && typeof node.value === 'object' && !node.name) {
                // Interpolation (e.g., {{ data }})
                tokens.push(`BoundText`); // Operator
                rawJs = node.value.source; // Extract the JS inside
            } 
            else if (node.value && typeof node.value === 'string') {
                // Static Text Node
                const text = node.value.trim();
                if (text) tokens.push(`Text::${text}`); // Operand
            } 
            else if (node.branches) {
                // @if Control flow
                tokens.push(`IfBlock`); // Operator
            } 
            else if (node.trackBy) {
                // @for Control flow
                tokens.push(`ForLoopBlock`); // Operator
            } 
            else if (node.cases) {
                // @switch Control flow
                tokens.push(`SwitchBlock`); // Operator
            }
            else if (node.name) {
                // Template reference or let-variable (e.g., #myRef, let-user)
                tokens.push(`Reference::${node.name}`); // Operand
            }

            // 2. Process Embedded TS/JS Logic (Interpolations, Event Handlers)
            if (rawJs) {
                processBabel(rawJs);
            }

            // 3. Recurse Down the AST
            if (Array.isArray(node.children)) node.children.forEach(walkTemplate);
            if (Array.isArray(node.attributes)) node.attributes.forEach(walkTemplate);
            if (Array.isArray(node.inputs)) node.inputs.forEach(walkTemplate);
            if (Array.isArray(node.outputs)) node.outputs.forEach(walkTemplate);
            if (Array.isArray(node.templateAttrs)) node.templateAttrs.forEach(walkTemplate);
            if (Array.isArray(node.variables)) node.variables.forEach(walkTemplate);
            if (Array.isArray(node.references)) node.references.forEach(walkTemplate);
            
            // Recurse new Control Flow blocks (@if, @for, @switch)
            if (Array.isArray(node.branches)) node.branches.forEach(walkTemplate);
            if (Array.isArray(node.cases)) node.cases.forEach(walkTemplate);
            
            // Sometimes branches have nested single elements rather than arrays
            if (node.children && typeof node.children === 'object' && !Array.isArray(node.children)) {
               walkTemplate(node.children);
            }
        }

        if (nodes && nodes.length > 0) {
            nodes.forEach(walkTemplate);
        }
    } catch (err) {
        // Handle malformed HTML parsing
        console.error("Angular template parsing failed.", err);
    }

    return { tokens, unique: Array.from(new Set(tokens)) };
}