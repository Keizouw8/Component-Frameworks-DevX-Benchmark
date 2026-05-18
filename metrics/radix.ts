export default function radixEconomy({ tokens: { length: n }, unique: { length: b } }: Program): number {
	return b * n;
}