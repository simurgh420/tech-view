const cards = [
  { title: 'پشتیبانی سریع', desc: 'پاسخ‌گویی در کمتر از ۲۴ ساعت', icon: '💬' },
  { title: 'ایمیل', desc: 'mohamadrezah420@gmail.com', icon: '📧' },
  { title: 'شبکه‌های اجتماعی', desc: 'Instagram / Telegram', icon: '🌐' },
];

export function ContactCards() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
      {cards.map((item, i) => (
        <div
          key={i}
          className="
            p-6 rounded-2xl border border-white/10 
            hover:border-white/20 hover:scale-[1.02]
            transition bg-[oklch(18%_0.01_270)]
          "
        >
          <div className="text-3xl mb-3">{item.icon}</div>
          <h3 className="text-lg font-semibold text-[oklch(95%_0.01_270)]">{item.title}</h3>
          <p className="text-[oklch(80%_0.01_270)] mt-1">{item.desc}</p>
        </div>
      ))}
    </section>
  );
}
