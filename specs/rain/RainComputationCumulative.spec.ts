import {expect} from 'chai';
import {
    CartesianValue,
    LatLng,
    RainCartesianMeasureValue,
    RainComputationCumulative,
} from '../../src';

describe('RainComputationCumulative', () => {
    function buildCumulative(): RainCartesianMeasureValue {
        const limitPoints: [LatLng, LatLng] = [
            new LatLng({lat: 0, lng: 0}),
            new LatLng({lat: 1, lng: 1}),
        ];
        const cartesianValues = [new CartesianValue({value: 10, lat: 0.5, lng: 0.5})];
        return new RainCartesianMeasureValue({
            cartesianValues,
            limitPoints,
            version: 'v1',
        });
    }

    it('should set cumulative and wrap it as RainCartesianMeasureValue', () => {
        const cumulative = buildCumulative();
        const rcc = new RainComputationCumulative({
            id: 'rc-cum-1',
            date: new Date(1720000000000),
            isReady: true,
            provider: 'test',
            timeStepInMinutes: 5,
            cumulative,
            version: '1.2.3',
        });

        // getter returns an instance with the same content
        expect(rcc.cumulative).to.be.instanceOf(RainCartesianMeasureValue);
        expect(rcc.cumulative.getVersion()).eq('v1');
        expect(rcc.cumulative.toJSON().limitPoints[0].lat).eq(0);
        expect(rcc.cumulative.toJSON().limitPoints[1].lng).eq(1);
    });

    it('toJSON should include results from cumulative', () => {
        const cumulative = buildCumulative();
        const rcc = new RainComputationCumulative({
            id: 'rc-cum-2',
            date: new Date(1720000000000),
            isReady: false,
            provider: 'test',
            timeStepInMinutes: 5,
            cumulative,
        });

        const json: any = rcc.toJSON();
        expect(json).to.have.property('id', 'rc-cum-2');
        expect(json).to.have.property('isReady', false);
        expect(json).to.have.property('cumulative');
        expect(json.cumulative).to.have.property('version', 'v1');
        expect(json.cumulative).to.have.property('cartesianValues');
    });

    it('getLinkType should be RainComputationCumulative.TYPE', () => {
        const rcc = new RainComputationCumulative({
            id: 'rc-cum-3',
            date: new Date(),
            isReady: false,
            provider: 'test',
            timeStepInMinutes: 5,
            cumulative: buildCumulative(),
        });
        const linkType = (rcc as any).getLinkType();
        expect(linkType).eq(RainComputationCumulative.TYPE);
    });
});
