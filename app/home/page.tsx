import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <main className="max-w-4xl w-full space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to Our App
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern web application built with Next.js, Tailwind CSS, and
            Supabase.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="px-6 py-3 border border-border rounded-md hover:bg-accent transition-colors"
            >
              Learn More
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Fast & Reliable</h3>
              <p className="text-muted-foreground">
                Built with modern technologies for optimal performance.
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Secure</h3>
              <p className="text-muted-foreground">
                Your data is protected with industry-standard security.
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
              <p className="text-muted-foreground">
                Intuitive interface designed for a great user experience.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
