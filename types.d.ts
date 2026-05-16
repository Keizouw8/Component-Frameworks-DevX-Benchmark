type FrameworkName = "react" | "solid";
type Results = { [key in FrameworkName]: Result[] };

interface Framework {
	name: FrameworkName;
	title: string;
	extensions: string[];
	operands: string[];
	parser(content: string): Program;
	color: string
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

type Point = [number, number];

interface Dataset {
	name: string;
	data: Point[];
	color: string;
}