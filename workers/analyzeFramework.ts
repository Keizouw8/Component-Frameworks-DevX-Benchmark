import { frameworks } from "../frameworks";

let amount: number = 1;
let files: string[];
let framework: Framework;

onmessage = function (e: MessageEvent<{ event: "init" | "analyze", data: FrameworkName }>) {
	if (e.data.event == "init") return initialize(e.data.data);
	if (e.data.event == "analyze") return analyze();
}

async function analyze() {
	let results: Result[] = [];
	let count = 0;

	let promises = files.map(file => new Promise<void>(function (resolve) {
		let worker = new Worker("./workers/analyzeFile.ts");
		
		worker.onmessage = function (e: MessageEvent<Result | false>) {
			if (!e.data) return postMessage({ event: "amount", data: --amount });
			results.push(e.data);
			postMessage({ event: "count", data: ++count });
			resolve();
		};
		
		worker.onerror = console.error;
		worker.postMessage({ frameworkName: framework.name, file });
	}));

	await Promise.all(promises);
	postMessage({ event: "results", data: results });
	process.exit();
}

function initialize(frameworkName: FrameworkName) {
	framework = frameworks[frameworkName];
	
	let glob = new Bun.Glob(`**/*.{${framework.extensions.join()}}`);
	files = Array.from(glob.scanSync(`./codebases/${framework.name}/`));
	
	amount = files.length;
	postMessage({ event: "amount", data: amount, first: true });
}