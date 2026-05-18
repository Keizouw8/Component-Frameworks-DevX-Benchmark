export default function zipfDistribution({ tokens, unique }: Program) {
	let dist = unique.map(u => tokens.filter(t => u == t).length).sort((a, b) => b - a);
	return getR2Zipf(dist);
}

function getR2Zipf(frequencies: number[]) {
    const sortedFreqs = [...frequencies].sort((a, b) => b - a);

    const n = sortedFreqs.length;
    const x = [];
    const y = [];

    for (let i = 0; i < n; i++) {
        x.push(Math.log(i + 1));
        y.push(Math.log(sortedFreqs[i]));
    }

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
        sumY2 += y[i] * y[i];
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = numerator / denominator;

    return r * r;
}
