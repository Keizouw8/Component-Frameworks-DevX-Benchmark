import { frameworks } from "./frameworks";

import radixEconomy from "./analyses/radix";
import halsteadEffort from "./analyses/effort";
import halsteadVolume from "./analyses/volume";
import shannonEntropy from "./analyses/entropy";

const results: Results = { react: [], solid: [] };

for (let framework of Object.values(frameworks)) {
	let glob = new Bun.Glob(`**/*.{${framework.extensions.join()}}`);
	let files = await Array.fromAsync(glob.scan(`./codebases/${framework.name}/`));
	
	console.log(`Analyzing ${framework.title}`);
	
	for await (let file of files) {
		let content = await Bun.file(`./codebases/${framework.name}/${file}`).text();
		
		try { var program = framework.parser(content); } catch { continue; }

		let volume = halsteadVolume(program);
		let radix = radixEconomy(program);
		let effort = halsteadEffort(program, framework.operands);
		let entropy = shannonEntropy(program);

		results[framework.name].push({ volume, radix, effort, entropy });
	}
}

Bun.file("./out/results.json").write(JSON.stringify(results, null, 4));