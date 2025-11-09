import { PublicNavbar } from "@/components/public-navbar"
import { PublicFooter } from "@/components/public-footer"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold mb-8">Sobre BookExchange</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Nuestra Misión</h2>
              <p className="text-muted-foreground leading-relaxed">
                BookExchange nace con la idea de crear una comunidad donde los amantes de la lectura puedan compartir
                sus libros favoritos y descubrir nuevas historias sin necesidad de realizar compras. Creemos que la
                lectura enriquece nuestras vidas y que compartir libros fortalece los lazos comunitarios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Nuestros Valores</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Comunidad", description: "Promovemos la conexión entre lectores" },
                  { title: "Sostenibilidad", description: "Reducimos residuos dando nueva vida a los libros" },
                  { title: "Accesibilidad", description: "Hacemos la lectura accesible para todos" },
                ].map((value) => (
                  <Card key={value.title}>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Nuestro Equipo</h2>
              <p className="text-muted-foreground leading-relaxed">
                Somos un pequeño equipo de desarrolladores y amantes de los libros dedicados a crear la mejor plataforma
                de intercambio de libros posible. Estamos en constante evolución para mejorar tu experiencia.
              </p>
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
