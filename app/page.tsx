import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            ⌚️ WatchCraft: The Time Is Yours
          </h1>
          <p className="text-blue-200 max-w-2xl mx-auto">
            A strategy-focused game where watches aren't just for telling
            time—they're tools, keys, weapons, and the difference between
            success and failure.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-blue-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              How To Play
            </h2>
            <ul className="list-disc list-inside text-blue-200 space-y-2">
              <li>Complete missions to earn money and watches</li>
              <li>Choose the right watches for each mission</li>
              <li>Buy and sell watches to optimize your collection</li>
              <li>Unlock all levels and complete the final showdown</li>
            </ul>
          </div>

          <div className="bg-blue-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Watch Properties
            </h2>
            <ul className="text-blue-200 space-y-2">
              <li>
                <span className="text-yellow-400">NightGlow:</span> Visibility
                in dark areas
              </li>
              <li>
                <span className="text-yellow-400">Waterproof:</span>{" "}
                Functionality in wet environments
              </li>
              <li>
                <span className="text-yellow-400">Tech:</span> Hacking and
                digital interface capabilities
              </li>
              <li>
                <span className="text-yellow-400">Style:</span> Social
                acceptance in high-society settings
              </li>
              <li>
                <span className="text-yellow-400">Durability:</span> Resistance
                to damage in harsh conditions
              </li>
            </ul>
          </div>
          <div className="bg-blue-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Start Your Journey
            </h2>
            <p className="mb-4 text-blue-200">
              Choose your first watch wisely. Each has unique properties that
              will help you in different missions.
            </p>
            <Link
              href="/game"
              className="block w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold py-3 px-4 rounded text-center transition-colors"
            >
              Begin Adventure
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
