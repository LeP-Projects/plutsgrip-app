import { useState } from "react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Textarea } from "@/components/Textarea"
import { MessageCircle, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Dialog"
import { useToast } from "@/hooks/use-toast"

const translations = {
  en: {
    contactSupport: "Contact Support",
    contactDescription: "Send us a message via WhatsApp. We'll get back to you as soon as possible.",
    yourName: "Your Name",
    enterFullName: "Enter your full name",
    subject: "Subject",
    whatsThisAbout: "What's this about?",
    message: "Message",
    describeIssue: "Describe your question or issue...",
    cancel: "Cancel",
    sendViaWhatsApp: "Send via WhatsApp",
    error: "Error",
    fillAllFields: "Please fill in all fields.",
    messageSent: "Message Sent!",
    messageSentDesc: "Your message has been sent via WhatsApp.",
    required: "*",
  },
  pt: {
    contactSupport: "Contatar Suporte",
    contactDescription: "Envie-nos uma mensagem via WhatsApp. Retornaremos o mais breve possível.",
    yourName: "Seu Nome",
    enterFullName: "Digite seu nome completo",
    subject: "Assunto",
    whatsThisAbout: "Sobre o que se trata?",
    message: "Mensagem",
    describeIssue: "Descreva sua pergunta ou problema...",
    cancel: "Cancelar",
    sendViaWhatsApp: "Enviar via WhatsApp",
    error: "Erro",
    fillAllFields: "Por favor, preencha todos os campos.",
    messageSent: "Mensagem Enviada!",
    messageSentDesc: "Sua mensagem foi enviada via WhatsApp.",
    required: "*",
  },
}

interface FloatingContactFormProps {
  language?: string
}

export function FloatingContactForm({ language = "en" }: FloatingContactFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    message: "",
  })
  const { toast } = useToast()

  const t = translations[language as keyof typeof translations]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: t.error,
        description: t.fillAllFields,
        variant: "destructive",
      })
      return
    }

    // Format WhatsApp message
    const whatsappMessage = `*New Contact from FinanceTracker*%0A%0A*Name:* ${formData.name}%0A*Subject:* ${formData.subject}%0A*Message:* ${formData.message}`

    // WhatsApp number (replace with actual number)
    const whatsappNumber = "5511999999999" // Replace with your WhatsApp number
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

    // Open WhatsApp
    window.open(whatsappUrl, "_blank")

    // Reset form and close dialog
    setFormData({ name: "", subject: "", message: "" })
    setIsOpen(false)

    toast({
      title: t.messageSent,
      description: t.messageSentDesc,
    })
  }

  return (
    <>
      {/* Floating Action Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">{t.contactSupport}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{t.contactSupport}</DialogTitle>
            <DialogDescription>{t.contactDescription}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">
                {t.yourName} {t.required}
              </Label>
              <Input
                id="contact-name"
                placeholder={t.enterFullName}
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-subject">
                {t.subject} {t.required}
              </Label>
              <Input
                id="contact-subject"
                placeholder={t.whatsThisAbout}
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">
                {t.message} {t.required}
              </Label>
              <Textarea
                id="contact-message"
                placeholder={t.describeIssue}
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Send className="mr-2 h-4 w-4" />
                {t.sendViaWhatsApp}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
