import { frameworks } from "../frameworks";

import radixEconomy from "../analyses/radix";
import halsteadEffort from "../analyses/effort";
import halsteadVolume from "../analyses/volume";
import shannonEntropy from "../analyses/entropy";

onmessage = async function (e: MessageEvent<{ frameworkName: FrameworkName, file: string }>) {
	let framework = frameworks[e.data.frameworkName];
	let content = await Bun.file(`./codebases/${framework.name}/${e.data.file}`).text();
	
	try {
		var program = framework.parser(content);
	} catch {
		postMessage(false);
		return;
	}

	let volume = halsteadVolume(program);
	let radix = radixEconomy(program);
	let effort = halsteadEffort(program, framework.operators);
	let entropy = shannonEntropy(program);

	postMessage({ volume, radix, effort, entropy });
}