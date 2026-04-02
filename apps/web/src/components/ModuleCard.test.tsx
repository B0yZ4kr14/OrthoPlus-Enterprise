import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ModuleCard } from "./ModuleCard";
import { FileText } from "lucide-react";

describe("ModuleCard", () => {
  const mockOnClick = vi.fn();

  it("should render module information correctly", () => {
    const { getByText } = render(
      <ModuleCard
        title="Módulo Teste"
        subtitle="Descrição do módulo"
        icon={FileText}
        color="bg-primary"
        onClick={mockOnClick}
      />,
    );

    expect(getByText("Módulo Teste")).toBeInTheDocument();
    expect(getByText("Descrição do módulo")).toBeInTheDocument();
  });

  it("should call onClick when card is clicked", () => {
    const handleClick = vi.fn();

    const { container } = render(
      <ModuleCard
        title="Módulo Teste"
        subtitle="Descrição"
        icon={FileText}
        color="bg-primary"
        onClick={handleClick}
      />,
    );

    const card = container.firstChild as HTMLElement;
    card.click();

    expect(handleClick).toHaveBeenCalled();
  });

  it("should apply custom color class", () => {
    const { container } = render(
      <ModuleCard
        title="Módulo Teste"
        subtitle="Descrição"
        icon={FileText}
        color="bg-blue-500"
        onClick={mockOnClick}
      />,
    );

    const colorDiv = container.querySelector(".bg-blue-500");
    expect(colorDiv).toBeInTheDocument();
  });

  it("should render icon component", () => {
    const { container } = render(
      <ModuleCard
        title="Módulo Teste"
        subtitle="Descrição"
        icon={FileText}
        color="bg-primary"
        onClick={mockOnClick}
      />,
    );

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
