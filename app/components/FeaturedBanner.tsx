import Link from "next/link";
import type { Game } from "../lib/types";
import { slugify } from "../lib/slug";
import RefreshButton from "./RefreshButton";

const STAR_POINTS =
  "50.0,0.0 57.4,12.7 69.1,3.8 71.1,18.4 85.4,14.6 81.6,28.9 96.2,30.9 87.3,42.6 100.0,50.0 87.3,57.4 96.2,69.1 81.6,71.1 85.4,85.4 71.1,81.6 69.1,96.2 57.4,87.3 50.0,100.0 42.6,87.3 30.9,96.2 28.9,81.6 14.6,85.4 18.4,71.1 3.8,69.1 12.7,57.4 0.0,50.0 12.7,42.6 3.8,30.9 18.4,28.9 14.6,14.6 28.9,18.4 30.9,3.8 42.6,12.7";

/** Red starburst badge shown while a game's result is still pending. */
function WaitStar() {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Result awaited"
      className="animate-blink h-14 w-14 sm:h-16 sm:w-16"
    >
      <polygon points={STAR_POINTS} fill="#e60000" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize="22"
        fontWeight="bold"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        WAIT
      </text>
    </svg>
  );
}

/** Small green "yesterday → today" arrow. */
function ResultArrow() {
  return (
    <span
      aria-hidden
      className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-green-600 text-base leading-none font-bold text-white"
    >
      →
    </span>
  );
}

function LiveGame({ game, result }: { game: Game; result: string | undefined }) {
  return (
    <div className="py-2">
      <Link
        href={`/game/${slugify(game.name)}`}
        className="text-2xl font-extrabold tracking-wide text-white uppercase hover:underline sm:text-3xl"
      >
        {game.name}
      </Link>
      <div className="mt-2 flex justify-center">
        {result ? (
          <span className="animate-blink text-4xl leading-none font-black text-white sm:text-5xl">
            {result}
          </span>
        ) : (
          <WaitStar />
        )}
      </div>
    </div>
  );
}

export default function FeaturedBanner({
  siteName,
  tagline,
  liveGames,
  featured,
  today,
  yesterday,
}: {
  siteName: string;
  tagline: string;
  /** Games shown in the black live board, in admin order. */
  liveGames: Game[];
  /** Game highlighted in the yellow band below the board. */
  featured: Game | null;
  today: Record<string, string>;
  yesterday: Record<string, string>;
}) {
  return (
    <section>
      {/* Site-name band: black rules top and bottom frame the yellow strip.
          The title blinks via opacity/visibility, so the band keeps its height
          through the hidden half and nothing below it shifts. */}
      <div className="border-y-4 border-black bg-satta-yellow px-3 py-3 text-center">
        <h1 className="animate-blink text-3xl leading-none font-extrabold tracking-wide text-black uppercase sm:text-5xl">
          {siteName}
        </h1>
      </div>

      <div className="bg-black px-3 py-4 text-center">
        {tagline && <p className="text-lg font-bold text-white sm:text-xl">{tagline}</p>}
        <div className="mt-3 space-y-3">
          {liveGames.map((g) => (
            <LiveGame key={g.id} game={g} result={today[g.id]} />
          ))}
        </div>
      </div>

      {featured && (
        <div className="relative bg-satta-yellow px-3 py-3 text-center">
          <Link
            href={`/game/${slugify(featured.name)}`}
            className="text-xl font-bold tracking-wide text-black uppercase hover:underline"
          >
            {featured.name}
          </Link>
          <div className="mt-0.5 text-sm font-semibold text-black/80">{featured.time}</div>
          <div className="mt-1 flex items-center justify-center gap-2 text-2xl font-black text-black sm:text-3xl">
            <span>{yesterday[featured.id] ?? "--"}</span>
            <ResultArrow />
            <span>{today[featured.id] ?? "--"}</span>
          </div>
          <div className="mt-3 flex justify-center sm:absolute sm:top-1/2 sm:right-3 sm:mt-0 sm:-translate-y-1/2">
            <RefreshButton />
          </div>
        </div>
      )}
    </section>
  );
}
