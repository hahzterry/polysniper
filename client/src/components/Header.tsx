```tsx
import { Clock, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', {
      hour12: false,
      timeZone: 'America/New_York',
    })
  );

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour12: false,
          timeZone: 'America/New_York',
        })
      );
    };

    updateTime();

    const interval = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="flex flex-col gap-4 border-b border-white/10 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
          <Activity className="h-6 w-6 text-white" />
        </div>

        <div>
          <h1 className="text-2xl font-black leading-none tracking-tight text-white sm:text-3xl">
            Poly<span className="text-blue-400">Sniper</span>
          </h1>

          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 sm:text-xs">
            NBA Prediction Intelligence
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
          <Clock className="h-4 w-4 shrink-0 text-cyan-400" />

          <div>
            <span className="mr-2 text-xs text-gray-400">
              Eastern Time
            </span>

            <time
              className="font-mono font-semibold tabular-nums text-white"
              aria-label={`Current Eastern Time: ${currentTime}`}
            >
              {currentTime}
            </time>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/[0.07] px-3 py-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(184,255,79,0.65)]" />
          </span>

          <span className="text-[10px] font-extrabold uppercase tracking-wider text-lime-300 sm:text-xs">
            System Online
          </span>
        </div>
      </div>
    </header>
  );
}
```
