import { Glob } from "bun";

import radixEconomy from "./analyses/radix";

import jsxParser from "./parsers/jsx";

const frameworks: Framework[] = [
	{
		name: "react",
		extensions: ["jsx", "tsx"],
		parser: jsxParser
	},
	{
		name: "solid",
		extensions: ["jsx", "tsx"],
		parser: jsxParser
	}
];

for (let framework of frameworks) {
	console.log(`Analyzing ${framework.name}`);
	
	let glob = new Glob(`**/*.{${framework.extensions.join()}}`);
	let results: Result[] = [];
	
	for await (let file of glob.scan(`./codebases/${framework.name}/`)) {
		let content = await Bun.file(`./codebases/${framework.name}/${file}`).text();
		
		try { var program = framework.parser(content); } catch { continue; }

		let radix = radixEconomy(program);

		results.push({ radix });
	}
}
