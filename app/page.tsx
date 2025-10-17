import { JsonFormatter } from "@/components/json-formatter";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
        <JsonFormatter />
      </main>
      <div className="row-start-3">
        <Footer />
      </div>
    </div>
  );
}
