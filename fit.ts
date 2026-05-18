import { linear, power, polynomial } from "regression";
import results from "./results/results.json";

let independent = "volume";
let metrics: { [key: string]: [Function, string] } = { radix: [power, "power"], effort: [polynomial, "polynomial"], entropy: [linear, "linear"] };

let lines: { [key: string]: { [key: string]: any } } = {};

for (let framework in results) {
	lines[framework] = {};
	for (let metric in metrics) {
		let data = results[framework].map((r: any) => [r[independent], r[metric]]).filter((r: any) => r.every((e: any) => e != null));
		lines[framework][metric] = { params: metrics[metric][0](data, { precision: 4 }).equation, type: metrics[metric][1] };
	}
}

Bun.write("./results/lines.json", JSON.stringify(lines, null, 4));
