import generateLine from "./generateLine";

export default function generateDataset(results: Results, framework: Framework, metric: string, baseMetric: string): [Series, Series] {
	let data: Point[] = results[framework.name]
		.map(result => [result[baseMetric as keyof Result], result[metric as keyof Result]] as Point)
		.filter(point => Number.isFinite(point[0]) && Number.isFinite(point[1]))
		.filter(point => point[0] < 3e4);

	let series: [Series, Series] = [
		{
			data, name: framework.title,
			type: "scatter",
			itemStyle: { color: framework.color }
		},
		{
			name: `${framework.title} fit`,
			type: "line",
			smooth: true,
			data: generateLine(metric, framework.name),
			symbolSize: 0.1,
			itemStyle: { color: framework.color }
		}
	];

	return series;
}
