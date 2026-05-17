import { frameworks } from "./frameworks";
import generateChart from "./visualize/generateChart";
import generateDataset from "./visualize/generateDataset";

const metrics: { [key: string]: string } = {
	radix: "Radix Economy",
	volume: "Halstead Volume",
	effort: "Halstead Effort",
	entropy: "Shannon Entropy"
};

let baseMetric = "volume";
let whichMetrics = ["radix", "effort", "entropy"];
let whichFrameworks: FrameworkName[] = ["react", "solid", "svelte", "vue", "angular"];

let allSeries: { [key: string]: Series[] } = Object.fromEntries(whichMetrics.map(m => [m, []]));
let results = await Bun.file("./results/results.json").json();

for (let metric of whichMetrics) {
	for (let framework of whichFrameworks) {
		let series = generateDataset(results, frameworks[framework], metric, baseMetric);
		allSeries[metric].push(...series);
		await generateChart(`./results/${metric}/${framework}.png`, series, {
			title: `${metrics[metric]}: ${frameworks[framework].title}`,
			x: metrics[baseMetric],
			y: metrics[metric]
		});
	}

	await generateChart(`./results/${metric}/${whichFrameworks.join("-")}.png`, allSeries[metric], {
		title: `${metrics[metric]}: ${whichFrameworks.map(framework => frameworks[framework].title).join(" vs. ")}`,
		x: metrics[baseMetric],
		y: metrics[metric]
	});
}
