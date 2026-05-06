import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass h-16 flex items-center px-6 justify-between">
      <Link href="/" className="text-2xl font-heading font-bold text-primary flex items-center gap-2">
        <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-xl">
          +
        </span>
        Поликлиника
      </Link>
      
      <div className="flex items-center gap-6">
        <Link href="/doctors" className="text-sm font-medium hover:text-primary transition-colors">
          Врачи
        </Link>
        <Link href="/appointments" className="text-sm font-medium hover:text-primary transition-colors">
          Записи
        </Link>
        <Link href="/profile" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/20 font-bold">
          АИ
        </Link>
      </div>
    </nav>
  );
}
