export default function generateDataset(results: Results, framework: Framework, metric: string, baseMetric: string): Dataset {
	let data: Point[] = results[framework.name].map(result => ({ x: result[baseMetric as keyof Result], y: result[metric as keyof Result] }));
	return { label: framework.title, backgroundColor: framework.color, data };
}