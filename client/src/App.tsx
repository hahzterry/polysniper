import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Header } from "./components/Header";
import { MatchCard } from "./components/MatchCard";
import { PaperTradingPanel } from "./components/PaperTradingPanel";
import { TradeHistory } from "./components/TradeHistory";
const ColorGuide = lazy(() =>
  import("./components/ColorGuide").then((module) => ({
    default: module.ColorGuide,
  })),
);
import { websocketService } from "./services/websocket";
import { fetchMatches } from "./services/api";
import type { UnifiedMatch } from "./types/backend";
import { Info, X, History as HistoryIcon } from "lucide-react";

type FilterType = "all" | "signals" | "live";

// Define types for WebSocket payloads to avoid 'any'
interface MatchesUpdatePayload {
  type: string;
  data: UnifiedMatch[];
}

interface SignalAlertPayload {
  matchId: string;
  signals: any[];
}

function App() {
  const [matches, setMatches] = useState<UnifiedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Filter and sort
  const filteredAndSortedMatches = useMemo(() => {
    let filtered = [...matches];

    if (filter === "signals") {
      filtered = filtered.filter((m) => m.signals.length > 0);
    } else if (filter === "live") {
      filtered = filtered.filter((m) => m.status === "LIVE");
    }

    return filtered.sort((a, b) => {
      const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
      const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
      return timeA - timeB;
    });
  }, [matches, filter]);

  // Group by date (using local timezone instead of hardcoded China timezone)
  const groupedMatches = useMemo(() => {
    const groups: {
      date: string;
      displayDate: string;
      matches: UnifiedMatch[];
      allFinished: boolean;
    }[] = [];
    const dateMap = new Map<string, UnifiedMatch[]>();

    const toLocalDateKey = (timestamp: string | number): string => {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const getToday = (): string => toLocalDateKey(Date.now());
    const getTomorrow = (): string => toLocalDateKey(Date.now() + 24 * 60 * 60 * 1000);

    filteredAndSortedMatches.forEach((match) => {
      if (!match.startTime) return;
      const dateKey = toLocalDateKey(match.startTime);
      if (!dateMap.has(dateKey)) dateMap.set(dateKey, []);
      dateMap.get(dateKey)!.push(match);
    });

    const today = getToday();
    const tomorrow = getTomorrow();

    dateMap.forEach((matches, dateKey) => {
      const allFinished = matches.every((m) => m.status === "FINAL");

      let displayDate = "";
      if (dateKey === today) {
        displayDate = "Today";
      } else if (dateKey === tomorrow) {
        displayDate = "Tomorrow";
      } else {
        const [year, month, day] = dateKey.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weekday = weekdays[date.getDay()];
        displayDate = `${month}/${day} ${weekday}`;
      }

      groups.push({
        date: dateKey,
        displayDate: `${displayDate} (${dateKey})`,
        matches,
        allFinished,
      });
    });

    return groups
      .filter((group) => !group.allFinished)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredAndSortedMatches]);

  // Statistics
  const stats = useMemo(() => {
    const liveCount = matches.filter((m) => m.status === "LIVE").length;
    const withSignals = matches.filter((m) => m.signals.length > 0).length;
    const allSignalsFlat = matches.flatMap((m) => m.signals);
    const buySignals = allSignalsFlat.filter(
      (s) => s.type === "BUY_HOME" || s.type === "BUY_AWAY",
    ).length;
    const sellSignals = allSignalsFlat.filter(
      (s) => s.type === "SELL_HOME" || s.type === "SELL_AWAY",
    ).length;

    return {
      total: matches.length,
      live: liveCount,
      withSignals,
      buySignals,
      sellSignals,
    };
  }, [matches]);

  useEffect(() => {
    console.log("[App] 🚀 Initializing WebSocket connection...");
    websocketService.connect();

    const handleConnect = () => {
      console.log("[App] ✅ WebSocket connected");
      setConnected(true);
      websocketService.subscribe();
    };

    const handleDisconnect = () => {
      console.log("[App] ❌ WebSocket disconnected");
      setConnected(false);
    };

    // 🔥 Removed all console.logs from this hot path for performance
    const handleMatchesUpdate = (data: MatchesUpdatePayload) => {
      setMatches(data.data);
      setLoading(false);
    };

    const handleSignalAlert = (data: SignalAlertPayload) => {
      console.log(
        `[App] 🚨 Arbitrage signal alert - ${data.matchId}:`,
        data.signals.length,
        "signals",
      );
    };

    websocketService.onConnect(handleConnect);
    websocketService.onDisconnect(handleDisconnect);
    websocketService.onMatchesUpdate(handleMatchesUpdate);
    websocketService.onSignalAlert(handleSignalAlert);

    if (websocketService.isConnected()) {
      console.log("[App] 🔗 WebSocket is already connected");
      setConnected(true);
      websocketService.subscribe();
    }

    return () => {
      console.log("[App] 🧹 Cleaning up WebSocket listeners");
      websocketService.off("connect", handleConnect);
      websocketService.off("disconnect", handleDisconnect);
      websocketService.off("matchesUpdate", handleMatchesUpdate);
      websocketService.off("signalAlert", handleSignalAlert);
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      console.log("[App] 🔄 Manually refreshing match data...");
      const data = await fetchMatches();
      setMatches(data);
    } catch (error) {
      console.error("[App] ❌ Refresh failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🧹 Cleaned up empty state logic
  const getEmptyStateMessage = () => {
    if (filter === "signals") return "No matches with active signals.";
    if (filter === "live") return "No live matches right now.";
    if (matches.length > 0 && matches.every((m) => m.status === "FINAL"))
      return "All matches for today have finished.";
    return "No matches available.";
  };

  // 🧹 Mapped filter buttons to reduce duplication
  const filterButtons = [
    { id: "all" as FilterType, label: "All", count: matches.length },
    { id: "signals" as FilterType, label: "Signals", count: stats.withSignals },
    { id: "live" as FilterType, label: "Live", count: stats.live },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/5 bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Header />
            <PaperTradingPanel onClick={() => setShowHistory(true)} />
          </div>
        </div>
      </div>

      {/* Stats & Filter Bar */}
      <div className="border-b border-white/5 bg-surface/30 backdrop-blur-sm sticky top-[72px] z-40">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Stats */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-gray-400 text-sm">Monitored</span>
                <span className="text-white font-bold text-lg">{stats.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-gray-400 text-sm">Live</span>
                <span className="text-green-400 font-bold text-lg">{stats.live}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-gray-400 text-sm">With Signals</span>
                <span className="text-yellow-400 font-bold text-lg">{stats.withSignals}</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Buy</span>
                  <span className="text-green-400 font-bold">{stats.buySignals}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Sell</span>
                  <span className="text-red-400 font-bold">{stats.sellSignals}</span>
                </div>
              </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                {filterButtons.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      filter === f.id
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {f.label} <span className="ml-1 opacity-60">{f.count}</span>
                  </button>
                ))}
              </div>

              <div className="h-8 w-px bg-white/10" />

              <button
                onClick={() => setIsGuideOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 rounded-lg text-sm font-medium transition-all border border-purple-500/20"
              >
                <Info className="w-4 h-4" />
                <span>Strategy Guide</span>
              </button>

              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium transition-all border border-blue-500/20"
              >
                <HistoryIcon className="w-4 h-4" />
                <span>Trade History</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`}
                />
                <span className="text-xs text-gray-400">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                aria-label="Refresh matches"
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "🔄"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-6">
        <div className="mb-6 space-y-8">
          {loading ? (
            <div className="text-center text-gray-500 py-20">
              <div className="inline-block w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
              <div>Loading match data...</div>
            </div>
          ) : groupedMatches.length > 0 ? (
            groupedMatches.map((group) => (
              <div key={group.date} className="space-y-4">
                {/* Date Header */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg px-6 py-3">
                    <div className="text-2xl">📅</div>
                    <div>
                      <div className="text-lg font-bold text-white">
                        {group.displayDate}
                      </div>
                      <div className="text-xs text-gray-400">
                        {group.matches.length} matches
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
                </div>

                {/* Matches Grid */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {group.matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-20">
              <div className="text-4xl mb-4">🏀</div>
              <div className="text-lg mb-2">{getEmptyStateMessage()}</div>
              {matches.length > 0 &&
                matches.every((m) => m.status === "FINAL") && (
                  <div className="text-sm text-gray-600">
                    Completed {matches.length} matches, waiting for tomorrow's schedule
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Right Drawer - Strategy Guide */}
      <div
        className={`fixed inset-y-0 right-0 w-[480px] bg-surface border-l border-white/10 transform transition-transform duration-300 z-[60] overflow-y-auto ${
          isGuideOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Strategy Guide</h2>
          </div>
          <button
            onClick={() => setIsGuideOpen(false)}
            aria-label="Close guide"
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          <Suspense
            fallback={
              <div className="text-gray-400 text-center py-4">
                Loading strategy guide...
              </div>
            }
          >
            <ColorGuide isExpanded={true} onToggle={() => {}} />
          </Suspense>
        </div>
      </div>

      {/* Overlay */}
      {isGuideOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] transition-opacity"
          onClick={() => setIsGuideOpen(false)}
        />
      )}

      {/* Trade History View */}
      {showHistory && <TradeHistory onClose={() => setShowHistory(false)} />}
    </div>
  );
}

export default App;
