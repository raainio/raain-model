/**
 * Quality indicator methods for comparing radar rain predictions against gauge observations.
 *
 * Each method quantifies prediction quality differently. All methods can be normalized
 * to a 0-100 scale (0=worst, 100=best) via {@link SpeedMatrix.NormalizeQualityIndicator}.
 *
 * Default method: {@link KLING_GUPTA}
 */
export enum QualityIndicatorMethod {
    /**
     * Average absolute difference between rain prediction and gauge observation.
     *
     * Formula: `mean(|rain - gauge|)`
     *
     * - Range: 0 to +Infinity
     * - Perfect score: 0
     * - Normalized: inverted using reference max (default 10 mm/h)
     */
    DELTA = 'delta',

    /**
     * Average of min/max ratio between rain and gauge values.
     *
     * Formula: `mean(min(rain, gauge) / max(rain, gauge))`
     *
     * - Range: 0 to 1
     * - Perfect score: 1
     * - Handles both over- and under-prediction symmetrically
     * - Skips points where both values are zero
     */
    RATIO = 'ratio',

    /**
     * Percentage of points where the min/max ratio meets a quality threshold.
     *
     * Formula: `count(ratio >= threshold) / total * 100`
     *
     * - Range: 0 to 100
     * - Perfect score: 100
     * - Default threshold: 0.8 (configurable via `successThreshold`)
     * - Both-zero points count as successful (correct "no rain" prediction)
     */
    SUCCESS_RATE = 'success_rate',

    /**
     * Root Mean Square Error — penalizes large errors more than small ones.
     *
     * Formula: `sqrt(mean((rain - gauge)^2))`
     *
     * - Range: 0 to +Infinity
     * - Perfect score: 0
     * - More sensitive to outliers than DELTA
     * - Normalized: inverted using reference max (default 10 mm/h)
     */
    RMSE = 'rmse',

    /**
     * Mean Absolute Percentage Error — error relative to observed value.
     *
     * Formula: `mean(|rain - gauge| / gauge) * 100`
     *
     * - Range: 0 to +Infinity (commonly 0-100+)
     * - Perfect score: 0
     * - Skips zero gauge values to avoid division by zero
     * - Normalized: inverted using reference max (default 100%)
     */
    MAPE = 'mape',

    /**
     * Nash-Sutcliffe Efficiency — hydrology standard comparing prediction to mean observation.
     *
     * Formula: `1 - sum((rain - gauge)^2) / sum((gauge - meanGauge)^2)`
     *
     * - Range: -Infinity to 1
     * - Perfect score: 1
     * - 0 means model is as good as predicting the mean
     * - Negative values mean model is worse than predicting the mean
     *
     * @see {@link KLING_GUPTA} for an improved alternative that decomposes performance
     */
    NASH_SUTCLIFFE = 'nash_sutcliffe',

    /**
     * Kling-Gupta Efficiency — decomposes performance into correlation, variability bias, and volume bias.
     *
     * Formula: `1 - sqrt((r - 1)^2 + (alpha - 1)^2 + (beta - 1)^2)`
     *
     * Where:
     * - `r` = Pearson correlation coefficient (timing/pattern accuracy)
     * - `alpha` = stdDev(rain) / stdDev(gauge) (variability ratio)
     * - `beta` = mean(rain) / mean(gauge) (volume bias ratio)
     *
     * - Range: -Infinity to 1
     * - Perfect score: 1 (r=1, alpha=1, beta=1)
     * - Stricter than NSE on systematic bias
     * - KGE > -0.41 is considered better than mean prediction
     *
     * This is the **default** quality indicator method.
     *
     * @see Gupta et al. (2009) "Decomposition of the mean squared error and NSE performance criteria"
     */
    KLING_GUPTA = 'kling_gupta',
}

/**
 * Options for computing a quality indicator.
 */
export interface QualityIndicatorOptions {
    /** Quality indicator method to use. Default: {@link QualityIndicatorMethod.KLING_GUPTA} */
    method?: QualityIndicatorMethod;
    /** For SUCCESS_RATE: minimum ratio to consider "successful" (default: 0.8) */
    successThreshold?: number;
    /** If true, normalizes result to 0-1 scale (0=bad, 1=best). Default: true */
    normalize?: boolean;
    /** Options for normalization (reference max values, clamping, scale) */
    normalizationOptions?: QualityNormalizationOptions;
}

/**
 * Options for normalizing raw quality indicator values to a common scale.
 */
export interface QualityNormalizationOptions {
    /** Reference max value for DELTA normalization (default: 10 mm/h) */
    deltaMaxRef?: number;
    /** Reference max value for RMSE normalization (default: 10 mm/h) */
    rmseMaxRef?: number;
    /** Reference max value for MAPE normalization (default: 100%) */
    mapeMaxRef?: number;
    /** Floor value when normalizing NASH_SUTCLIFFE: raw values below this are clamped before scaling (default: 0) */
    nashSutcliffeMinClamp?: number;
    /** Floor value when normalizing KLING_GUPTA: raw values below this are clamped before scaling (default: 0) */
    kgeMinClamp?: number;
    /** Scale for normalized output: 1 for 0-1, 100 for 0-100 (default: 1) */
    normalizeScale?: number;
}

/**
 * Default reference values for normalization in the rainfall domain.
 */
export const QUALITY_NORMALIZATION_DEFAULTS = {
    /** 10 mm/h is considered maximum acceptable error */
    DELTA_MAX_REF: 10,
    /** 10 mm/h RMSE is considered maximum acceptable */
    RMSE_MAX_REF: 10,
    /** 100% error is considered maximum */
    MAPE_MAX_REF: 100,
    /** NSE raw values below 0 are clamped to 0 during normalization */
    NASH_SUTCLIFFE_MIN_CLAMP: 0,
    /** KGE raw values below 0 are clamped to 0 during normalization */
    KGE_MIN_CLAMP: 0,
};
