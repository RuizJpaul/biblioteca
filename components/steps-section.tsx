import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function StepsSection() {
  const steps = [
    {
      number: 1,
      title: "Registrate",
      description: "Crea tu cuenta con tu email y contraseña",
    },
    {
      number: 2,
      title: "Sube tus Libros",
      description: "Agrega los libros que quieres intercambiar con foto",
    },
    {
      number: 3,
      title: "Busca y Explora",
      description: "Descubre libros de otros usuarios en el catálogo",
    },
    {
      number: 4,
      title: "Intercambia",
      description: "Propón intercambios y conecta con otros lectores",
    },
  ]

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">¿Cómo Funciona?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <Card key={step.number}>
              <CardHeader>
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-4">
                  {step.number}
                </div>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{step.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
