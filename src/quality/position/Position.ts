export class Position {
    static DEFAULT_PRECISION = 6;
    public x: number;
    public y: number;
    private readonly precision: number;

    constructor(json: {
        x: number,
        y: number
    }) {
        this.x = json.x;
        this.y = json.y;
        this.precision = Position.DEFAULT_PRECISION;
    }

    static uniq = (a: Position[]): Position[] => {
        const set = [];
        for (const p of a) {
            const same = set.filter(s => s.x === p.x && s.y === p.y);
            if (same.length <= 0) {
                set.push(p);
            }
        }
        return set;
    }

    setPrecision(precision: number = Position.DEFAULT_PRECISION) {
        const tenPower = Math.pow(10, precision);
        const xy = this.getXY(precision);
        this.x = xy.x;
        this.y = xy.y;
    }

    getXY(precision?: number): { x: number, y: number } {
        if (typeof precision === 'undefined') {
            return {x: this.x, y: this.y};
        }

        const tenPower = Math.pow(10, precision);
        return {
            x: Math.round(this.x * tenPower) / tenPower,
            y: Math.round(this.y * tenPower) / tenPower,
        };
    }

    samePosition(p: Position, precision?: number) {
        const xy = this.getXY(precision);
        return xy.x === p.x && xy.y === p.y;
    }

    getPrecision(): number {
        return this.precision;
    }

    getXYScaled(scale: number): { x: number, y: number } {
        const precision = Math.round(Math.log10(1 / scale));
        return this.getXY(precision);
    }
}
