import { useOutletContext } from "react-router-dom"

export interface AppShellContextValue {
  language: string
  setLanguage: (language: string) => void
}

export function useAppShellContext() {
  return useOutletContext<AppShellContextValue>()
}
