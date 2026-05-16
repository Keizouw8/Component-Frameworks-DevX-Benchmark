export default function generateDataset(results: Results, framework: Framework, metric: string, baseMetric: string): Dataset {
	let data: Point[] = results[framework.name]
		.map(result => [result[baseMetric as keyof Result], result[metric as keyof Result]] as Point)
		.filter(point => Number.isFinite(point[0]) && Number.isFinite(point[1]))
		.filter(point => point[0] < 3e4);

	return { name: framework.title, color: framework.color, data };
}