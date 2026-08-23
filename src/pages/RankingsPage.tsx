import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Coins, Heart, Trophy } from "lucide-react";
import { motion } from "motion/react";
import {
  fetchBestsellerHighlights,
  fetchMonthlyPopularAuthors,
  fetchMonthlyPopularBooks,
  fetchMonthlyProlificAuthors,
  fetchWeeklyPopularAuthors,
  fetchWeeklyPopularBooks,
  fetchWeeklyProlificAuthors,
  type BestsellerHighlightItem,
  type MonthlyPopularAuthorItem,
  type MonthlyPopularBookItem,
  type MonthlyProlificAuthorItem,
  type WeeklyPopularAuthorItem,
  type WeeklyPopularBookItem,
  type WeeklyProlificAuthorItem,
} from "../lib/api";

type RankingPeriod = "weekly" | "monthly";

type AuthorRankItem = {
  id: string;
  name: string;
  books: number;
  likes: number;
  profileImage?: string;
};

type BookRankItem = {
  id: string;
  title: string;
  author: string;
  likes: number;
  sales: number;
  coverImageUrl?: string | null;
};

type RankingViewData = {
  prolificAuthors: AuthorRankItem[];
  likedAuthors: AuthorRankItem[];
  likedBooks: BookRankItem[];
};

const rankBadge = ["🥇", "🥈", "🥉"];
const podiumOrder = [1, 0, 2] as const;
const fallbackProfileImage = "https://ssl.pstatic.net/static/pwe/address/img_profile.png";
const fallbackCoverImage = "https://picsum.photos/seed/ranking-book-fallback/600/800";

const emptyRankingData = (): RankingViewData => ({
  prolificAuthors: [],
  likedAuthors: [],
  likedBooks: [],
});

const podiumHeightClass: Record<1 | 2 | 3, string> = {
  1: "h-24 md:h-28",
  2: "h-20 md:h-24",
  3: "h-16 md:h-20",
};

const podiumToneClass: Record<1 | 2 | 3, string> = {
  1: "from-amber-300 to-amber-500 text-amber-950",
  2: "from-slate-200 to-slate-400 text-slate-800",
  3: "from-orange-300 to-orange-500 text-orange-950",
};

const periodLabel = (period: RankingPeriod) => (period === "monthly" ? "이달의" : "이번 주");

const getCurrentDateParams = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
};

const mapProlificAuthors = (items: Array<WeeklyProlificAuthorItem | MonthlyProlificAuthorItem>): AuthorRankItem[] =>
  items.slice(0, 3).map((item) => ({
    id: item.userId,
    name: item.nickname,
    books: item.bookCount,
    likes: 0,
    profileImage: item.profileImage,
  }));

const mapPopularAuthors = (items: Array<WeeklyPopularAuthorItem | MonthlyPopularAuthorItem>): AuthorRankItem[] =>
  items.slice(0, 3).map((item) => ({
    id: item.userId,
    name: item.nickname,
    books: 0,
    likes: item.totalLike,
    profileImage: item.profileImage,
  }));

const mapPopularBooks = (items: Array<WeeklyPopularBookItem | MonthlyPopularBookItem>): BookRankItem[] =>
  items.slice(0, 3).map((item) => ({
    id: item.bookId,
    title: item.title,
    author: item.authorNickname,
    likes: item.likeCount,
    sales: 0,
    coverImageUrl: item.coverImageUrl,
  }));

const mapHighlightBooks = (items: BestsellerHighlightItem[]): BookRankItem[] =>
  items.slice(0, 3).map((item) => ({
    id: item.bookId,
    title: item.title,
    author: item.authorName ?? "이름 없음",
    likes: 0,
    sales: item.salesCount,
    coverImageUrl: item.coverImageUrl,
  }));

type AuthorSectionProps = {
  title: string;
  icon: React.ReactNode;
  items: AuthorRankItem[];
  metric: "books" | "likes";
};

const AuthorSection = ({ title, icon, items, metric }: AuthorSectionProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-sm"
    >
      <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2 mb-5">
        {icon}
        {title}
      </h2>

      <div className="flex items-end gap-3 mb-5 min-h-[184px]">
        {podiumOrder.map((index) => {
          const item = items[index];
          if (!item) return <div key={`author-podium-empty-${index}`} className="flex-1" />;
          const rank = (index + 1) as 1 | 2 | 3;

          return (
            <Link key={item.id} to={`/author/${item.id}`} className="group flex-1 min-w-0">
              <div className="mb-2 px-2 py-1 rounded-xl bg-surface-container border border-outline-variant/20 text-center">
                <p className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">{item.name}</p>
              </div>
              <motion.div
                className="mb-2 flex justify-center"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: rank * 0.08 + 0.2 }}
              >
                <img
                  src={item.profileImage || fallbackProfileImage}
                  alt={`${item.name} 프로필`}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white shadow-sm"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
              <motion.div
                className={`rounded-t-2xl bg-gradient-to-b ${podiumToneClass[rank]} ${podiumHeightClass[rank]} flex items-center justify-center shadow-inner`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.55, ease: "easeOut", delay: rank * 0.08 }}
                style={{ transformOrigin: "bottom" }}
              >
                <span className="text-3xl md:text-4xl font-black leading-none">{rank}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="space-y-2">
        {items.length === 0 && <p className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">아직 랭킹 데이터가 없어요.</p>}
        {items.map((item, i) => (
          <Link
            key={item.id}
            to={`/author/${item.id}`}
            className="group rounded-xl bg-surface-container-low border border-outline-variant/15 p-3 flex items-center gap-3 hover:bg-surface-container transition-colors"
          >
            <img
              src={item.profileImage || fallbackProfileImage}
              alt={`${item.name} 프로필`}
              className="w-11 h-11 rounded-full object-cover shrink-0"
              loading="lazy"
              decoding="async"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                {rankBadge[i]} {item.name}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                {metric === "books" ? `작품 ${item.books.toLocaleString()}권` : `좋아요 ${item.likes.toLocaleString()}개`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  );
};

type BookSectionProps = {
  title: string;
  icon: React.ReactNode;
  items: BookRankItem[];
  metric: "likes" | "sales" | "count";
};

const bookMetricLabel = (item: BookRankItem, metric: BookSectionProps["metric"]): string => {
  if (metric === "likes") return `좋아요 ${item.likes.toLocaleString()}개`;
  if (metric === "count") return `판매 ${item.sales.toLocaleString()}건`;
  return `매출 ${item.sales.toLocaleString()}원`;
};

const BookSection = ({ title, icon, items, metric }: BookSectionProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-sm"
    >
      <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2 mb-5">
        {icon}
        {title}
      </h2>

      <div className="flex items-end gap-3 mb-5 min-h-[204px]">
        {podiumOrder.map((index) => {
          const item = items[index];
          if (!item) return <div key={`book-podium-empty-${index}`} className="flex-1" />;
          const rank = (index + 1) as 1 | 2 | 3;

          return (
            <Link key={item.id} to={`/book/${item.id}`} className="group flex-1 min-w-0">
              <div className="mb-2 px-2 py-1 rounded-xl bg-surface-container border border-outline-variant/20 text-center">
                <p className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">{item.title}</p>
              </div>
              <motion.div
                className="mb-2 flex justify-center"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: rank * 0.08 + 0.2 }}
              >
                <img
                  src={item.coverImageUrl || fallbackCoverImage}
                  alt={`${item.title} 표지`}
                  className="w-[64px] h-[84px] md:w-[74px] md:h-[102px] rounded-xl object-cover border-2 border-white shadow-sm"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
              <motion.div
                className={`rounded-t-2xl bg-gradient-to-b ${podiumToneClass[rank]} ${podiumHeightClass[rank]} flex items-center justify-center shadow-inner`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.55, ease: "easeOut", delay: rank * 0.08 }}
                style={{ transformOrigin: "bottom" }}
              >
                <span className="text-3xl md:text-4xl font-black leading-none">{rank}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="space-y-2">
        {items.length === 0 && <p className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">아직 랭킹 데이터가 없어요.</p>}
        {items.map((item, i) => (
          <Link
            key={item.id}
            to={`/book/${item.id}`}
            className="group rounded-xl bg-surface-container-low border border-outline-variant/15 p-3 flex items-center gap-3 hover:bg-surface-container transition-colors"
          >
            <img
              src={item.coverImageUrl || fallbackCoverImage}
              alt={item.title}
              className="w-12 h-16 rounded-lg object-cover shrink-0"
              loading="lazy"
              decoding="async"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                {rankBadge[i]} {item.title}
              </p>
              <p className="text-xs text-on-surface-variant">{item.author} 작가</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{bookMetricLabel(item, metric)}</p>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  );
};

const RankingsPage = () => {
  const [period, setPeriod] = useState<RankingPeriod>("monthly");
  const [rankingMap, setRankingMap] = useState<Record<RankingPeriod, RankingViewData>>({
    weekly: emptyRankingData(),
    monthly: emptyRankingData(),
  });
  const [highlights, setHighlights] = useState<BookRankItem[]>([]);
  const [rankingError, setRankingError] = useState<string | null>(null);
  const isMonthly = period === "monthly";

  useEffect(() => {
    let cancelled = false;
    const { year, month, day } = getCurrentDateParams();

    const loadRankings = async () => {
      try {
        const [weeklyProlific, weeklyPopularAuthors, weeklyPopularBooks, monthlyProlific, monthlyPopularAuthors, monthlyPopularBooks] =
          await Promise.all([
            fetchWeeklyProlificAuthors({ year, month, day }),
            fetchWeeklyPopularAuthors({ year, month, day }),
            fetchWeeklyPopularBooks({ year, month, day }),
            fetchMonthlyProlificAuthors({ year, month }),
            fetchMonthlyPopularAuthors({ year, month }),
            fetchMonthlyPopularBooks({ year, month }),
          ]);

        if (cancelled) return;
        setRankingMap({
          weekly: {
            prolificAuthors: mapProlificAuthors(weeklyProlific),
            likedAuthors: mapPopularAuthors(weeklyPopularAuthors),
            likedBooks: mapPopularBooks(weeklyPopularBooks),
          },
          monthly: {
            prolificAuthors: mapProlificAuthors(monthlyProlific),
            likedAuthors: mapPopularAuthors(monthlyPopularAuthors),
            likedBooks: mapPopularBooks(monthlyPopularBooks),
          },
        });
        setRankingError(null);
      } catch (error) {
        if (cancelled) return;
        setRankingError(error instanceof Error ? error.message : "랭킹 정보를 불러오지 못했습니다.");
      }
    };

    loadRankings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const bestsellerPeriod = period === "weekly" ? "WEEKLY" : "MONTHLY";
    fetchBestsellerHighlights(bestsellerPeriod)
      .then((data) => {
        if (cancelled) return;
        setHighlights(mapHighlightBooks(data.items));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [period]);

  const current = useMemo(() => rankingMap[period], [period, rankingMap]);

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6 bg-[radial-gradient(circle_at_top_right,rgba(63,87,187,0.16),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(59,103,93,0.12),transparent_45%)]">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-gradient-to-br from-primary/15 via-white to-secondary/10 p-7 md:p-10"
        >
          <div className="absolute -right-14 -top-14 w-40 h-40 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />

          <div className="relative space-y-3">
            <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface">랭킹</h1>
            <p className="text-on-surface-variant text-base md:text-lg max-w-2xl">
              {periodLabel(period)} 기준으로 가장 주목받는 작가와 인기 작품 TOP 3를 모아봤어요.
            </p>
            {rankingError && <p className="text-sm font-semibold text-red-600">{rankingError}</p>}
            <div className="pt-2">
              <div className="inline-flex items-center rounded-full p-1 bg-white/75 border border-white/70 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPeriod("weekly")}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    !isMonthly ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  주간
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod("monthly")}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    isMonthly ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  월간
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.div key={period} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <BookSection
            title={`${periodLabel(period)} 베스트셀러`}
            icon={<Coins size={20} className="text-amber-600" />}
            items={highlights}
            metric="count"
          />
          <BookSection
            title={`${periodLabel(period)} 좋아요 책`}
            icon={<Heart size={20} className="text-rose-500" />}
            items={current.likedBooks}
            metric="likes"
          />
          <AuthorSection
            title={`${periodLabel(period)} 다작 작가`}
            icon={<BookOpen size={20} className="text-primary" />}
            items={current.prolificAuthors}
            metric="books"
          />
          <AuthorSection
            title={`${periodLabel(period)} 좋아요 작가`}
            icon={<Trophy size={20} className="text-secondary" />}
            items={current.likedAuthors}
            metric="likes"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default RankingsPage;
