import { Glob } from "bun";

import radixEconomy from "./analyses/radix";
import halsteadEffort from "./analyses/effort";
import halsteadVolume from "./analyses/volume";

import reactParser, { jsxOperands } from "./parsers/react";
import solidParser from "./parsers/solid";

const frameworks: Framework[] = [
	{
		name: "react",
		extensions: ["jsx", "tsx"],
		operands: jsxOperands,
		parser: reactParser
	},
	{
		name: "solid",
		extensions: ["jsx", "tsx"],
		operands: jsxOperands,
		parser: solidParser
	}
];

for (let framework of frameworks) {
	console.log(`Analyzing ${framework.name}`);
	
	let glob = new Glob(`**/*.{${framework.extensions.join()}}`);
	let results: Result[] = [];
	
	for await (let file of glob.scan(`./codebases/${framework.name}/`)) {
		let content = await Bun.file(`./codebases/${framework.name}/${file}`).text();
		
		try { var program = framework.parser(content); } catch { continue; }

		let volume = halsteadVolume(program);
		let radix = radixEconomy(program);
		let effort = halsteadEffort(program, framework.operands);

		results.push({ volume, radix, effort });
		
		break;
	}

	console.log(results);
}
