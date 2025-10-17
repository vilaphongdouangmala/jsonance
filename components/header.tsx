import { ThemeToggler } from "@/components/ui/theme-toggler";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className={cn("flex items-center justify-between w-full max-w-3xl")}>
      <div className="flex-1"></div>
      <ThemeToggler />
    </header>
  );
}
