import angularParser, { angularOperators } from "./parsers/angular";
import reactParser, { reactOperators } from "./parsers/react";
import solidParser, { solidOperators } from "./parsers/solid";
import svelteParser, { svelteOperators } from "./parsers/svelte";
import vueParser, { vueOperators } from "./parsers/vue";

export const frameworks: { [key in FrameworkName]: Framework } = {
	react: {
		name: "react",
		title: "React",
		extensions: ["jsx", "tsx"],
		operators: reactOperators,
		parser: reactParser,
		color: "rgb(88, 196, 220)"
	},
	solid: {
		name: "solid",
		title: "SolidJS",
		extensions: ["jsx", "tsx"],
		operators: solidOperators,
		parser: solidParser,
		color: "rgb(34, 34, 34)"
	},
	svelte: {
		name: "svelte",
		title: "Svelte",
		extensions: ["svelte"],
		operators: svelteOperators,
		parser: svelteParser,
		color: "rgb(249, 103, 67)"
	},
	vue: {
		name: "vue",
		title: "Vue.js",
		extensions: ["vue"],
		operators: vueOperators,
		parser: vueParser,
		color: "rgb(66, 185, 131)"
	},
	angular: {
		name: "angular",
		title: "Angular",
		extensions: ["ts", "html"],
		operators: angularOperators,
		parser: angularParser,
		color: "rgb(195 0 47)"
	}
};