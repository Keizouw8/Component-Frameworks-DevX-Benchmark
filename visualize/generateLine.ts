import lines from "../results/lines.json";

const STEP = 5;
const DOMAIN = 3e4;

export default function generateLine(metric: string, framework: string): Point[]{
	if(!(framework in lines)) return [];
	let { params, type }: { params: number[], type: string } = lines[framework as FrameworkName][metric];
	if(type == "linear") return linearLine(params as Point);
	if(type == "power") return powerLine(params as Point);
	if(type == "polynomial") return polynomialLine(params as [number, number, number]);
	return [];
}

function linearLine([m, b]: [number, number]): Point[]{
	return Array.from({ length: DOMAIN / STEP }, (_, i) => i*STEP).map(x => [x, m*x + b]);
}

function powerLine([a, b]: [number, number]): Point[] {
	return Array.from({ length: DOMAIN / STEP }, (_, i) => i*STEP).map(x => [x, a*Math.pow(x, b)]);
}

function polynomialLine([a, b, c]: [number, number, number]): Point[]{
	return Array.from({ length: DOMAIN / STEP }, (_, i) => i*STEP).map(x => [x, a*x*x + b*x + c]);
}