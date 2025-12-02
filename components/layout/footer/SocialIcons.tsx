import {
  LiaFacebookSquare,
  LiaTwitterSquare,
  LiaInstagram,
  LiaYoutubeSquare,
} from 'react-icons/lia';

export function SocialIcons() {
  return (
    <div className="flex gap-4">
      <LiaFacebookSquare className="size-5 text-neutral-500 cursor-pointer hover:text-blue-500 transition-colors" />
      <LiaTwitterSquare className="size-5 text-neutral-500 cursor-pointer hover:text-sky-500 transition-colors" />
      <LiaInstagram className="size-5 text-neutral-500 cursor-pointer hover:text-pink-500 transition-colors" />
      <LiaYoutubeSquare className="size-5 text-neutral-500 cursor-pointer hover:text-red-500 transition-colors" />
    </div>
  );
}
