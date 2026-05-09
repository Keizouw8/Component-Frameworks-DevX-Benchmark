interface Framework {
	name: string;
	extensions: string[];
	operands: string[];
	parser(content: string): Program;
}

interface Program {
	tokens: string[];
	unique: string[];
}

interface Result {
	volume: number;
	radix: number;
	effort: number;
}