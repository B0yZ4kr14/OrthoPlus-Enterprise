import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ModuleCard } from "../ModuleCard";

const mockOnToggle = vi.fn();
const mockOnExpand = vi.fn();

// Mock UI components from @orthoplus/core-ui
vi.mock("@orthoplus/core-ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@orthoplus/core-ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock("@orthoplus/core-ui/switch", () => ({
  Switch: ({ checked, disabled, onCheckedChange }: any) => (
    <input
      data-testid="switch"
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onCheckedChange}
    />
  ),
}));

vi.mock("@orthoplus/core-ui/tooltip", () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipProvider: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children, asChild }: any) => <>{children}</>,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

vi.mock("@/components/modules/ModuleDependencyGraph", () => ({
  ModuleDependencyGraph: ({ modules, allModules }: any) => (
    <div data-testid="dependency-graph">Dependency Graph</div>
  ),
}));

const mockModule = {
  id: 1,
  module_key: "PACIENTES",
  name: "Pacientes",
  description: "Gerenciamento de pacientes",
  category: "Atendimento Clínico",
  is_active: true,
  can_activate: true,
  can_deactivate: true,
};

const mockInactiveModule = {
  ...mockModule,
  is_active: false,
  module_key: "FINANCEIRO",
  name: "Financeiro",
  description: "Gestão financeira",
};

const mockModuleWithDependencies = {
  ...mockModule,
  module_key: "TISS",
  name: "TISS",
  description: "Faturamento TISS",
  can_activate: false,
  can_deactivate: false,
  unmet_dependencies: ["PACIENTES"],
};

describe("ModuleCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render module info (name, description, icon)", () => {
    render(
      <ModuleCard
        module={mockModule}
        isToggling={false}
        isExpanded={false}
        allModules={[mockModule]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    expect(screen.getByText("Pacientes")).toBeTruthy();
    expect(screen.getByText("Gerenciamento de pacientes")).toBeTruthy();
    expect(screen.getByTestId("badge")).toBeTruthy();
  });

  it("should render active badge when module is active", () => {
    render(
      <ModuleCard
        module={mockModule}
        isToggling={false}
        isExpanded={false}
        allModules={[mockModule]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("success");
    expect(badge.textContent).toBe("Ativo");
  });

  it("should render inactive badge when module is inactive", () => {
    render(
      <ModuleCard
        module={mockInactiveModule}
        isToggling={false}
        isExpanded={false}
        allModules={[mockInactiveModule]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("secondary");
    expect(badge.textContent).toBe("Inativo");
  });

  it("should call onToggle when switch is changed", () => {
    render(
      <ModuleCard
        module={mockModule}
        isToggling={false}
        isExpanded={false}
        allModules={[mockModule]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    const switchEl = screen.getByTestId("switch");
    act(() => {
      switchEl.click();
    });

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    expect(mockOnToggle).toHaveBeenCalledWith("PACIENTES");
  });

  it("should disable switch when canToggle is false", () => {
    render(
      <ModuleCard
        module={mockModuleWithDependencies}
        isToggling={false}
        isExpanded={false}
        allModules={[mockModuleWithDependencies]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    const switchEl = screen.getByTestId("switch") as HTMLInputElement;
    expect(switchEl.disabled).toBe(true);
  });

  it("should disable switch when isToggling is true", () => {
    render(
      <ModuleCard
        module={mockModule}
        isToggling={true}
        isExpanded={false}
        allModules={[mockModule]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    const switchEl = screen.getByTestId("switch") as HTMLInputElement;
    expect(switchEl.disabled).toBe(true);
  });

  it("should render dependency graph when expanded", () => {
    render(
      <ModuleCard
        module={mockModule}
        isToggling={false}
        isExpanded={true}
        allModules={[mockModule]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    expect(screen.getByTestId("dependency-graph")).toBeTruthy();
  });

  it("should not render dependency graph when not expanded", () => {
    render(
      <ModuleCard
        module={mockModule}
        isToggling={false}
        isExpanded={false}
        allModules={[mockModule]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    expect(screen.queryByTestId("dependency-graph")).toBeNull();
  });

  it("should show warning icon when module has unmet dependencies", () => {
    render(
      <ModuleCard
        module={mockModuleWithDependencies}
        isToggling={false}
        isExpanded={false}
        allModules={[mockModuleWithDependencies]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    // The AlertCircle icon is rendered as an svg, but the button wrapping it should be present
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should call onExpand when warning button is clicked", () => {
    render(
      <ModuleCard
        module={mockModuleWithDependencies}
        isToggling={false}
        isExpanded={false}
        allModules={[mockModuleWithDependencies]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    const buttons = screen.getAllByRole("button");
    act(() => {
      buttons[0].click();
    });

    expect(mockOnExpand).toHaveBeenCalledWith("TISS");
  });

  it("should apply opacity class when isToggling is true", () => {
    render(
      <ModuleCard
        module={mockModule}
        isToggling={true}
        isExpanded={false}
        allModules={[mockModule]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    const card = screen.getByTestId("card");
    expect(card.className).toContain("opacity-60");
  });

  it("should render switch as checked when module is active", () => {
    render(
      <ModuleCard
        module={mockModule}
        isToggling={false}
        isExpanded={false}
        allModules={[mockModule]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    const switchEl = screen.getByTestId("switch") as HTMLInputElement;
    expect(switchEl.checked).toBe(true);
  });

  it("should render switch as unchecked when module is inactive", () => {
    render(
      <ModuleCard
        module={mockInactiveModule}
        isToggling={false}
        isExpanded={false}
        allModules={[mockInactiveModule]}
        onToggle={mockOnToggle}
        onExpand={mockOnExpand}
      />,
    );

    const switchEl = screen.getByTestId("switch") as HTMLInputElement;
    expect(switchEl.checked).toBe(false);
  });
});
