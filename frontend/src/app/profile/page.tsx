export default function ProfilePage() {
  return (
    <div className="animate-in space-y-12">
      <header>
        <h1 className="text-4xl font-heading font-bold mb-2">Личный кабинет</h1>
        <p className="text-foreground/60">Управляйте вашими персональными данными и настройками безопасности.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass p-8 rounded-3xl space-y-6">
            <h2 className="text-2xl font-heading font-bold">Персональная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Фамилия", value: "Хисамутдинов" },
                { label: "Имя", value: "Арслан" },
                { label: "Отчество", value: "Ильдарович" },
                { label: "Дата рождения", value: "07.05.2003" },
                { label: "Телефон", value: "+7 (999) 123-45-67" },
                { label: "Email", value: "arslan@example.com" },
              ].map((field, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{field.label}</label>
                  <p className="text-lg font-medium">{field.value}</p>
                </div>
              ))}
            </div>
            <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all">
              Редактировать
            </button>
          </section>

          <section className="glass p-8 rounded-3xl space-y-6">
            <h2 className="text-2xl font-heading font-bold">Медицинские документы</h2>
            <div className="space-y-4">
              {[
                { label: "СНИЛС", value: "123-456-789 00" },
                { label: "Полис ОМС", value: "5432 1098 7654 3210" },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">{doc.label}</p>
                    <p className="text-lg font-mono font-bold">{doc.value}</p>
                  </div>
                  <div className="text-primary text-2xl">📄</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-3xl text-center space-y-4">
             <div className="w-24 h-24 bg-secondary/20 rounded-full mx-auto flex items-center justify-center text-4xl text-secondary font-bold border-4 border-secondary/10">
               АИ
             </div>
             <div>
               <h3 className="text-xl font-heading font-bold">Арслан И.</h3>
               <p className="text-sm text-foreground/40 font-medium">Пациент</p>
             </div>
             <button className="w-full py-3 glass rounded-xl text-accent font-bold hover:bg-accent/5 transition-all">
               Выйти из системы
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
