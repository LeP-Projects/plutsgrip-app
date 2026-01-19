import { useRef, useEffect, useCallback } from "react"

interface SwipeOptions {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
    threshold?: number // minimum distance for swipe
    preventDefaultTouchmove?: boolean
}

/**
 * Hook para detectar gestos de swipe em elementos
 * Suporta swipe em todas as direções com threshold configurável
 */
export function useSwipe<T extends HTMLElement = HTMLElement>(options: SwipeOptions) {
    const {
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        threshold = 50,
        preventDefaultTouchmove = false,
    } = options

    const ref = useRef<T>(null)
    const touchStartX = useRef<number>(0)
    const touchStartY = useRef<number>(0)
    const touchEndX = useRef<number>(0)
    const touchEndY = useRef<number>(0)

    const handleTouchStart = useCallback((e: TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
    }, [])

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (preventDefaultTouchmove) {
                e.preventDefault()
            }
            touchEndX.current = e.touches[0].clientX
            touchEndY.current = e.touches[0].clientY
        },
        [preventDefaultTouchmove]
    )

    const handleTouchEnd = useCallback(() => {
        const deltaX = touchEndX.current - touchStartX.current
        const deltaY = touchEndY.current - touchStartY.current
        const absDeltaX = Math.abs(deltaX)
        const absDeltaY = Math.abs(deltaY)

        // Determine if horizontal or vertical swipe
        if (absDeltaX > absDeltaY) {
            // Horizontal swipe
            if (absDeltaX > threshold) {
                if (deltaX > 0) {
                    onSwipeRight?.()
                } else {
                    onSwipeLeft?.()
                }
            }
        } else {
            // Vertical swipe
            if (absDeltaY > threshold) {
                if (deltaY > 0) {
                    onSwipeDown?.()
                } else {
                    onSwipeUp?.()
                }
            }
        }

        // Reset values
        touchStartX.current = 0
        touchStartY.current = 0
        touchEndX.current = 0
        touchEndY.current = 0
    }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

    useEffect(() => {
        const element = ref.current
        if (!element) return

        element.addEventListener("touchstart", handleTouchStart, { passive: true })
        element.addEventListener("touchmove", handleTouchMove, { passive: !preventDefaultTouchmove })
        element.addEventListener("touchend", handleTouchEnd, { passive: true })

        return () => {
            element.removeEventListener("touchstart", handleTouchStart)
            element.removeEventListener("touchmove", handleTouchMove)
            element.removeEventListener("touchend", handleTouchEnd)
        }
    }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefaultTouchmove])

    return ref
}
