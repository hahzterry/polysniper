```tsx
import { Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface ColorGuideProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function ColorGuide({ isExpanded, onToggle }: ColorGuideProps) {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-surface transition-all duration-300">
      {isExpanded ? (
        <div className="p-6">
          <button
            type="button"
            className="flex w-full items-center justify-between transition-opacity hover:opacity-80"
            onClick={onToggle}
            aria-expanded={isExpanded}
          >
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-violet-400" />
              <h3 className="text-lg font-bold text-white">
                Strategy Guide
              </h3>
            </div>
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </button>

          <div className="mt-4 space-y-4">
            {/* Core Strategy */}
            <div className="rounded-xl border border-violet-500/40 bg-gradient-to-br from-violet-500/20 to-blue-500/10 p-4">
              <div className="mb-3 flex items-center gap-2 font-semibold text-violet-300">
                <span>🎯</span>
                <span>ESPN Win Probability vs. Polymarket Price</span>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <div className="rounded-lg bg-black/30 p-3">
                  <p className="mb-2 text-center font-mono text-base text-white">
                    Estimated Edge ={' '}
                    <span className="text-cyan-400">ESPN Probability</span>
                    {' - '}
                    <span className="text-violet-400">Market Price</span>
                  </p>
                  <p className="text-center text-sm text-yellow-300">
                    Trigger threshold:{' '}
                    <span className="font-bold">5 percentage points</span>
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p>
                    <span className="text-green-400">● Live games only:</span>{' '}
                    Signals activate only while a game is in progress.
                  </p>
                  <p>
                    <span className="text-blue-400">● One-sided positions:</span>{' '}
                    Consider only the outcome showing a qualifying edge.
                  </p>
                  <p>
                    <span className="text-yellow-300">● Position size:</span>{' '}
                    10% of the account balance per position.
                  </p>
                </div>
              </div>
            </div>

            {/* Worked Example */}
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-green-400">
                <span>📈</span>
                <span>Worked Example</span>
              </div>

              <div className="space-y-2 rounded-lg bg-black/30 p-3 text-sm text-gray-300">
                <p>
                  <span className="text-cyan-400">●</span>{' '}
                  ESPN estimates the Celtics' win probability at{' '}
                  <span className="font-bold text-cyan-300">62%</span>.
                </p>
                <p>
                  <span className="text-violet-400">●</span>{' '}
                  Polymarket lists the Celtics at{' '}
                  <span className="font-bold text-violet-300">$0.54</span>.
                </p>
                <p className="font-semibold text-yellow-300">
                  → Estimated edge: 62% - 54% = 8 percentage points.
                </p>
                <p className="text-green-300">
                  → The signal qualifies because 8 points exceeds the 5-point threshold.
                </p>
                <p className="text-xs text-gray-400">
                  Illustrative example only. A qualifying signal does not guarantee a profitable trade.
                </p>
              </div>
            </div>

            {/* Why Compare These Metrics */}
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-yellow-400">
                <span>💡</span>
                <span>Why Compare These Metrics?</span>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  ESPN's in-game win probability estimates the likelihood of an outcome using game data and a statistical model. Relevant factors may include:
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-black/30 p-2">
                    📊 Current Score
                  </div>
                  <div className="rounded-lg bg-black/30 p-2">
                    ⏱️ Time Remaining
                  </div>
                  <div className="rounded-lg bg-black/30 p-2">
                    📈 Team Performance
                  </div>
                  <div className="rounded-lg bg-black/30 p-2">
                    🏟️ Home Advantage
                  </div>
                </div>

                <p className="mt-2 text-xs text-yellow-200">
                  Market prices reflect trading activity and participants' expectations. Differences between a model estimate and a market price may reveal potential value, but can also result from model error, market fees, liquidity, or stale data.
                </p>
              </div>
            </div>

            {/* Color Legend */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-300">
                🎨 Color Legend
              </h4>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-16 animate-pulse rounded-lg border-2 border-violet-500/50 bg-violet-500/10" />
                  <span className="text-gray-300">
                    Game with a qualifying prediction signal
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-lime-400/10 px-2 py-1 font-bold text-lime-300">
                    Target
                  </span>
                  <span className="text-gray-300">
                    Outcome identified by the signal
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-3 max-w-[120px] flex-1 overflow-hidden rounded-full bg-gray-800">
                    <div className="w-[40%] bg-gradient-to-r from-cyan-500 to-blue-400" />
                    <div className="w-[60%] bg-gradient-to-r from-rose-400 to-rose-500" />
                  </div>
                  <span className="text-gray-300">
                    Relative win probabilities
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-cyan-400/10 px-2 py-1 font-bold text-cyan-300">
                    LIVE
                  </span>
                  <span className="text-gray-300">
                    Game currently in progress
                  </span>
                </div>
              </div>
            </div>

            {/* Exit Strategy */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-300">
                🚪 Exit Strategy
              </h4>

              <div className="space-y-3 text-xs text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-green-400">💰</span>
                  <span>
                    <strong className="text-green-300">Take profit:</strong>{' '}
                    Close the position when the configured profit target reaches 25%.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-yellow-400">📉</span>
                  <span>
                    <strong className="text-yellow-300">Edge disappears:</strong>{' '}
                    Consider exiting when the market price reaches or exceeds the estimated win probability.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-rose-400">🛑</span>
                  <span>
                    <strong className="text-rose-300">Risk limit:</strong>{' '}
                    Close at a market price of $0.15 or lower, or when the configured loss limit reaches 50%.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-cyan-400">🏁</span>
                  <span>
                    <strong className="text-cyan-300">Game ends:</strong>{' '}
                    Apply the configured settlement or exit procedure when the game finishes.
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-gray-400">
                These are strategy settings, not guarantees. Actual execution depends on your trading logic, available liquidity, fees, and whether automated order placement and exits are implemented.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex h-full w-full flex-col items-center justify-center px-2 py-8 transition-colors hover:bg-white/5"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label="Expand strategy guide"
        >
          <ChevronRight className="mb-3 h-5 w-5 text-violet-400" />

          <div className="flex flex-col items-center gap-2">
            <Info className="h-6 w-6 text-violet-400" />
            <span className="writing-mode-vertical whitespace-nowrap text-sm font-bold text-white">
              Strategy Guide
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
```
