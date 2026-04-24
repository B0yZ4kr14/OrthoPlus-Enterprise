import { EXCHANGES } from "./types";

export function ExchangesList() {
  return (
    <div>
      <h4 className="font-semibold mb-3">Exchanges Suportadas</h4>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {EXCHANGES.map((exchange) => (
          <div
            key={exchange.name}
            className={`p-3 rounded-lg border text-center ${exchange.color}`}
          >
            <p className="text-sm font-semibold">{exchange.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
