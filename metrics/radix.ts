export default function radixEconomy({ tokens: { length: n }, unique: { length: b } }: Program): number {
	if (b == 1) return n;
	return b * Math.floor(Math.log2(n) / Math.log2(b) + 1);
}