import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/contexts/ThemeProvider"
import { Button } from "@/components/Button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/DropdownMenu"
import { useEffect, useState } from "react"

const translations = {
  en: {
    toggleTheme: "Toggle theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  pt: {
    toggleTheme: "Alternar tema",
    light: "Claro",
    dark: "Escuro",
    system: "Sistema",
  },
}

interface ThemeToggleProps {
  language?: string
}

export function ThemeToggle({ language = "en" }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const t = translations[language as keyof typeof translations]

  const getThemeLabel = (currentTheme: string | undefined) => {
    switch (currentTheme) {
      case "light":
        return t.light
      case "dark":
        return t.dark
      case "system":
        return t.system
      default:
        return t.system
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="ml-2">{t.system}</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative flex items-center">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute left-2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t.toggleTheme}</span>
          <span className="ml-3">{getThemeLabel(theme)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          {t.light}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          {t.dark}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          {t.system}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
