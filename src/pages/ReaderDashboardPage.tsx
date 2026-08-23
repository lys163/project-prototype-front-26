import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { animate, motion } from "motion/react";
import { BookOpen, Clock, TrendingUp, Heart, ArrowLeft, CheckCircle, BookMarked, Target, X } from "lucide-react";
import { isLoggedIn } from "../lib/auth";
import {
  fetchMyReadingProgresses,
  fetchReadingGoal,
  upsertReadingGoal,
  type MyReadingProgressItem,
  type ReadingGoal,
} from "../lib/api";

// TODO: 실제 API 연동
const mockReaderStats = {
  totalRead: 47,
  completedBooks: 32,
  inProgressBooks: 5,
  totalReadingTime: 1260,
  readingStreak: 7,
  likedBooks: 28,
  avgReadingPerDay: 35,
};

const ReaderDashboardPage = () => {
  const navigate = useNavigate();
  const [readingSort, setReadingSort] = useState<"high" | "low" | "recent">("recent");
  const [readingGoal, setReadingGoal] = useState<ReadingGoal>({
    targetCount: null,
    completedCount: 0,
    achievementPercentage: 0,
  });
  const [goalDraft, setGoalDraft] = useState("10");
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [animatedGoalPercent, setAnimatedGoalPercent] = useState(0);
  const animatedGoalPercentRef = useRef(0);
  const [readingItems, setReadingItems] = useState<MyReadingProgressItem[]>([]);
  const [completedItems, setCompletedItems] = useState<MyReadingProgressItem[]>([]);

  useEffect(() => {
    if (!isLoggedIn()) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    if (!isLoggedIn()) return;
    let cancelled = false;

    Promise.allSettled([
      fetchMyReadingProgresses(0, 20, false),
      fetchMyReadingProgresses(0, 20, true),
      fetchReadingGoal(),
    ])
      .then(([reading, all, goal]) => {
        if (cancelled) return;

        setReadingItems(reading.status === "fulfilled" ? reading.value.items ?? [] : []);
        setCompletedItems(
          all.status === "fulfilled" ? (all.value.items ?? []).filter((item) => item.isCompleted).slice(0, 3) : []
        );
        if (goal.status === "fulfilled") {
          setReadingGoal(goal.value);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const monthlyGoal = readingGoal.targetCount;
  const goalPercent = Math.min(100, Math.max(0, Math.round(readingGoal.achievementPercentage)));

  useEffect(() => {
    const controls = animate(animatedGoalPercentRef.current, goalPercent, {
      duration: 0.7,
      ease: "easeOut",
      onUpdate: (value) => {
        const rounded = Math.round(value);
        if (rounded !== animatedGoalPercentRef.current) {
          animatedGoalPercentRef.current = rounded;
          setAnimatedGoalPercent(rounded);
        }
      },
    });
    return () => controls.stop();
  }, [goalPercent]);

  const sortedReadingList = useMemo(() => {
    const list = [...readingItems];

    if (readingSort === "high") {
      return list.sort((a, b) => b.progressPercentage - a.progressPercentage);
    }

    if (readingSort === "low") {
      return list.sort((a, b) => a.progressPercentage - b.progressPercentage);
    }

    return list;
  }, [readingSort, readingItems]);

  const openGoalModal = () => {
    setGoalDraft(String(monthlyGoal ?? 10));
    setGoalError(null);
    setIsGoalModalOpen(true);
  };

  const closeGoalModal = () => {
    setIsGoalModalOpen(false);
  };

  const saveGoal = async () => {
    const parsed = Number(goalDraft);
    if (!Number.isFinite(parsed)) {
      setGoalError("목표를 숫자로 입력해주세요.");
      return;
    }

    const safeValue = Math.round(parsed);
    if (safeValue < 1 || safeValue > 999) {
      setGoalError("목표는 1~999 사이여야 합니다.");
      return;
    }

    setGoalSaving(true);
    setGoalError(null);
    try {
      await upsertReadingGoal(safeValue);
      const nextGoal = await fetchReadingGoal();
      setReadingGoal(nextGoal);
      setIsGoalModalOpen(false);
    } catch (error) {
      setGoalError(error instanceof Error ? error.message : "읽기 목표 저장에 실패했습니다.");
    } finally {
      setGoalSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/start")}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold text-on-surface">독자로서의 독서 기록</h1>
            <p className="text-on-surface-variant text-sm md:text-base">읽기 기록과 진행률을 확인해보세요</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "읽은 책", value: mockReaderStats.totalRead, icon: BookOpen, color: "text-primary" },
            { label: "완독", value: mockReaderStats.completedBooks, icon: CheckCircle, color: "text-secondary" },
            { label: "연속 읽기", value: `${mockReaderStats.readingStreak}일`, icon: TrendingUp, color: "text-tertiary" },
            {
              label: "총 읽기 시간",
              value: `${Math.round(mockReaderStats.totalReadingTime / 60)}시간`,
              icon: Clock,
              color: "text-primary",
            },
            {
              label: "좋아요 한 책",
              value: mockReaderStats.likedBooks,
              icon: Heart,
              color: "text-red-500",
              onClick: () => navigate("/dashboard/reader/liked"),
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 ${
                stat.onClick ? "cursor-pointer hover:bg-surface-container-low transition-colors" : ""
              }`}
              onClick={stat.onClick}
              role={stat.onClick ? "button" : undefined}
              tabIndex={stat.onClick ? 0 : undefined}
              onKeyDown={
                stat.onClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        stat.onClick?.();
                      }
                    }
                  : undefined
              }
            >
              <stat.icon size={20} className={`${stat.color} mb-2`} />
              <p className="text-2xl font-headline font-bold text-on-surface">{stat.value}</p>
              <p className="text-xs text-on-surface-variant">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
                <BookMarked size={20} className="text-primary" />
                읽고 있는 책
              </h2>
              <select
                value={readingSort}
                onChange={(e) => setReadingSort(e.target.value as "high" | "low" | "recent")}
                className="w-full sm:w-auto rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="읽고 있는 책 정렬"
              >
                <option value="high">많이 읽은순</option>
                <option value="low">적게 읽은순</option>
                <option value="recent">최신으로 읽은순</option>
              </select>
            </div>

            <div className="space-y-4">
              {sortedReadingList.map((book) => (
                <Link
                  key={book.bookId}
                  to={`/read/${book.bookId}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">{book.title}</p>
                    <p className="text-xs text-on-surface-variant">{book.authorName ?? "알 수 없는 작가"} · {book.lastReadAt}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-24 h-2.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${book.progressPercentage}%` }} />
                    </div>
                    <span className="text-sm font-bold text-primary w-12 text-right">{book.progressPercentage}%</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <Link to="/library" className="text-sm font-bold text-primary hover:underline">
                더보기
              </Link>
            </div>
          </div>

          <div className="space-y-4 lg:h-full lg:flex lg:flex-col">
            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
                  <Target size={18} className="text-tertiary" />
                  이번 달 목표
                </h3>
                <button
                  type="button"
                  onClick={openGoalModal}
                  className="rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  설정
                </button>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-surface-container" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="currentColor"
                      className="text-tertiary"
                      strokeWidth="3"
                      strokeDasharray={`${animatedGoalPercent} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-on-surface">{animatedGoalPercent}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-headline font-bold text-on-surface">
                    {readingGoal.completedCount}/{monthlyGoal ?? "-"}
                  </p>
                  <p className="text-xs text-on-surface-variant">{monthlyGoal ? "완독 목표" : "목표 미설정"}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 lg:flex-1">
              <h3 className="font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-secondary" />
                최근 완독
              </h3>
              <div className="space-y-3">
                {completedItems.map((book) => (
                  <div key={book.bookId} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-secondary flex-shrink-0" />
                    <div className="min-w-0 flex-grow">
                      <p className="text-sm font-bold text-on-surface truncate">{book.title}</p>
                      <p className="text-xs text-on-surface-variant">{book.lastReadAt}</p>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-yellow-500 text-xs">
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40" onClick={closeGoalModal}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-outline-variant/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-headline font-bold text-on-surface">이번 달 목표 설정</h4>
              <button
                type="button"
                onClick={closeGoalModal}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
                aria-label="닫기"
              >
                <X size={16} />
              </button>
            </div>

            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">완독 목표 권수</label>
            <input
              type="number"
              min={1}
              max={999}
              value={goalDraft}
              onChange={(e) => setGoalDraft(e.target.value)}
              className="mt-2 w-full rounded-xl border border-outline-variant/30 px-4 py-3 text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
            />

            <p className="mt-2 text-xs text-on-surface-variant">1권 ~ 999권 사이로 설정할 수 있어요.</p>
            {goalError && <p className="mt-2 text-xs font-bold text-red-600">{goalError}</p>}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={closeGoalModal}
                disabled={goalSaving}
                className="flex-1 rounded-xl py-3 font-bold border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low"
              >
                취소
              </button>
              <button
                type="button"
                onClick={saveGoal}
                disabled={goalSaving}
                className="flex-1 rounded-xl py-3 font-bold bg-primary text-white hover:bg-secondary disabled:opacity-50"
              >
                {goalSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReaderDashboardPage;
