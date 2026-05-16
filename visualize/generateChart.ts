import * as echarts from "echarts";

interface ChartOptions{
	title: string;
	x: string;
	y: string;
}

export default async function generateChart(out: string, datasets: Dataset[], options: ChartOptions) {
	const chart = echarts.init(null, null, {
		renderer: "svg",
		ssr: true,
		width: 800,
		height: 600
	});

	let series = datasets.map(({ name, data, color }) => ({
		name, data,
		itemStyle: { color },
		type: "scatter"
	}));

	chart.setOption({
		backgroundColor: "white",
		title: {
			text: options.title,
			left: "center"
		},
		legend: {
			top: 30
		},
		grid: {
			containLabel: true
		},
		xAxis: {
			name: options.x,
			nameLocation: "middle",
			nameGap: 30,
			type: "value"
		},
		yAxis: {
			name: options.y,
			nameLocation: "middle",
			nameGap: 50,
			type: "value"
		},
		series: series as any
	});
	
	const svg = chart.renderToSVGString();
	await Bun.write(out, svg);
	chart.dispose();
}