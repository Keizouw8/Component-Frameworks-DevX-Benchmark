import ChartJsImage from "chartjs-to-image";

interface ChartOptions{
	title: string;
	x: string;
	y: string;
}

export default async function generateChart(out: string, datasets: Dataset[], options: ChartOptions) {
	let chart = new ChartJsImage();
	chart.setChartJsVersion("4");
	
	chart.setConfig({
		type: "scatter",
		data: { datasets },
		options: {
			scales: {
				x: {
					title: {
						display: true,
						text: options.x
					}
				},
				y: {
					title: {
						display: true,
						text: options.y
					}
				}
			},
			plugins: {
				title: {
					display: true,
					text: options.title
				}
			}
		}
	});
	
	Bun.file(out).write(await chart.toBinary());
}