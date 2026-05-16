import { frameworks } from "../frameworks";

const CONCURRENCY = 6;
const BATCH_SIZE = 50;

let amount: number = 1;
let files: string[];
let framework: Framework;

onmessage = function (e: MessageEvent<{ event: "init" | "analyze", data: FrameworkName }>) {
	if (e.data.event == "init") return initialize(e.data.data);
	if (e.data.event == "analyze") return analyze();
}

async function analyze() {
	let count = 0;
	let results: Result[] = [];
	
	await Promise.all(Array.from({ length: CONCURRENCY }).map(async () => {
		let worker = new Worker("./workers/analyzeFile.ts");
		
		while (files.length > 0) {
			let file = files.shift()!;
			
			let res = await new Promise<Result | false>((resolve) => {
				let timeout = setTimeout(function () {
					worker.terminate();
					worker = new Worker("./workers/analyzeFile.ts");
					resolve(false);
				}, 10000);
				
				worker.onerror = function (e: ErrorEvent) {
					clearTimeout(timeout);
					console.error(e);
					worker.terminate();
					worker = new Worker("./workers/analyzeFile.ts");
					resolve(false);
				};
				
				worker.onmessage = function (e: MessageEvent<Result | false>) {
					clearTimeout(timeout);
					resolve(e.data);
				};
				
				worker.postMessage({ frameworkName: framework.name, file });
			});
			
			if (!res) postMessage({ event: "amount", data: --amount });
			else {
				results.push(res);
				postMessage({ event: "count", data: ++count });
			}
			if (results.length >= BATCH_SIZE) postMessage({ event: "batch", data: results.splice(0, results.length) });
		}
		
		worker.terminate();
	}));

	if (results.length > 0) postMessage({ event: "batch", data: results });
	postMessage({ event: "done" });
}

function initialize(frameworkName: FrameworkName) {
	framework = frameworks[frameworkName];
	
	let glob = new Bun.Glob(`**/*.{${framework.extensions.join()}}`);
	files = Array.from(glob.scanSync(`./codebases/${framework.name}/`));
	
	amount = files.length;
	postMessage({ event: "amount", data: amount, first: true });
}