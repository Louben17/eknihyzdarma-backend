import Link from "next/link";
import { BookOpen, Tablet, Smartphone, Monitor, LayoutGrid } from "lucide-react";

export const deviceLinks = [
  { href: "/jak-cist-eknihy", label: "Přehled", icon: LayoutGrid },
  { href: "/jak-cist-eknihy/kindle", label: "Amazon Kindle", icon: BookOpen },
  { href: "/jak-cist-eknihy/ctecky", label: "Ostatní čtečky", icon: Tablet },
  { href: "/jak-cist-eknihy/apple", label: "Apple (iPhone / iPad / Mac)", icon: Smartphone },
  { href: "/jak-cist-eknihy/android", label: "Android", icon: Smartphone },
  { href: "/jak-cist-eknihy/windows-mac", label: "Windows / Mac", icon: Monitor },
];

export default function JakCistNav({ currentPath }: { currentPath: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
        Čtení podle zařízení
      </h3>
      <nav className="space-y-0.5">
        {deviceLinks.map(({ href, label, icon: Icon }) => {
          const isActive = currentPath === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-brand/10 text-brand font-medium"
                  : "text-gray-600 hover:text-brand hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Formáty
        </p>
        <div className="space-y-1.5 text-xs text-gray-600">
          <div>
            <span className="font-semibold text-emerald-600">EPUB</span>
            {" "}– universal, doporučený
          </div>
          <div>
            <span className="font-semibold text-orange-600">MOBI</span>
            {" "}– pro Amazon Kindle
          </div>
          <div>
            <span className="font-semibold text-red-600">PDF</span>
            {" "}– pro PC a tablety
          </div>
        </div>
      </div>
    </div>
  );
}
