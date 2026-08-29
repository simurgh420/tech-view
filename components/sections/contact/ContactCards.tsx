const cards = [
  { title: 'پشتیبانی سریع', desc: 'پاسخ‌گویی در کمتر از ۲۴ ساعت', icon: '💬' },
  { title: 'ایمیل', desc: 'mohamadrezah420@gmail.com', icon: '📧' },
  { title: 'شبکه‌های اجتماعی', desc: 'Instagram / Telegram', icon: '🌐' },
];

export function ContactCards() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12" dir="rtl">
      {cards.map((item, i) => (
        <div
          key={i}
          className="
            rounded-2xl border border-border bg-card p-6
            shadow-sm transition-all duration-300
            hover:-translate-y-1 hover:border-primary/30 hover:shadow-md
          "
        >
          <div className="mb-3 text-3xl">{item.icon}</div>
          <h3 className="text-lg font-semibold text-card-foreground">{item.title}</h3>
          <p className="mt-1 text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </section>
  );
}
