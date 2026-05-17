type FrameworkName = "react" | "solid" | "svelte" | "vue" | "angular";
type Method = "radix" | "effort" | "entropy";
type Results = { [key in FrameworkName]: Result[] };

interface Framework {
	name: FrameworkName;
	title: string;
	extensions: string[];
	operators: string[];
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

interface Series {
	name: string;
	type: string;
	data: Point[];
	itemStyle: { color: string };
	smooth?: Boolean;
	symbolSize?: number;
}
