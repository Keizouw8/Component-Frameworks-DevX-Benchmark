import { MultiBar } from "cli-progress";
import { frameworks } from "./frameworks";

const results: Results = { react: [], solid: [] };

const multibar = new MultiBar({
	clearOnComplete: false,
    hideCursor: true,
    format: " {bar} | {framework} | {value}/{total}"
});

let promises = Object.keys(frameworks).map(framework => new Promise<void>(function (resolve) {
	let bar = multibar.create(1, 0, { framework: frameworks[framework as FrameworkName].title });
	let worker = new Worker("./workers/analyzeFramework.ts");
	
	worker.onerror = console.error;
	worker.onmessage = function (e: MessageEvent<{ event: string, data: any, first?: true }>) {
		if (e.data.first) worker.postMessage({ event: "analyze" });
		if (e.data.event == "amount") return bar.setTotal(e.data.data);
		if (e.data.event == "count") return bar.update(e.data.data);
		if (e.data.event == "batch") return results[framework as FrameworkName].push(...e.data.data);
		worker.terminate();
		resolve();
	};

	worker.postMessage({ event: "init", data: framework });
}));

await Promise.all(promises);
multibar.stop();
Bun.file("./out/results.json").write(JSON.stringify(results, null, 4));