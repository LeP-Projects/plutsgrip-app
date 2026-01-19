"use client"

import * as React from "react"
import { Calendar as CalendarUI } from "@/components/ui/calendar"

export type CalendarProps = React.ComponentProps<typeof CalendarUI>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <CalendarUI
      className={className}
      classNames={classNames}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  )
}
