import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const mockUseLGPDRequests = vi.fn();

vi.mock("@/modules/lgpd/application/hooks/useLGPDRequests", () => ({
  useLGPDRequests: () => mockUseLGPDRequests(),
}));

vi.mock("@/components/shared/PageHeader", () => ({
  PageHeader: ({ title, description, icon: Icon }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
      {Icon && (
        <span data-testid="page-icon">
          <Icon />
        </span>
      )}
    </div>
  ),
}));

vi.mock("@orthoplus/core-ui/tabs", () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children, className }: any) => (
    <div data-testid="tabs-list" className={className}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value, className }: any) => (
    <div data-testid={`tabs-content-${value}`} className={className}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tabs-trigger-${value}`}>{children}</button>
  ),
}));

vi.mock("@orthoplus/core-ui/button", () => ({
  Button: ({ children, onClick, size }: any) => (
    <button onClick={onClick} data-size={size}>
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  Shield: () => <span data-testid="icon-shield">shield</span>,
  FileText: () => <span data-testid="icon-filetext">filetext</span>,
  History: () => <span data-testid="icon-history">history</span>,
}));

vi.mock("@/modules/lgpd/presentation/components/LGPDRequests", () => ({
  LGPDRequests: () => (
    <div data-testid="lgpd-requests">LGPDRequests Component</div>
  ),
}));

vi.mock("@/modules/lgpd/presentation/components/LGPDConsents", () => ({
  LGPDConsents: () => (
    <div data-testid="lgpd-consents">LGPDConsents Component</div>
  ),
}));

vi.mock("@/modules/lgpd/presentation/components/LGPDAuditTrail", () => ({
  LGPDAuditTrail: () => (
    <div data-testid="lgpd-audit">LGPDAuditTrail Component</div>
  ),
}));

import LGPDPage from "../index";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("LGPDPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render page header with correct title and description", () => {
    mockUseLGPDRequests.mockReturnValue({
      requests: [],
      consents: [],
      isLoading: false,
      createRequest: vi.fn(),
      updateRequestStatus: vi.fn(),
    });

    render(<LGPDPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId("page-header")).toBeTruthy();
    expect(screen.getByText("LGPD - Conformidade")).toBeTruthy();
    expect(
      screen.getByText("Gestão de privacidade e proteção de dados"),
    ).toBeTruthy();
  });

  it("should render all three tabs", () => {
    mockUseLGPDRequests.mockReturnValue({
      requests: [],
      consents: [],
      isLoading: false,
      createRequest: vi.fn(),
      updateRequestStatus: vi.fn(),
    });

    render(<LGPDPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId("tabs-trigger-requests")).toBeTruthy();
    expect(screen.getByTestId("tabs-trigger-consents")).toBeTruthy();
    expect(screen.getByTestId("tabs-trigger-audit")).toBeTruthy();
  });

  it("should render tab content areas", () => {
    mockUseLGPDRequests.mockReturnValue({
      requests: [],
      consents: [],
      isLoading: false,
      createRequest: vi.fn(),
      updateRequestStatus: vi.fn(),
    });

    render(<LGPDPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId("tabs-content-requests")).toBeTruthy();
    expect(screen.getByTestId("tabs-content-consents")).toBeTruthy();
    expect(screen.getByTestId("tabs-content-audit")).toBeTruthy();
  });

  it("should render child components inside tab contents", () => {
    mockUseLGPDRequests.mockReturnValue({
      requests: [],
      consents: [],
      isLoading: false,
      createRequest: vi.fn(),
      updateRequestStatus: vi.fn(),
    });

    render(<LGPDPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId("lgpd-requests")).toBeTruthy();
    expect(screen.getByTestId("lgpd-consents")).toBeTruthy();
    expect(screen.getByTestId("lgpd-audit")).toBeTruthy();
  });

  it("should pass hook data correctly", () => {
    const mockCreateRequest = vi.fn();
    const mockUpdateRequestStatus = vi.fn();

    mockUseLGPDRequests.mockReturnValue({
      requests: [{ id: "r1" }],
      consents: [{ id: "c1" }],
      isLoading: false,
      createRequest: mockCreateRequest,
      updateRequestStatus: mockUpdateRequestStatus,
    });

    render(<LGPDPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId("tabs")).toBeTruthy();
    expect(mockUseLGPDRequests).toHaveBeenCalled();
  });

  it("should handle loading state from hook", () => {
    mockUseLGPDRequests.mockReturnValue({
      requests: [],
      consents: [],
      isLoading: true,
      createRequest: vi.fn(),
      updateRequestStatus: vi.fn(),
    });

    render(<LGPDPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId("page-header")).toBeTruthy();
    expect(screen.getByTestId("tabs")).toBeTruthy();
  });
});
