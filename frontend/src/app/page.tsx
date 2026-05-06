import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 animate-in">
      {/* Hero Section */}
      <section className="relative py-12 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Система работает в штатном режиме
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-heading font-bold leading-tight">
            Забота о вашем <br />
            <span className="text-primary">здоровье</span> в один клик
          </h1>
          
          <p className="text-lg text-foreground/60 max-w-xl">
            Современная платформа для записи к врачам, ведения медицинских карт и контроля вашего состояния.
            Все необходимые услуги в одном месте.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/doctors" 
              className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 scale-100 hover:scale-105 active:scale-95 text-center"
            >
              Найти врача
            </Link>
            <Link 
              href="/appointments" 
              className="px-8 py-4 glass text-primary font-bold rounded-xl transition-all hover:bg-primary/5 scale-100 hover:scale-105 active:scale-95 text-center"
            >
              Мои записи
            </Link>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <div className="w-full aspect-square glass rounded-3xl relative overflow-hidden p-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 animate-pulse"></div>
            <div className="text-8xl text-primary/10 font-bold select-none text-center">
              MEDICAL
            </div>
            {/* Visual element representing health */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                 <div className="w-48 h-48 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                   <div className="w-32 h-32 bg-primary/30 rounded-full flex items-center justify-center border border-primary/40 text-primary text-6xl font-bold">
                      +
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Онлайн запись", desc: "Записывайтесь к специалистам в любое удобное время без очередей.", icon: "📅" },
          { title: "История посещений", desc: "Все ваши медицинские данные и рецепты сохранены в личном кабинете.", icon: "📁" },
          { title: "Лучшие врачи", desc: "Доступ к базе проверенных специалистов высшей квалификации.", icon: "👨‍⚕️" }
        ].map((feature, i) => (
          <div key={i} className="p-8 glass rounded-2xl space-y-4 hover:-translate-y-2 transition-transform duration-300">
            <div className="text-4xl">{feature.icon}</div>
            <h3 className="text-xl font-heading font-bold">{feature.title}</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

