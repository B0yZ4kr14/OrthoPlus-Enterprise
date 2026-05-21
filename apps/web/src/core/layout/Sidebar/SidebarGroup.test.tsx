import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { SidebarGroup } from "./SidebarGroup"
import type { MenuGroup } from "./sidebar.config"
import { Users, LayoutDashboard } from "lucide-react"

const mockToggle = vi.fn()
const mockIsExpanded = vi.fn().mockReturnValue(false)

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    hasModuleAccess: () => true,
  }),
}))

vi.mock("@/stores/sidebarStore", () => ({
  useSidebarCategory: () => ({
    isExpanded: mockIsExpanded,
    toggleGroup: mockToggle,
    expandedGroups: [],
  }),
}))

vi.mock("@orthoplus/core-ui/sidebar", () => ({
  SidebarGroup: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sidebar-group" className={className}>{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  useSidebar: () => ({ state: "expanded" }),
}))

vi.mock("./SidebarMenuItem", () => ({
  SidebarMenuItem: ({ item }: { item: { title: string } }) => <span>{item.title}</span>,
}))

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/pacientes" }),
}))

const mockGroup: MenuGroup = {
  label: "CLÍNICA",
  boundedContext: "clinica",
  category: "CLINICA",
  items: [
    { title: "Pacientes", url: "/pacientes", icon: Users, moduleKey: "pacientes" },
    { title: "Agenda", url: "/agenda", icon: Users, moduleKey: "agenda" },
  ],
}

describe("SidebarGroup", () => {
  beforeEach(() => {
    mockToggle.mockClear()
    mockIsExpanded.mockReturnValue(false)
  })

  it("renders without crashing", () => {
    const { container } = render(<SidebarGroup group={mockGroup} index={0} />)
    expect(container.firstChild).toBeTruthy()
  })

  it("calls toggleGroup when header is clicked", () => {
    render(<SidebarGroup group={mockGroup} index={0} />)
    const button = screen.getByRole("button")
    button.click()
    expect(mockToggle).toHaveBeenCalledWith("clinica")
  })

  it("calls toggleGroup when Enter is pressed on header", () => {
    render(<SidebarGroup group={mockGroup} index={0} />)
    const button = screen.getByRole("button")
    fireEvent.keyDown(button, { key: "Enter" })
    expect(mockToggle).toHaveBeenCalledWith("clinica")
  })

  it("calls toggleGroup when Space is pressed on header", () => {
    render(<SidebarGroup group={mockGroup} index={0} />)
    const button = screen.getByRole("button")
    fireEvent.keyDown(button, { key: " " })
    expect(mockToggle).toHaveBeenCalledWith("clinica")
  })

  it("has correct ARIA attributes when collapsed", () => {
    mockIsExpanded.mockReturnValue(false)
    render(<SidebarGroup group={mockGroup} index={0} />)
    const button = screen.getByRole("button")
    expect(button.getAttribute("aria-expanded")).toBe("false")
    expect(button.getAttribute("aria-controls")).toBe("sidebar-group-clinica")
  })

  it("has correct ARIA attributes when expanded", () => {
    mockIsExpanded.mockReturnValue(true)
    render(<SidebarGroup group={mockGroup} index={0} />)
    const button = screen.getByRole("button")
    expect(button.getAttribute("aria-expanded")).toBe("true")
  })

  it("shows menu items when expanded", () => {
    mockIsExpanded.mockReturnValue(true)
    render(<SidebarGroup group={mockGroup} index={0} />)
    expect(screen.getByText("Pacientes")).toBeTruthy()
    expect(screen.getByText("Agenda")).toBeTruthy()
  })

  it("does not show menu items when collapsed", () => {
    mockIsExpanded.mockReturnValue(false)
    render(<SidebarGroup group={mockGroup} index={0} />)
    expect(screen.queryByText("Pacientes")).toBeNull()
    expect(screen.queryByText("Agenda")).toBeNull()
  })

  it("does not show toggle for VISAO GERAL category", () => {
    const dashboardGroup: MenuGroup = {
      label: "VISÃO GERAL",
      boundedContext: "DASHBOARD",
      category: "DASHBOARD",
      items: [
        { title: "Dashboard", url: "/", icon: LayoutDashboard, moduleKey: "DASHBOARD" },
      ],
    }
    render(<SidebarGroup group={dashboardGroup} index={0} />)
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.getByText("Dashboard")).toBeTruthy()
  })
})
