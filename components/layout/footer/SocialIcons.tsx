import { SiFacebook, SiInstagram, SiYoutube, SiX } from 'react-icons/si';

const SOCIALS = [
  { label: 'فیسبوک', href: '#', Icon: SiFacebook },
  { label: 'توییتر', href: '#', Icon: SiX },
  { label: 'اینستاگرام', href: '#', Icon: SiInstagram },
  { label: 'یوتیوب', href: '#', Icon: SiYoutube },
] as const;

export function SocialIcons() {
  return (
    <div className="flex items-center gap-2">
      {SOCIALS.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="
            flex h-9 w-9 items-center justify-center rounded-full
            border border-border text-muted-foreground
            transition-all duration-300
            hover:border-primary/40 hover:bg-primary/10 hover:text-primary
          "
        >
          <Icon size={16} />
        </a>
      ))}
    </div>
  );
}
