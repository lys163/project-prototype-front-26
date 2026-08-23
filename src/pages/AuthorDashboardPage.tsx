import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  BookOpen,
  DollarSign,
  Eye,
  TrendingUp,
  Star,
  ArrowLeft,
  PenTool,
  BarChart3,
} from "lucide-react";
import { isLoggedIn } from "../lib/auth";
import {
  fetchMySummary,
  fetchMyBookPerformance,
  type AuthorSummary,
  type BookPerformanceItem,
} from "../lib/api";

type PerformanceSort = "title" | "viewCount" | "likeCount" | "averageRating" | "totalRevenue";
type SortOrder = "asc" | "desc";

const AuthorDashboardPage = () => {
  const navigate = useNavigate();
  const [performanceSort, setPerformanceSort] = useState<PerformanceSort>("viewCount");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [summary, setSummary] = useState<AuthorSummary | null>(null);
  const [books, setBooks] = useState<BookPerformanceItem[]>([]);

  useEffect(() => {
    if (!isLoggedIn()) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    fetchMySummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {});
    fetchMyBookPerformance(0, 10)
      .then((data) => {
        if (!cancelled) setBooks(data.items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedBooks = useMemo(() => {
    const orderFactor = sortOrder === "asc" ? 1 : -1;
    if (performanceSort === "title") {
      return [...books].sort((a, b) => a.title.localeCompare(b.title) * orderFactor);
    }
    return [...books].sort((a, b) => (a[performanceSort] - b[performanceSort]) * orderFactor);
  }, [books, performanceSort, sortOrder]);

  const onClickSortHeader = (key: PerformanceSort) => {
    if (performanceSort === key) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
      return;
    }
    setPerformanceSort(key);
    setSortOrder(key === "title" ? "asc" : "desc");
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
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold text-on-surface">작가로서의 활동 기록</h1>
            <p className="text-on-surface-variant text-sm md:text-base">작품 성과와 수익을 확인해보세요</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            onClick={() => navigate("/dashboard/author/revenue")}
            className="bg-gradient-to-br from-primary to-primary-container rounded-3xl p-8 text-on-primary cursor-pointer"
          >
            <DollarSign size={28} className="mb-3" />
            <p className="text-on-primary/70 text-sm">총 수익</p>
            <p className="text-4xl font-headline font-extrabold mt-1">{(summary?.totalRevenue ?? 0).toLocaleString()}원</p>
            <div className="flex items-center gap-2 mt-3 text-on-primary/80 text-sm">
              <TrendingUp size={14} />
              이번 달 +{(summary?.monthlyRevenue ?? 0).toLocaleString()}원
            </div>
            <p className="mt-4 text-xs text-on-primary/80">클릭해서 월별/작품별 수익 그래프 보기</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {([
              { label: "출판 작품", value: summary?.publishedBookCount ?? 0, icon: BookOpen, to: "/library?tab=completed" },
              { label: "작성 중", value: summary?.inProgressBookCount ?? 0, icon: PenTool, to: "/library?tab=working" },
              { label: "총 조회수", value: (summary?.totalViewCount ?? 0).toLocaleString(), icon: Eye },
              { label: "평균 평점", value: summary?.averageBookRating ?? 0, icon: Star },
            ] as Array<{ label: string; value: string | number; icon: typeof BookOpen; to?: string }>).map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={stat.to ? () => navigate(stat.to as string) : undefined}
                role={stat.to ? "button" : undefined}
                className={`bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20 ${
                  stat.to ? "cursor-pointer hover:border-primary/40 hover:bg-surface-container transition-colors" : ""
                }`}
              >
                <stat.icon size={18} className="text-primary mb-2" />
                <p className="text-xl font-headline font-bold text-on-surface">{stat.value}</p>
                <p className="text-xs text-on-surface-variant">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
              <BarChart3 size={20} className="text-primary" />
              작품별 성과
            </h2>
          </div>

          <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-3 text-sm md:text-base font-bold text-on-surface-variant uppercase tracking-wider">
            {([
              { key: "title", label: "작품", className: "col-span-4 text-left" },
              { key: "viewCount", label: "조회수", className: "col-span-2 text-right" },
              { key: "likeCount", label: "좋아요", className: "col-span-2 text-right" },
              { key: "averageRating", label: "평점", className: "col-span-2 text-right" },
              { key: "totalRevenue", label: "수익", className: "col-span-2 text-right" },
            ] as const).map((header) => (
              <button
                key={header.key}
                type="button"
                onClick={() => onClickSortHeader(header.key)}
                className={`${header.className} hover:text-on-surface transition-colors ${
                  performanceSort === header.key ? "text-primary" : ""
                }`}
              >
                <span className="inline-flex items-center gap-1">{header.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {sortedBooks.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant text-sm">아직 등록된 작품이 없어요.</div>
            ) : (
              sortedBooks.map((book, i) => (
                <motion.div
                  key={book.bookId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/book/${book.bookId}`)}
                  role="button"
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors items-center cursor-pointer"
                >
                  <div className="md:col-span-4 flex items-center gap-3">
                    <span className="text-sm font-bold text-on-surface-variant w-6">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-on-surface truncate">{book.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {book.visibility === "PUBLIC" ? (
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Eye size={8} /> 공개
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">
                            비공개
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 md:text-right flex md:block items-center gap-2">
                    <span className="md:hidden text-xs text-on-surface-variant">조회수</span>
                    <p className="font-bold text-on-surface">{book.viewCount.toLocaleString()}</p>
                  </div>
                  <div className="md:col-span-2 md:text-right flex md:block items-center gap-2">
                    <span className="md:hidden text-xs text-on-surface-variant">좋아요</span>
                    <p className="font-bold text-on-surface">{book.likeCount}</p>
                  </div>
                  <div className="md:col-span-2 md:text-right flex md:block items-center gap-2">
                    <span className="md:hidden text-xs text-on-surface-variant">평점</span>
                    <p className="font-bold text-on-surface flex items-center gap-1 md:justify-end">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" /> {book.averageRating}
                    </p>
                  </div>
                  <div className="md:col-span-2 md:text-right flex md:block items-center gap-2">
                    <span className="md:hidden text-xs text-on-surface-variant">수익</span>
                    <p className="font-bold text-on-surface">{book.totalRevenue > 0 ? `${book.totalRevenue.toLocaleString()}원` : "-"}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            to="/create"
            className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-bold shadow-xl hover:shadow-primary/25 hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            <PenTool size={18} />
            새 이야기 만들기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthorDashboardPage;
