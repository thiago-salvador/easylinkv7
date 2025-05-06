"use client"

import { useLanguage } from "@/lib/language-context"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria implementada a lógica de envio do formulário
    alert('Formulário enviado com sucesso!');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Formulário de Contato */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <p className="text-gray-700 mb-8">
                {t('contact.description')}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('contact.form.name')}
                  </label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('contact.form.email')}
                  </label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('contact.form.subject')}
                  </label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    required 
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('contact.form.message')}
                  </label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    rows={5} 
                    required 
                    className="w-full"
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  {t('contact.form.send')}
                </Button>
              </form>
            </div>
            
            {/* Informações de Contato */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('contact.info.title')}
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Email</h3>
                    <p className="text-gray-700">{t('contact.info.email')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Telefone</h3>
                    <p className="text-gray-700">{t('contact.info.phone')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
                    <p className="text-gray-700">{t('contact.info.address')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
