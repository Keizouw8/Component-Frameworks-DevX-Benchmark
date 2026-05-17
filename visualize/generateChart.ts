import * as echarts from "echarts";
import { transform } from "echarts-stat";
import { createCanvas } from "canvas";

echarts.registerTransform(transform.regression);
echarts.setPlatformAPI({
	createCanvas() {
		return createCanvas(100, 100) as any;
	}
});

interface ChartOptions{
	title: string;
	x: string;
	y: string;
}

export default async function generateChart(out: string, series: Series[], options: ChartOptions) {
	const canvas = createCanvas(800, 600);
	const chart = echarts.init(canvas as any);

	chart.setOption({
		series,
		backgroundColor: "white",
		title: {
			text: options.title,
			left: "center"
		},
		legend: {
			top: 30,
			data: series.map(s => s.name).filter(s => !s.includes("fit"))
		},
		grid: {
			containLabel: true
		},
		xAxis: {
			name: options.x,
			nameLocation: "middle",
			nameGap: 30,
			type: "value", 
			min: 0
		},
		yAxis: {
			name: options.y,
			nameLocation: "middle",
			nameGap: 50,
			type: "value",
			min: 0,
			max: Math.max(...series.filter(d => !d.name.includes("fit")).flatMap(d => d.data).map(d => d[1]))
		}
	});

	const buffer = canvas.toBuffer("image/png");
	await Bun.write(out, buffer);
	chart.dispose();
}
