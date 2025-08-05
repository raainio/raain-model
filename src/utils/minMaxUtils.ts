/**
 * Calculates the minimum and maximum values from an array of numbers.
 * Filters out null and undefined values before calculation.
 *
 * @param values Array of numbers, possibly including null or undefined values
 * @returns Object with min and max properties, or null if there are no valid values
 */
export function calculateMinMax(
    values: Array<number | null | undefined>
): {min: number; max: number} | null {
    if (!values || values.length === 0) {
        return null;
    }

    // Filter out null and undefined values
    const filteredValues = values.filter((v) => v !== null && v !== undefined) as number[];

    if (filteredValues.length === 0) {
        return null;
    }

    let min = filteredValues[0];
    let max = filteredValues[0];

    for (let i = 1; i < filteredValues.length; i++) {
        const value = filteredValues[i];
        if (value < min) {
            min = value;
        }
        if (value > max) {
            max = value;
        }
    }

    return {
        min,
        max,
    };
}
