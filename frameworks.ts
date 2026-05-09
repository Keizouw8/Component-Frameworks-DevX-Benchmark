import reactParser, { jsxOperands } from "./parsers/react";
import solidParser from "./parsers/solid";

export const frameworks: { [key in FrameworkName]: Framework } = {
	react: {
		name: "react",
		title: "React",
		extensions: ["jsx", "tsx"],
		operands: jsxOperands,
		parser: reactParser,
		color: "rgb(88, 196, 220)"
	},
	solid: {
		name: "solid",
		title: "SolidJS",
		extensions: ["jsx", "tsx"],
		operands: jsxOperands,
		parser: solidParser,
		color: "rgb(34, 34, 34)"
	}
};