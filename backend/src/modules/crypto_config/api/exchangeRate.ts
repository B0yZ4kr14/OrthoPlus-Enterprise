const FALLBACK_RATES: Record<string, number> = {
  BTC: 500000,
  ETH: 25000,
  USDT: 5.8,
  BNB: 3000,
  DEFAULT: 5.5,
};

export async function fetchExchangeRateBRL(coin: string): Promise<number> {
  const normalizedCoin = coin?.toUpperCase?.() ?? "";
  const exchangeUrl =
    process.env.CRYPTO_EXCHANGE_API ||
    "https://api.binance.com/api/v3/ticker/price";

  if (!normalizedCoin) {
    return FALLBACK_RATES.DEFAULT;
  }

  try {
    const response = await fetch(
      `${exchangeUrl}?symbol=${normalizedCoin}BRL`,
    );

    if (response.ok) {
      const payload = (await response.json()) as { price?: string };
      const parsedPrice = Number(payload.price);

      if (Number.isFinite(parsedPrice)) {
        return parsedPrice;
      }
    }
  } catch (error) {
    console.warn(
      `[crypto] Failed to fetch live exchange rate for ${normalizedCoin}, using fallback.`,
      error,
    );
  }

  return FALLBACK_RATES[normalizedCoin] ?? FALLBACK_RATES.DEFAULT;
}
