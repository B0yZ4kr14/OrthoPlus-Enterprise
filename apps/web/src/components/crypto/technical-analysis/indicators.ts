/**
 * Pure technical indicator calculation functions.
 * Extracted from AdvancedTechnicalAnalysis for reusability and testability.
 */

export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(prices[i]);
    } else {
      const sum = prices
        .slice(i - period + 1, i + 1)
        .reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }

  return sma;
}

export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      ema.push(prices[0]);
    } else {
      const value = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
      ema.push(value);
    }
  }

  return ema;
}

export function calculateRSI(prices: number[], period = 14): number[] {
  const rsi: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(50);
      continue;
    }

    let gains = 0;
    let losses = 0;

    for (let j = i - period + 1; j <= i; j++) {
      const change = prices[j] - prices[j - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsiValue = 100 - 100 / (1 + rs);

    rsi.push(rsiValue);
  }

  return rsi;
}

export interface MACDResult {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
}

export function calculateMACD(prices: number[]): MACDResult {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12.map((val, i) => val - ema26[i]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((val, i) => val - signalLine[i]);

  return { macdLine, signalLine, histogram };
}

export interface BollingerBandsResult {
  sma: number[];
  upperBand: number[];
  lowerBand: number[];
}

export function calculateBollingerBands(
  prices: number[],
  period = 20,
  stdDev = 2,
): BollingerBandsResult {
  const sma = calculateSMA(prices, period);
  const upperBand: number[] = [];
  const lowerBand: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upperBand.push(prices[i]);
      lowerBand.push(prices[i]);
      continue;
    }

    const slice = prices.slice(i - period + 1, i + 1);
    const mean = sma[i];
    const variance =
      slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    upperBand.push(mean + standardDeviation * stdDev);
    lowerBand.push(mean - standardDeviation * stdDev);
  }

  return { sma, upperBand, lowerBand };
}
