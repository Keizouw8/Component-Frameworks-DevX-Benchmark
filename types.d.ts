type FrameworkName = "react" | "solid";

interface Framework {
	name: FrameworkName;
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
	entropy: number;
}

type Results = { [key in FrameworkName]: Result[] };