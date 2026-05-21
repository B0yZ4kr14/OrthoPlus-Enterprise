// cspell:disable

export function RecommendationAlert() {
  return (
    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
      <p className="text-sm text-warning">
        <strong>💡 Recomendação:</strong> Use modelos locais (self-hosted)
        para máxima privacidade de dados. Configure provedores externos
        apenas se necessário e com aprovação de compliance.
      </p>
    </div>
  );
}
