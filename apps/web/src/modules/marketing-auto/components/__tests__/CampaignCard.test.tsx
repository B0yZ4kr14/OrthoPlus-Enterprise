import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CampaignCard } from "../../ui/components/CampaignCard";
import { Campaign } from "../../domain/entities/Campaign";
import { MessageTemplate } from "../../domain/valueObjects/MessageTemplate";

const mockOnActivate = vi.fn();
const mockOnPause = vi.fn();
const mockOnComplete = vi.fn();
const mockOnViewDetails = vi.fn();

// Mock UI components from @orthoplus/core-ui
vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardFooter: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children, className }: any) => (
    <h3 className={className}>{children}</h3>
  ),
}));

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant}>{children}</span>
  ),
}));

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, variant, size, ...props }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

function createMockCampaign(overrides: any = {}): Campaign {
  return new Campaign({
    id: "c1",
    clinicId: "clinic-1",
    name: "Campanha Teste",
    description: "Descrição teste",
    type: "RECALL",
    status: "RASCUNHO",
    messageTemplate: new MessageTemplate("Olá {{nome}}"),
    createdBy: "user-1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  });
}

describe("CampaignCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render campaign info", () => {
    const campaign = createMockCampaign();

    render(
      <CampaignCard
        campaign={campaign}
        onActivate={mockOnActivate}
        onPause={mockOnPause}
        onComplete={mockOnComplete}
        onViewDetails={mockOnViewDetails}
      />,
    );

    expect(screen.getByText("Campanha Teste")).toBeTruthy();
    expect(screen.getByText("Descrição teste")).toBeTruthy();
    expect(screen.getByText("Recall")).toBeTruthy();
    expect(screen.getByText("Rascunho")).toBeTruthy();
  });

  it("should render metrics when available", () => {
    const campaign = createMockCampaign({
      status: "ATIVA",
      metrics: {
        totalSent: 100,
        totalDelivered: 95,
        totalOpened: 50,
        totalClicked: 20,
        totalConverted: 5,
        totalErrors: 5,
      },
    });

    render(
      <CampaignCard
        campaign={campaign}
        onActivate={mockOnActivate}
        onPause={mockOnPause}
        onComplete={mockOnComplete}
        onViewDetails={mockOnViewDetails}
      />,
    );

    expect(screen.getByText("100")).toBeTruthy();
    expect(screen.getByText("50")).toBeTruthy();
    expect(screen.getByText("50.0%")).toBeTruthy();
    expect(screen.getByText("Enviados")).toBeTruthy();
    expect(screen.getByText("Abertos")).toBeTruthy();
    expect(screen.getByText("Taxa Abertura")).toBeTruthy();
  });

  it("should render scheduled date when available", () => {
    const campaign = createMockCampaign({
      scheduledDate: new Date("2024-06-15T10:00:00"),
    });

    render(
      <CampaignCard
        campaign={campaign}
        onActivate={mockOnActivate}
        onPause={mockOnPause}
        onComplete={mockOnComplete}
        onViewDetails={mockOnViewDetails}
      />,
    );

    expect(screen.getByText(/Agendado:/)).toBeTruthy();
    expect(screen.getByText(/15\/06\/2024/)).toBeTruthy();
  });

  it("should render start and end dates when available", () => {
    const campaign = createMockCampaign({
      status: "CONCLUIDA",
      startDate: new Date("2024-01-10T08:00:00"),
      endDate: new Date("2024-01-20T18:00:00"),
    });

    render(
      <CampaignCard
        campaign={campaign}
        onActivate={mockOnActivate}
        onPause={mockOnPause}
        onComplete={mockOnComplete}
        onViewDetails={mockOnViewDetails}
      />,
    );

    expect(screen.getByText(/Iniciado:/)).toBeTruthy();
    expect(screen.getByText(/Finalizado:/)).toBeTruthy();
  });

  it("should call onViewDetails when clicking Detalhes", () => {
    const campaign = createMockCampaign();

    render(
      <CampaignCard
        campaign={campaign}
        onActivate={mockOnActivate}
        onPause={mockOnPause}
        onComplete={mockOnComplete}
        onViewDetails={mockOnViewDetails}
      />,
    );

    const detailsButton = screen.getByText("Detalhes");
    act(() => {
      detailsButton.click();
    });

    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it("should show Ativar button for RASCUNHO campaign and call onActivate", () => {
    const campaign = createMockCampaign({ status: "RASCUNHO" });

    render(
      <CampaignCard
        campaign={campaign}
        onActivate={mockOnActivate}
        onPause={mockOnPause}
        onComplete={mockOnComplete}
        onViewDetails={mockOnViewDetails}
      />,
    );

    const activateButton = screen.getByText("Ativar");
    act(() => {
      activateButton.click();
    });

    expect(mockOnActivate).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Pausar")).toBeNull();
    expect(screen.queryByText("Concluir")).toBeNull();
  });

  it("should show Pausar and Concluir buttons for ATIVA campaign", () => {
    const campaign = createMockCampaign({ status: "ATIVA" });

    render(
      <CampaignCard
        campaign={campaign}
        onActivate={mockOnActivate}
        onPause={mockOnPause}
        onComplete={mockOnComplete}
        onViewDetails={mockOnViewDetails}
      />,
    );

    const pauseButton = screen.getByText("Pausar");
    const completeButton = screen.getByText("Concluir");

    act(() => {
      pauseButton.click();
    });
    expect(mockOnPause).toHaveBeenCalledTimes(1);

    act(() => {
      completeButton.click();
    });
    expect(mockOnComplete).toHaveBeenCalledTimes(1);

    expect(screen.queryByText("Ativar")).toBeNull();
  });

  it("should show Ativar and Concluir buttons for PAUSADA campaign", () => {
    const campaign = createMockCampaign({ status: "PAUSADA" });

    render(
      <CampaignCard
        campaign={campaign}
        onActivate={mockOnActivate}
        onPause={mockOnPause}
        onComplete={mockOnComplete}
        onViewDetails={mockOnViewDetails}
      />,
    );

    expect(screen.getByText("Ativar")).toBeTruthy();
    expect(screen.getByText("Concluir")).toBeTruthy();
    expect(screen.queryByText("Pausar")).toBeNull();
  });

  it("should not show action buttons for CONCLUIDA campaign", () => {
    const campaign = createMockCampaign({ status: "CONCLUIDA" });

    render(
      <CampaignCard
        campaign={campaign}
        onActivate={mockOnActivate}
        onPause={mockOnPause}
        onComplete={mockOnComplete}
        onViewDetails={mockOnViewDetails}
      />,
    );

    expect(screen.queryByText("Ativar")).toBeNull();
    expect(screen.queryByText("Pausar")).toBeNull();
    expect(screen.queryByText("Concluir")).toBeNull();
  });

  it("should render different campaign types correctly", () => {
    const types = [
      { type: "RECALL", label: "Recall" },
      { type: "POS_CONSULTA", label: "Pós-Consulta" },
      { type: "ANIVERSARIO", label: "Aniversário" },
      { type: "SEGMENTADA", label: "Segmentada" },
    ];

    types.forEach(({ type, label }) => {
      vi.clearAllMocks();
      const campaign = createMockCampaign({ type });

      const { unmount } = render(
        <CampaignCard
          campaign={campaign}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onComplete={mockOnComplete}
          onViewDetails={mockOnViewDetails}
        />,
      );

      expect(screen.getByText(label)).toBeTruthy();
      unmount();
    });
  });

  it("should render different campaign statuses correctly", () => {
    const statuses = [
      { status: "RASCUNHO", label: "Rascunho" },
      { status: "ATIVA", label: "Ativa" },
      { status: "PAUSADA", label: "Pausada" },
      { status: "CONCLUIDA", label: "Concluída" },
    ];

    statuses.forEach(({ status, label }) => {
      vi.clearAllMocks();
      const campaign = createMockCampaign({ status });

      const { unmount } = render(
        <CampaignCard
          campaign={campaign}
          onActivate={mockOnActivate}
          onPause={mockOnPause}
          onComplete={mockOnComplete}
          onViewDetails={mockOnViewDetails}
        />,
      );

      expect(screen.getByText(label)).toBeTruthy();
      unmount();
    });
  });
});
