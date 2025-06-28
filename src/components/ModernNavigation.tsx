import React, { ReactNode, useEffect, useState } from 'react'
import StickyBottomBar from './StickyBottomBar'
import SmartScrollIndicator from './SmartScrollIndicator'
import FloatingActionMenu from './FloatingActionMenu'

interface ModernNavigationProps {
  totalSelected: number
  onContinue: () => void
  children?: ReactNode
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

const ModernNavigation: React.FC<ModernNavigationProps> = ({ totalSelected, onContinue, children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <>
      {/* Hauptinhalt */}
      <div>{children}</div>

      {/* Mobile/Tablet: Kombinierte Navigation */}
      {isMobile && (
        <>
          <SmartScrollIndicator totalSelected={totalSelected} onContinue={onContinue} />
          <FloatingActionMenu totalSelected={totalSelected} onContinue={onContinue} />
        </>
      )}
    </>
  )
}

export default ModernNavigation
