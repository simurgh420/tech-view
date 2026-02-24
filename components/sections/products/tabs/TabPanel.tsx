// components/product/tabs/TabPanel.tsx
export default function TabPanel({
  active,
  tab,
  children,
}: {
  active: string;
  tab: string;
  children: React.ReactNode;
}) {
  if (active !== tab) return null;

  return <div className="animate-fadeIn">{children}</div>;
}
