"use client"

import * as React from "react"
import { ptBR, enUS } from "date-fns/locale"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import type { Locale } from "date-fns"
import type { DayPickerProps } from "react-day-picker"

export type CalendarProps = DayPickerProps & {
  locale?: Locale
}

export function Calendar({
  locale,
  ...props
}: CalendarProps) {
  // Detectar idioma do sistema automaticamente
  const systemLocale = React.useMemo(() => {
    // Se foi passado um locale explicitamente, usar esse
    if (locale) {
      return locale
    }

    // Detectar do navegador
    if (typeof window !== "undefined") {
      const lang = navigator.language.toLowerCase()
      if (lang.startsWith("pt")) {
        return ptBR
      }
      if (lang.startsWith("en")) {
        return enUS
      }
    }

    // Fallback para pt-BR
    return ptBR
  }, [locale])

  return (
    <CalendarUI
      {...props}
      locale={systemLocale}
      captionLayout="dropdown"
    />
  )
}
