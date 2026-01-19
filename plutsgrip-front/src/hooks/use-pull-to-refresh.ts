import { useState, useRef, useCallback, useEffect } from "react"

interface PullToRefreshOptions {
    onRefresh: () => Promise<void>
    threshold?: number // pixels to pull before triggering refresh
    maxPull?: number // maximum pull distance
}

interface PullToRefreshState {
    isPulling: boolean
    isRefreshing: boolean
    pullDistance: number
}

/**
 * Hook para implementar pull-to-refresh em listas
 * Retorna estado e ref para o container
 */
export function usePullToRefresh<T extends HTMLElement = HTMLElement>(
    options: PullToRefreshOptions
) {
    const { onRefresh, threshold = 80, maxPull = 120 } = options

    const [state, setState] = useState<PullToRefreshState>({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
    })

    const ref = useRef<T>(null)
    const startY = useRef<number>(0)
    const currentY = useRef<number>(0)

    const handleTouchStart = useCallback((e: TouchEvent) => {
        const element = ref.current
        if (!element) return

        // Only start pull if at top of scrollable area
        if (element.scrollTop <= 0) {
            startY.current = e.touches[0].clientY
            setState((prev) => ({ ...prev, isPulling: true }))
        }
    }, [])

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!state.isPulling || state.isRefreshing) return

            currentY.current = e.touches[0].clientY
            const deltaY = currentY.current - startY.current

            if (deltaY > 0) {
                // Pulling down with resistance effect
                const distance = Math.min(deltaY * 0.5, maxPull)
                setState((prev) => ({ ...prev, pullDistance: distance }))
            }
        },
        [state.isPulling, state.isRefreshing, maxPull]
    )

    const handleTouchEnd = useCallback(async () => {
        if (!state.isPulling) return

        if (state.pullDistance >= threshold && !state.isRefreshing) {
            setState((prev) => ({ ...prev, isRefreshing: true, pullDistance: threshold }))

            try {
                await onRefresh()
            } finally {
                setState({ isPulling: false, isRefreshing: false, pullDistance: 0 })
            }
        } else {
            setState({ isPulling: false, isRefreshing: false, pullDistance: 0 })
        }

        startY.current = 0
        currentY.current = 0
    }, [state.isPulling, state.pullDistance, state.isRefreshing, threshold, onRefresh])

    useEffect(() => {
        const element = ref.current
        if (!element) return

        element.addEventListener("touchstart", handleTouchStart, { passive: true })
        element.addEventListener("touchmove", handleTouchMove, { passive: true })
        element.addEventListener("touchend", handleTouchEnd, { passive: true })

        return () => {
            element.removeEventListener("touchstart", handleTouchStart)
            element.removeEventListener("touchmove", handleTouchMove)
            element.removeEventListener("touchend", handleTouchEnd)
        }
    }, [handleTouchStart, handleTouchMove, handleTouchEnd])

    const pullProgress = Math.min(state.pullDistance / threshold, 1)

    return {
        ref,
        isPulling: state.isPulling,
        isRefreshing: state.isRefreshing,
        pullDistance: state.pullDistance,
        pullProgress,
    }
}
