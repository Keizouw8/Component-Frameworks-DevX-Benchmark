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
let whichFrameworks: FrameworkName[] = ["react", "solid"];

let allDatasets: { [key: string]: Dataset[] } = Object.fromEntries(whichMetrics.map(m => [m, []]));
let results = await Bun.file("./out/results.json").json();

for (let metric of whichMetrics) {
	for (let framework of whichFrameworks) {
		let dataset = generateDataset(results, frameworks[framework], metric, baseMetric);
		allDatasets[metric].push(dataset);
		await generateChart(`./out/${metric}/${framework}.svg`, [dataset], {
			title: `${metrics[metric]}: ${frameworks[framework].title}`,
			x: metrics[baseMetric],
			y: metrics[metric]
		});
	}
	
	await generateChart(`./out/${metric}/${whichFrameworks.join("-")}.svg`, allDatasets[metric], {
		title: `${metrics[metric]}: ${whichFrameworks.map(framework => frameworks[framework].title).join(" vs. ")}`,
		x: metrics[baseMetric],
		y: metrics[metric]
	});
}