import { ThemeToggler } from "@/components/ui/theme-toggler";
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <ThemeToggler />
      </main>
      <footer className="row-start-3 gap-x-1 flex flex-wrap items-center justify-center text-secondary-foreground/50 text-sm">
        <div>Copyright ©</div>
        <a
          href="https://github.com/vilaphongdouangmala"
          target="_blank"
          rel="noopener noreferrer"
        >
          Vilaphong Douangmala
        </a>
        <div>All rights reserved.</div>
      </footer>
    </div>
  );
}
