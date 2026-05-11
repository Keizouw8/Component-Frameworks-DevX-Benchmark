import { frameworks } from "../frameworks";

const BATCH_SIZE = 10;

let amount: number = 1;
let files: string[];
let framework: Framework;

onmessage = function (e: MessageEvent<{ event: "init" | "analyze", data: FrameworkName }>) {
	if (e.data.event == "init") return initialize(e.data.data);
	if (e.data.event == "analyze") return analyze();
}

async function analyze() {
	let count = 0;
	
	while(files.length){
		let results: Result[] = [];
		let batch = files.splice(0, BATCH_SIZE).map(file => new Promise<void>(function (resolve) {
			let worker = new Worker("./workers/analyzeFile.ts");
			
			let timeout = setTimeout(function () {
				worker.terminate();
				postMessage({ event: "amount", data: --amount });
				resolve();
			}, 10000);
			
			worker.onerror = function (e: ErrorEvent) {
				clearTimeout(timeout);
				console.error(e);
				postMessage({ event: "amount", data: --amount });
				resolve();
			};
			
			worker.onmessage = function (e: MessageEvent<Result | false>) {
				clearTimeout(timeout);
				if (!e.data) postMessage({ event: "amount", data: --amount });
				else {
					results.push(e.data);
					postMessage({ event: "count", data: ++count });
				}
				resolve();
			};
			
			worker.postMessage({ frameworkName: framework.name, file });
		}));
		await Promise.all(batch);
		postMessage({ event: "batch", data: results });
	}

	postMessage({ event: "done" });
	process.exit();
}

function initialize(frameworkName: FrameworkName) {
	framework = frameworks[frameworkName];
	
	let glob = new Bun.Glob(`**/*.{${framework.extensions.join()}}`);
	files = Array.from(glob.scanSync(`./codebases/${framework.name}/`));
	
	amount = files.length;
	postMessage({ event: "amount", data: amount, first: true });
}