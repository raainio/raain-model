export enum QualityIndicatorMethod {
    // Average absolute difference (rain - gauge)
    // Range: 0 to ∞, Perfect: 0
    DELTA = 'delta',

    // Average of min/max ratio
    // Range: 0 to 1, Perfect: 1
    RATIO = 'ratio',

    // Percentage of points meeting quality threshold
    // Range: 0 to 100, Perfect: 100
    SUCCESS_RATE = 'success_rate',

    // Root Mean Square Error - penalizes large errors
    // Range: 0 to ∞, Perfect: 0
    RMSE = 'rmse',

    // Mean Absolute Percentage Error
    // Range: 0 to 100+, Perfect: 0
    MAPE = 'mape',

    // Nash-Sutcliffe Efficiency - hydrology standard
    // Range: -∞ to 1, Perfect: 1
    // 0 = model equals mean prediction, <0 = worse than mean
    NASH_SUTCLIFFE = 'nash_sutcliffe',
}

export interface QualityIndicatorOptions {
    method?: QualityIndicatorMethod;
    // For SUCCESS_RATE: minimum ratio to consider "successful" (default: 0.8)
    successThreshold?: number;
}

export interface QualityNormalizationOptions {
    // Reference max value for DELTA normalization (default: 10 mm/h)
    deltaMaxRef?: number;
    // Reference max value for RMSE normalization (default: 10 mm/h)
    rmseMaxRef?: number;
    // Reference max value for MAPE normalization (default: 100%)
    mapeMaxRef?: number;
    // Minimum value for NASH_SUTCLIFFE clamping (default: 0)
    nashSutcliffeMinClamp?: number;
}

// Default reference values for normalization (rainfall domain)
export const QUALITY_NORMALIZATION_DEFAULTS = {
    DELTA_MAX_REF: 10, // 10 mm/h is considered maximum acceptable error
    RMSE_MAX_REF: 10, // 10 mm/h RMSE is considered maximum acceptable
    MAPE_MAX_REF: 100, // 100% error is considered maximum
    NASH_SUTCLIFFE_MIN_CLAMP: 0, // Values below 0 are clamped (worse than mean)
};
