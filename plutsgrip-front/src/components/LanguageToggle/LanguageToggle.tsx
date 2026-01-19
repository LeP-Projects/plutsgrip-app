import { Languages } from "lucide-react"
import { Button } from "@/components/Button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/DropdownMenu"

interface LanguageToggleProps {
  currentLanguage: string
  onLanguageChange: (language: string) => void
}

export function LanguageToggle({ currentLanguage, onLanguageChange }: LanguageToggleProps) {
  const languages = {
    en: "English",
    pt: "Português",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="ml-2">{languages[currentLanguage as keyof typeof languages]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onLanguageChange("en")}>🇺🇸 English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onLanguageChange("pt")}>🇧🇷 Português</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
