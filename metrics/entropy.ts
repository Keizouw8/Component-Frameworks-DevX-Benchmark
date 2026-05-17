export default function shannonEntropy({ tokens }: Program): number {
	let sum = 0;
	
	for (let x of tokens) {
		let p = tokens.filter(token => token == x).length / tokens.length;
		sum -= p * Math.log2(p);
	}
	
	return sum;
}