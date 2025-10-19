import { ThemeToggler } from "@/components/ui/theme-toggler";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations();
  return (
    <header
      className={cn("flex items-center justify-between w-full max-w-4xl")}
    >
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{t("app.title")}</h1>
      </div>
      <ThemeToggler />
    </header>
  );
}
