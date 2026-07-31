import {
  LiaFacebookSquare,
  LiaTwitterSquare,
  LiaInstagram,
  LiaYoutubeSquare,
} from 'react-icons/lia';

const SOCIALS = [
  { label: 'فیسبوک', href: '#', Icon: LiaFacebookSquare, hover: 'hover:text-blue-500' },
  { label: 'توییتر', href: '#', Icon: LiaTwitterSquare, hover: 'hover:text-sky-500' },
  { label: 'اینستاگرام', href: '#', Icon: LiaInstagram, hover: 'hover:text-pink-500' },
  { label: 'یوتیوب', href: '#', Icon: LiaYoutubeSquare, hover: 'hover:text-red-500' },
] as const;

export function SocialIcons() {
  return (
    <div className="flex gap-4">
      {SOCIALS.map(({ label, href, Icon, hover }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`text-neutral-500 transition-colors ${hover}`}
        >
          <Icon className="size-5" />
        </a>
      ))}
    </div>
  );
}
