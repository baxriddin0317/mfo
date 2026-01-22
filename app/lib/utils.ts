export const getValidRatingOrCount = (
	value: string | number,
	isCount = false
): string => {
	const num = +value;

	return num ? String(value) : isCount ? "100" : "4.5";
};

export function getExtremeValuesByKey<T extends object, K extends keyof T>(
	items: T[],
	key: K
): { min: number | null; max: number | null } {
	let min: number | null = null;
	let max: number | null = null;

	for (const item of items) {
		const value = item[key];

		if (value === undefined || value === null) continue;

		const num =
			typeof value === "number"
				? value
				: typeof value === "string"
				? parseFloat(value)
				: NaN;

		if (!isNaN(num)) {
			if (min === null || num < min) min = num;
			if (max === null || num > max) max = num;
		}
	}

	return { min, max };
}
