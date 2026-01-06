export function FooterBottom() {
  return (
    <div className="w-full bg-linear-to-r text-xs px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-center md:text-left">© 2025 Simurgh</div>
        <div className="flex gap-4 flex-wrap justify-center md:justify-end">
          <span className="cursor-pointer hover:underline">Privacy Policy</span>
          <span className="cursor-pointer hover:underline">Terms & Conditions</span>
          <span className="cursor-pointer hover:underline">Cookie Settings</span>
          <span className="cursor-pointer hover:underline">Inspire</span>
        </div>
      </div>
    </div>
  );
}
