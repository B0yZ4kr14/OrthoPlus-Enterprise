// cspell:disable
export const TOUR_COMPLETED_KEY = "ortho_plus_tour_completed";

export const TOUR_LOCALE = {
  back: "Voltar",
  close: "Fechar",
  last: "Finalizar",
  next: "Próximo",
  skip: "Pular",
};

export const TOUR_STYLES = {
  options: {
    primaryColor: "hsl(var(--primary))",
    backgroundColor: "hsl(var(--card))",
    textColor: "hsl(var(--card-foreground))",
    overlayColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10000,
    arrowColor: "hsl(var(--card))",
    width: 320,
  },
  buttonNext: {
    backgroundColor: "hsl(var(--primary))",
    color: "hsl(var(--primary-foreground))",
    borderRadius: "0.375rem",
    padding: "0.375rem 1rem",
    fontSize: "0.8125rem",
    fontWeight: "500",
  },
  buttonBack: {
    color: "hsl(var(--muted-foreground))",
    marginRight: "0.5rem",
    fontSize: "0.8125rem",
  },
  buttonSkip: {
    color: "hsl(var(--muted-foreground))",
    fontSize: "0.8125rem",
  },
  buttonClose: {
    color: "hsl(var(--muted-foreground))",
    fontSize: "1.25rem",
    padding: "0.25rem",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    borderRadius: "0.5rem",
    padding: "1rem",
    fontSize: "0.8125rem",
    maxWidth: "320px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  tooltipContent: {
    padding: "0.25rem 0",
  },
  tooltipTitle: {
    fontSize: "0.9375rem",
    marginBottom: "0.5rem",
  },
  spotlight: {
    borderRadius: "0.5rem",
  },
};
