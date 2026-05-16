import halsteadVolume from "./volume";

export default function halsteadEffort(program: Program, operators: string[]): number {
	let { tokens } = program;
	
	let V = halsteadVolume(program);
	let N2 = 0;
	
	let uniqueOperators = new Set();
	let uniqueOperands = new Set();

	tokens.forEach(function (token) {
		if (token == "eof") return;
		if (operators.includes(token)) return uniqueOperators.add(token);
		N2++;
		uniqueOperands.add(token);
	});

	let n1 = uniqueOperators.size;
	let n2 = uniqueOperands.size;
	
	return 0.5 * V * n1 * N2 / n2;
}