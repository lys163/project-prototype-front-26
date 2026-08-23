import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, BarChart3, LineChart } from "lucide-react";
import { isLoggedIn } from "../lib/auth";
import { fetchBookMonthlySales, fetchMyBookPerformance, fetchMyRevenue, type BookPerformanceItem } from "../lib/api";

const monthLabels = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

const AuthorRevenuePage = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyRevenues, setMonthlyRevenues] = useState<number[]>(Array(12).fill(0));
  const [books, setBooks] = useState<BookPerformanceItem[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [monthlySales, setMonthlySales] = useState<number[]>(Array(12).fill(0));

  useEffect(() => {
    if (!isLoggedIn()) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    fetchMyRevenue(selectedYear)
      .then((data) => {
        if (cancelled) return;
        const next = Array(12).fill(0);
        data.monthlyRevenues.forEach((item) => {
          if (item.month >= 1 && item.month <= 12) next[item.month - 1] = item.totalRevenue;
        });
        setMonthlyRevenues(next);
      })
      .catch(() => {
        if (!cancelled) setMonthlyRevenues(Array(12).fill(0));
      });
    return () => {
      cancelled = true;
    };
  }, [selectedYear]);

  useEffect(() => {
    let cancelled = false;
    fetchMyBookPerformance(0, 100)
      .then((data) => {
        if (cancelled) return;
        setBooks(data.items);
        setSelectedBookId((prev) => prev || data.items[0]?.bookId || "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedBookId) {
      setMonthlySales(Array(12).fill(0));
      return;
    }
    let cancelled = false;
    fetchBookMonthlySales(selectedBookId, selectedYear)
      .then((data) => {
        if (cancelled) return;
        const next = Array(12).fill(0);
        data.monthlySales.forEach((item) => {
          if (item.month >= 1 && item.month <= 12) next[item.month - 1] = item.salesCount;
        });
        setMonthlySales(next);
      })
      .catch(() => {
        if (!cancelled) setMonthlySales(Array(12).fill(0));
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBookId, selectedYear]);

  const revenueData = useMemo(
    () => monthLabels.map((month, index) => ({ month, revenue: monthlyRevenues[index] })),
    [monthlyRevenues],
  );

  const salesData = useMemo(
    () => monthLabels.map((month, index) => ({ month, count: monthlySales[index] })),
    [monthlySales],
  );

  const maxMonthlyRevenue = Math.max(1, ...revenueData.map((item) => item.revenue));
  const maxMonthlySales = Math.max(1, ...salesData.map((item) => item.count));

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/author")}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold text-on-surface">수익 분석</h1>
            <p className="text-on-surface-variant text-sm md:text-base">월별 수익을 확인해보세요</p>
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 border border-outline-variant/20"
        >
          <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-primary" />
            월별 수익 그래프
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => setSelectedYear((prev) => prev - 1)}
              className="w-9 h-9 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors"
              aria-label="이전 연도"
            >
              {"<"}
            </button>
            <p className="text-lg md:text-xl font-headline font-bold text-on-surface min-w-20 text-center">
              {selectedYear}
            </p>
            <button
              type="button"
              onClick={() => setSelectedYear((prev) => prev + 1)}
              className="w-9 h-9 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors"
              aria-label="다음 연도"
            >
              {">"}
            </button>
          </div>
          <div className="h-72 flex items-end gap-2 md:gap-3">
            {revenueData.map((item, index) => {
              const heightRatio = (item.revenue / maxMonthlyRevenue) * 100;
              return (
                <div key={`${selectedYear}-${item.month}`} className="flex-1 h-full flex flex-col justify-end items-center">
                  <p className="text-[10px] md:text-xs text-on-surface-variant mb-2">{item.revenue.toLocaleString()}원</p>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.06 }}
                    style={{ transformOrigin: "bottom", height: `${Math.max(heightRatio, 8)}%` }}
                    className="w-full max-w-14 rounded-t-xl bg-gradient-to-t from-primary to-secondary shadow-sm"
                  />
                  <p className="text-xs md:text-sm text-on-surface-variant mt-2">{item.month}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 border border-outline-variant/20"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
              <LineChart size={20} className="text-primary" />
              작품별 월 판매 건수
            </h2>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              disabled={books.length === 0}
              className="w-full md:w-72 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              aria-label="작품 선택"
            >
              {books.length === 0 ? (
                <option value="">등록된 작품이 없어요</option>
              ) : (
                books.map((book) => (
                  <option key={book.bookId} value={book.bookId}>
                    {book.title}
                  </option>
                ))
              )}
            </select>
          </div>
          <p className="text-sm text-on-surface-variant mb-6">{selectedYear}년 월별 판매 건수입니다.</p>
          <div className="h-72 flex items-end gap-2 md:gap-3">
            {salesData.map((item, index) => {
              const heightRatio = (item.count / maxMonthlySales) * 100;
              return (
                <div key={`sales-${selectedYear}-${item.month}`} className="flex-1 h-full flex flex-col justify-end items-center">
                  <p className="text-[10px] md:text-xs text-on-surface-variant mb-2">{item.count.toLocaleString()}건</p>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.06 }}
                    style={{ transformOrigin: "bottom", height: `${Math.max(heightRatio, 8)}%` }}
                    className="w-full max-w-14 rounded-t-xl bg-gradient-to-t from-secondary to-primary shadow-sm"
                  />
                  <p className="text-xs md:text-sm text-on-surface-variant mt-2">{item.month}</p>
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AuthorRevenuePage;
