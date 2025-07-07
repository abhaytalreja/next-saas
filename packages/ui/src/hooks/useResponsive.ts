import { useState, useEffect } from 'react'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface BreakpointConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

export const defaultBreakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

export function useBreakpoint(breakpoint: Breakpoint, breakpoints = defaultBreakpoints): boolean {
  const minWidth = breakpoints[breakpoint]
  return useMediaQuery(`(min-width: ${minWidth}px)`)
}

export function useBreakpointValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  breakpoints = defaultBreakpoints
): T | undefined {
  const [currentValue, setCurrentValue] = useState<T | undefined>()

  const isXs = useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`)
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`)
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`)
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`)
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl}px) and (max-width: ${breakpoints['2xl'] - 1}px)`)
  const is2xl = useMediaQuery(`(min-width: ${breakpoints['2xl']}px)`)

  useEffect(() => {
    let value: T | undefined

    if (is2xl && values['2xl'] !== undefined) {
      value = values['2xl']
    } else if (isXl && values.xl !== undefined) {
      value = values.xl
    } else if (isLg && values.lg !== undefined) {
      value = values.lg
    } else if (isMd && values.md !== undefined) {
      value = values.md
    } else if (isSm && values.sm !== undefined) {
      value = values.sm
    } else if (isXs && values.xs !== undefined) {
      value = values.xs
    } else {
      // Fallback to the largest available value
      const availableBreakpoints: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
      for (const bp of availableBreakpoints) {
        if (values[bp] !== undefined) {
          value = values[bp]
          break
        }
      }
    }

    setCurrentValue(value)
  }, [values, isXs, isSm, isMd, isLg, isXl, is2xl])

  return currentValue
}

export function useCurrentBreakpoint(breakpoints = defaultBreakpoints): Breakpoint {
  const isXs = useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`)
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`)
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`)
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`)
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl}px) and (max-width: ${breakpoints['2xl'] - 1}px)`)
  const is2xl = useMediaQuery(`(min-width: ${breakpoints['2xl']}px)`)

  if (is2xl) return '2xl'
  if (isXl) return 'xl'
  if (isLg) return 'lg'
  if (isMd) return 'md'
  if (isSm) return 'sm'
  return 'xs'
}

export function useIsMobile(mobileBreakpoint: Breakpoint = 'md', breakpoints = defaultBreakpoints): boolean {
  return !useBreakpoint(mobileBreakpoint, breakpoints)
}

export function useIsTablet(breakpoints = defaultBreakpoints): boolean {
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`)
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`)
  return isMd || isLg
}

export function useIsDesktop(desktopBreakpoint: Breakpoint = 'lg', breakpoints = defaultBreakpoints): boolean {
  return useBreakpoint(desktopBreakpoint, breakpoints)
}

export function useWindowSize(): { width: number; height: number } {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial size
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    if (typeof window === 'undefined') return

    function handleOrientationChange() {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    // Set initial orientation
    handleOrientationChange()

    window.addEventListener('resize', handleOrientationChange)
    return () => window.removeEventListener('resize', handleOrientationChange)
  }, [])

  return orientation
}

// Hook for responsive props
export function useResponsiveProps<T>(
  props: T | Partial<Record<Breakpoint, T>>,
  breakpoints = defaultBreakpoints
): T {
  // If props is not an object with breakpoint keys, return as-is
  if (typeof props !== 'object' || props === null) {
    return props as T
  }

  const possibleBreakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  const hasBreakpointKeys = possibleBreakpoints.some(bp => bp in (props as any))

  if (!hasBreakpointKeys) {
    return props as T
  }

  // Use breakpoint value logic
  const breakpointProps = props as Partial<Record<Breakpoint, T>>
  const value = useBreakpointValue(breakpointProps, breakpoints)

  // Fallback to a default value if no breakpoint matches
  if (value === undefined) {
    const firstAvailableValue = possibleBreakpoints
      .map(bp => breakpointProps[bp])
      .find(val => val !== undefined)
    
    return firstAvailableValue || ({} as T)
  }

  return value
}

// Utility for responsive class names
export function useResponsiveClassName(
  baseClassName: string,
  responsiveClasses: Partial<Record<Breakpoint, string>>,
  breakpoints = defaultBreakpoints
): string {
  const currentBreakpoint = useCurrentBreakpoint(breakpoints)
  const responsiveClass = responsiveClasses[currentBreakpoint]
  
  return responsiveClass ? `${baseClassName} ${responsiveClass}` : baseClassName
}