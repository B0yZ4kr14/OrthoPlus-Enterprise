import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { SidebarGroup } from "./SidebarGroup"
import type { MenuGroup } from "./sidebar.config"

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
  icon: "Users",
  items: [
    { title: "Pacientes", url: "/pacientes", icon: "Users", moduleKey: "pacientes" },
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
})
