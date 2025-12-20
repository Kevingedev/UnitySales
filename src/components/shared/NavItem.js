import Link from "next/link";

export default function NavItem({ icon, label, isOpen, active = false, isAI = false, href }) {
  return (
    <Link href={href} className={`
      w-full flex items-center p-3 rounded-lg cursor-pointer transition-all border-none
      ${active ? "bg-brand text-white shadow-md shadow-brand/30" : "hover:bg-brand/10 text-zinc-500 hover:text-brand"}
      ${isAI && !active ? "border border-brand/20" : ""}
    `}>
      <div className="flex shrink-0">{icon}</div>
      {isOpen && <span className="ml-4 text-xs font-bold uppercase tracking-widest">{label}</span>}
    </Link>
  );
}

