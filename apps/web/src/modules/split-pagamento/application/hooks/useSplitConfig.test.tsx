import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, cleanup } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useSplitConfig } from "./useSplitConfig"

let mockClinicId: string | null = "clinic-1"

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    clinicId: mockClinicId,
  }),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("useSplitConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockClinicId = "clinic-1"
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("should return null config and empty transactions when clinicId is set", async () => {
    const { result } = renderHook(() => useSplitConfig(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.config).toBeNull()
    expect(result.current.transactions).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it("should not run queries when clinicId is null", () => {
    mockClinicId = null

    const { result } = renderHook(() => useSplitConfig(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.config).toBeUndefined()
    expect(result.current.transactions).toEqual([])
  })
})
