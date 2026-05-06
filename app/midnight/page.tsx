import { MidnightIntro } from "@/components/midnight-intro";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  description:
    "The history and philosophy behind IPTRADE — speed, discipline, and the art of perfect execution.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/midnight" },
  openGraph: {
    description:
      "The history and philosophy behind IPTRADE — speed, discipline, and the art of perfect execution.",
    url: "/midnight",
    type: "website",
    images: [
      {
        url: "/assets/midnight/preview.png",
        width: 1200,
        height: 630,
        alt: "IPTRADE Mid Night — The history and philosophy of IPTRADE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    description:
      "The history and philosophy behind IPTRADE — speed, discipline, and the art of perfect execution.",
    images: ["/assets/midnight/preview.png"],
  },
};

export default function MidnightPage() {
  return (
    <MidnightIntro videoSrc="/assets/midnight/dont_be_a_ponk.mp4">
      <div className="min-h-screen w-full max-w-full min-w-0 overflow-x-hidden bg-black text-gray-300 ">
      <article className="w-full max-w-4xl mx-auto px-6 py-16 sm:py-24 box-border grayscale">
        <header className="mb-16">
          <p className="text-2xl sm:text-3xl text-white/90 font-medium  mb-2">
            瞬写
          </p>
          <p className="text-sm text-gray-500  ">
            — instant capture
          </p>
          <h1 className="text-3xl  text-white  mt-12 ">
            The History and Philosophy of IPTRADE
          </h1>
        </header>

        <section className="space-y-4 mb-16">
          <figure className="w-full  sm:mx-0 overflow-hidden">
            <img
              src="/assets/midnight/01.jpg"
              alt="Sedan a alta velocidad en la autopista Wangan de noche, Tokio"
              className="w-full h-auto  object-contain block "
            />
          </figure>
          <p className="text-gray-400 leading-relaxed">
            There is a story very few people know.
          </p>
          <p className="leading-relaxed">
            In the Tokyo of the 1980s, under the neon lights of the{" "}
            <strong className="text-gray-200">Wangan</strong> — the coastal
            highway connecting Tokyo and Yokohama — there was a club nobody
            admitted to knowing. They had no headquarters. No sponsors. No
            cameras. Legend has it they communicated through coded ads in the
            classifieds: &ldquo;Wallets for sale. Daikoku Parking Area, midnight
            Thursday.&rdquo;
          </p>
          <p className="leading-relaxed">
            They called themselves <strong className="text-white">Mid Night</strong>.
          </p>
          <figure className="w-full   sm:mx-0 overflow-hidden">
            <img
              src="/assets/midnight/03.jpg"
              alt="Página de revista o recorte sobre el Mid Night Club: CAR SPECIAL, texto «caution wake turbulence»"
              className="w-full h-auto  object-contain block"
            />
          </figure>
          <p className="leading-relaxed">
            They weren’t vandals. They were engineers, entrepreneurs,
            perfectionists obsessed with a single idea:{" "}
            <strong className="text-gray-200">sustained speed</strong>. They
            didn’t care about the quarter mile. They didn’t care about drift.
            They cared about holding 320 km/h for 15 minutes straight, in real
            conditions, on a public road. That required something money alone
            couldn’t buy: total discipline, zero-compromise engineering, and one
            unbreakable rule —
          </p>
          <p className="leading-relaxed text-white font-medium">
            Never put an innocent person at risk.
          </p>
          <p className="leading-relaxed">
            To join the club, your car had to hold 250 km/h comfortably. Not
            reach — <strong className="text-gray-200">hold</strong>. Because
            anyone can go fast once. Only the best go fast and come back in one
            piece.
          </p>
          <figure className="w-full  sm:mx-0 overflow-hidden">
            <img
              src="/assets/midnight/08.jpg"
              alt="Vista desde el interior de un coche a alta velocidad en un túnel del Wangan"
              className="w-full h-auto max-w-full object-contain block"
            />
          </figure>
          <figure className="w-full  sm:mx-0 flex gap-0">
            <img
              src="/assets/midnight/nissan-r32gtr-1.jpg"
              alt="Nissan Skyline R32 GT-R, récord Mid Night Team 321.51 km/h"
              className="flex-1 min-w-0 w-0 object-cover block h-40 sm:h-56"
            />
            <img
              src="/assets/midnight/Porsche-964turbo.jpg"
              alt="Porsche 964 Turbo, récord Mid Night Team 332.19 km/h"
              className="flex-1 min-w-0 w-0 object-cover block h-40 sm:h-56"
            />
            <img
              src="/assets/midnight/toyota-supra-a70.jpg"
              alt="Toyota Supra A70, récord Mid Night Team 312.49 km/h"
              className="flex-1 min-w-0 w-0 object-cover block h-40 sm:h-56"
            />
          </figure>
        </section>

        <section className="space-y-5 mb-16">
          <p className="leading-relaxed">
            That story stayed with me.
          </p>
          <p className="leading-relaxed">
            As a kid I discovered it through a video game:{" "}
            <strong className="text-gray-200">Midnight Club: DUB Edition</strong>.
            I didn’t know there was a real story behind it. I only knew I wanted
            to win, and that winning in that game demanded something different:
            not chaos, but precision.
          </p>
          <figure className="w-full  sm:mx-0 flex gap-0">
            <img
              src="/assets/midnight/11.png"
              alt="Midnight Club 3: DUB Edition — portada o pantalla del juego"
              className="flex-1 min-w-0 w-0 object-cover block h-40 sm:h-56"
            />
            <img
              src="/assets/midnight/10.jpg"
              alt="Midnight Club 3: DUB Edition — carrera callejera en el juego"
              className="flex-1 min-w-0 w-0 object-cover block h-40 sm:h-56"
            />
          </figure>
          <p className="leading-relaxed">
            Years later, when I built IPTRADE, without thinking about it
            consciously, the principles of the Mid Night Club became the
            principles of the software.
          </p>
        </section>

        <section className="space-y-6 mb-16">
          <figure className="w-full sm:mx-0 flex gap-0 mb-6">
            <img
              src="/assets/midnight/04.jpg"
              alt="Porsche wide-body tuner rosa con calcomanías Mid Night y WARM Yokohama Body Works, coche de la cultura Wangan"
              className="flex-1 min-w-0 w-0 object-cover block h-40 sm:h-56"
            />
            <img
              src="/assets/midnight/12.png"
              alt="Display digital: temperatura agua, 328 km/h, presión de aceite — métricas de rendimiento"
              className="flex-1 min-w-0 w-0 object-cover block h-40 sm:h-56"
            />
          </figure>
          <h2 className="text-xl sm:text-2xl text-white ">
            The philosophy of IPTRADE is the philosophy of the Wangan.
          </h2>

          <div className="space-y-6 border-l-2 border-gray-700 pl-6">
            <div>
              <p className="font-medium text-gray-200 mb-1">
                Real speed, not perceived speed.
              </p>
              <p className="leading-relaxed text-gray-400">
                Traders don’t need the illusion of speed — they need execution
                in milliseconds. A trade copied late isn’t a copied trade. It’s
                a missed opportunity disguised as a filled order.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-200 mb-1">
                One IP. One identity.
              </p>
              <p className="leading-relaxed text-gray-400">
                The Mid Night Club never exposed its members. No cameras, no
                fanfare, no exposure. IPTRADE runs entirely on your machine.
                Your strategy, your IP, your server. The outside world doesn’t
                need to know.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-200 mb-1">
                Discipline over raw speed.
              </p>
              <p className="leading-relaxed text-gray-400">
                The club’s cars weren’t the fastest in the world on a track.
                They were the most reliable at impossible speeds. IPTRADE
                doesn’t promise magic — it promises consistency. Zero cloud
                latency. Zero data leaving for external servers. Zero
                dependencies that can fail at 2 a.m. when the market moves.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-200 mb-1">
                Rules that protect.
              </p>
              <p className="leading-relaxed text-gray-400">
                Mid Night had a sacred rule: if the road isn’t clear, you don’t
                run. IPTRADE gives you the control to run only when your setup
                is right: one IP for all accounts, local execution, and sizing
                you choose. Single IP by design—so you can meet typical prop firm IP rules; verify each firm’s terms.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-200 mb-1">
                Only those who are ready get in.
              </p>
              <p className="leading-relaxed text-gray-400">
                Not everyone got into the club. There was a year of training,
                mandatory meetings, real tests. IPTRADE isn’t for every trader —
                it’s for those who understand that infrastructure matters as
                much as strategy.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-5 mb-16">
          <p className="leading-relaxed">
            The kanji <span className="text-white font-medium">瞬写</span> you
            see in the app isn’t decoration.
          </p>
          <p className="leading-relaxed">
            It means <strong className="text-gray-200">instant capture</strong>.
            The exact moment the master executes and the slave is already
            executing. No middlemen. No cloud. No delay.
          </p>
          <p className="leading-relaxed">
            It’s the same moment the Wangan drivers chased at 300 km/h under
            Tokyo’s lights — that instant where preparation becomes result.
          </p>
          <p className="leading-relaxed text-gray-200">
            IPTRADE is that. Built from that obsession.
          </p>
        </section>


        <figure className="w-full flex justify-center pt-24 pb-6">
          <div className="aspect-square w-full max-w-md overflow-hidden">
            <img
              src="/assets/midnight/giphy.gif"
              alt="Coche destapado, revelación bajo la funda"
              className="w-full h-full object-cover block"
            />
          </div>
        </figure>

        <div className="flex justify-center pt-6 pb-36">
          <Link
            href="/"
            className="text-5xl text-white underline hover:text-gray-400"
          >
            DISCOVER IPTRADE
          </Link>
        </div>
        <hr className="border-t border-gray-800 mb-6" />

        <section className="space-y-6 mb-16">
          <h2 className="text-xl sm:text-2xl text-white ">
            More about Mid Night
          </h2>
          <p className="text-gray-400 leading-relaxed">
            The cars and the runs you see in the video below weren’t driven by
            amateurs. The people behind them were engineers and tuners who treated
            speed as a discipline — the same spirit that inspired this page.
          </p>
          <div className="w-full  sm:mx-0 overflow-hidden aspect-video bg-black/50">
            <iframe
              src="https://www.youtube.com/embed/0HPF-Rf69Ss?start=32"
              title="Mid Night Club / Wangan documentary"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full block"
            />
          </div>
          <p className="text-gray-400 leading-relaxed text-sm">
            The man in the images below is{" "}
            <strong className="text-gray-200">Kazuhiko &ldquo;Smokey&rdquo; Nagata</strong> —
            founder of Top Secret Japan, the shop that built some of the most
            extreme street-legal cars to run the Wangan. He and a handful of
            others reached a level of preparation and restraint that almost no
            one could match: no cameras, no sponsors, no records for fame — only
            the requirement to hold speed, safely, when it mattered. Professionals.
          </p>
          <figure className="w-full  sm:mx-0 flex gap-0">
            <img
              src="/assets/midnight/09.jpg"
              alt="Kazuhiko Smokey Nagata, fundador de Top Secret Japan, delante del garaje con un Nissan R32 GT-R"
              className="flex-1 min-w-0 w-0 object-cover block h-40 sm:h-56"
            />
            <img
              src="/assets/midnight/52c938ee6116136a0dee3e9c00ff8eb0.jpg"
              alt="Kazuhiko Smokey Nagata con un coche Top Secret / Mo Power"
              className="flex-1 min-w-0 w-0 object-cover block h-40 sm:h-56"
            />
          </figure>
          <p className="text-gray-400 leading-relaxed text-sm mt-4">
            Gameplay — Midnight Club 3: DUB Remix Tokyo:
          </p>
          <div className="w-full  sm:mx-0 overflow-hidden aspect-video bg-black/50">
            <iframe
              src="https://www.youtube.com/embed/8INg5cCdnOE"
              title="Midnight Club 3: DUB Remix Tokyo — gameplay"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full block"
            />
          </div>
          <p className="text-gray-400 leading-relaxed text-sm mt-4">
            <strong className="text-gray-200">Midnight Club</strong> is a street
            racing series by Rockstar Games. You race at night in real cities —
            no tracks, no rules beyond the road — and the goal is simple: get
            from point A to point B faster than anyone else. The third game,{" "}
            <em>DUB Edition</em> (2005), added customisation with DUB Magazine
            and real tuner brands; the <em>DUB Remix</em> version added Tokyo as
            a playable city, directly linking the game to the Wangan and the
            culture that inspired it. The name wasn’t a coincidence: the series
            drew from the same world of underground speed that the real Mid Night
            Club embodied — late-night runs, tuned cars, and the idea that the
            best races are the ones nobody official ever sees.
          </p>
        </section>

        <footer className="pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm mb-8">
            — Joaquin Metayer, Founder
          </p>
          <blockquote className="text-lg sm:text-xl text-gray-400 italic leading-relaxed">
            &ldquo;We don’t run for fame. We run because precision, when
            absolute, becomes art.&rdquo;
          </blockquote>
        </footer>
      </article>
    </div>
    </MidnightIntro>
  );
}
