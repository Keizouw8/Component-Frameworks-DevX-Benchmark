export default function radixEconomy({ total: n, unique: b }: Program): number {
	if (b == 1) return n;
	return b * Math.floor(Math.log(n) / Math.log(b) + 1);
}