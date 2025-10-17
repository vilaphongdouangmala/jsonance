import { ThemeToggler } from "@/components/ui/theme-toggler";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils/utils";

export function Header() {
  return (
    <header className={cn("flex items-center justify-between w-full max-w-3xl")}>
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <ThemeToggler />
      </div>
    </header>
  );
}
