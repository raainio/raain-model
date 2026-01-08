export class Tools {
    // Calculates min and max from an array of numbers, filtering out null/undefined
    static calculateMinMax(
        values: Array<number | null | undefined>
    ): {min: number; max: number} | null {
        if (!values || values.length === 0) {
            return null;
        }

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
}
