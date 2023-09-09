import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>lyrics.astrid.sh</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#030303]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 text-white">
        <h1 className="text-3xl">Lyrics API</h1>    
        <h1 className="text-xl font-mono">/api/search?q=</h1>
        <Link className="text-xl font-mono mt-[10rem]"
         href="https://github.com/astridlol/lyrics"
         target="_blank"
         >
           Github
        </Link>   
      </div>
      </main>
    </>
  );
}
