export function PublicFooter() {
  return (
    <footer className="bg-muted border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">BookExchange</h3>
            <p className="text-muted-foreground text-sm">
              Plataforma comunitaria para intercambiar libros y descubrir nuevas historias.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/" className="hover:text-primary">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/books" className="hover:text-primary">
                  Libros
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-primary">
                  Nosotros
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary">
                  Términos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Privacidad
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <p className="text-sm text-muted-foreground">info@bookexchange.com</p>
          </div>
        </div>
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 BookExchange. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
