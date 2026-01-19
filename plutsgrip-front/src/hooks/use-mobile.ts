import { useEffect, useState } from "react"

/**
 * Hook para detectar se o dispositivo é mobile
 * Retorna true se a largura da tela for menor que 768px
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Verifica no mount
    checkMobile()

    // Adiciona listener para resize
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}
