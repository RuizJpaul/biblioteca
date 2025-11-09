import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-16 md:py-24 bg-[#f2d5a6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Intercambia Libros, Comparte Historias</h1>
            <p className="text-lg text-muted-foreground mb-6 text-balance">
              Únete a nuestra comunidad de lectores y descubre nuevos libros sin gastar. Intercambia tus libros
              favoritos con otros lectores apasionados.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/books">
                <Button
                  size="lg"
                  variant="default"
                  className="bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Explorar Libros
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Empezar Ahora
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg h-80 flex items-center justify-center">
            <img src="/fondo.png" alt="" />
          </div>
        </div>
      </div>
    </section>
  )
}
