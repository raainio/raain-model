import {expect} from 'chai';
import {
    CartesianGaugeHistory,
    CartesianRainHistory,
    CartesianValue,
    PositionHistory,
} from '../../src';

describe('Quality History models', () => {
    it('CartesianGaugeHistory should set date and expose fields', () => {
        const h = new CartesianGaugeHistory({
            gaugeId: 'g1',
            gaugeLabel: 'Gauge',
            date: '2020-01-01T00:00:00Z' as any,
            value: new CartesianValue({lat: 1, lng: 2, value: 3}),
            configurationAsJSON: '{"a":1}',
        } as any);
        expect(h.gaugeId).eq('g1');
        expect(h.gaugeLabel).eq('Gauge');
        expect(h.date).to.be.instanceOf(Date);
        expect(h.value.lat).eq(1);
    });

    it('CartesianRainHistory should parse date', () => {
        const h = new CartesianRainHistory({
            date: '2020-01-02T00:00:00Z' as any,
            computedValue: new CartesianValue({lat: 0, lng: 0, value: 0}),
        } as any);
        expect(h.date).to.be.instanceOf(Date);
    });

    it('PositionHistory should keep optional fields', () => {
        const h = new PositionHistory({
            id: 'p1',
            label: 'Pos',
            date: '2020-03-03' as any,
            x: 1,
            y: 2,
            value: 5,
            valueFromGauge: 10,
            valueFromRain: 12,
            configurationAsJSON: '{"x":1}',
        } as any);
        expect(h.id).eq('p1');
        expect(h.valueFromGauge).eq(10);
        expect(h.valueFromRain).eq(12);
        expect(h.date).to.be.instanceOf(Date);
    });
});
