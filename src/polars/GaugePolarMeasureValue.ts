import {IPolarMeasureValue} from './IPolarMeasureValue';
import {AbstractPolarMeasureValue} from './AbstractPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';

/**
 * Gauge with single polar value container
 */
export class GaugePolarMeasureValue extends AbstractPolarMeasureValue implements IPolarMeasureValue {

    constructor(
        polarOrObjectToCopy: string | PolarMeasureValue | AbstractPolarMeasureValue
    ) {
        super(polarOrObjectToCopy);
    }
}
