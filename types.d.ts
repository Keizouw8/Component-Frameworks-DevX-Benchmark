interface Framework {
	name: string;
	extensions: string[];
	parser(content: string): Program;
}

interface Program {
	tokens: string[];
	total: number;
	unique: number;
}

interface Result {
	radix: number;
}