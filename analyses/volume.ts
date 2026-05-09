export default function halsteadVolume({ tokens: { length: N }, unique: { length: n } }: Program): number {
	if (n == 1) return N;
	return N * Math.log2(n);
}