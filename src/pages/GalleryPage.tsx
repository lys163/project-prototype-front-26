import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BookOpen, Search, SlidersHorizontal, X, Heart } from "lucide-react";
import { addBookLike, fetchBooks, fetchCategories, removeBookLike, type BookItem, type CategoryItem } from "../lib/api";
import { isLoggedIn } from "../lib/auth";

const PAGE_SIZE = 12;
type SortOption = "newest" | "titleAsc" | "titleDesc";

type LikeLoadingMap = Record<string, boolean>;

const GalleryPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [likeLoadingMap, setLikeLoadingMap] = useState<LikeLoadingMap>({});
  const [likeErrorMessage, setLikeErrorMessage] = useState<string | null>(null);

  const observerRef = useRef<HTMLDivElement>(null);
  const animatedIdsRef = useRef<Set<string>>(new Set());
  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const loadedPagesRef = useRef<Set<number>>(new Set());
  const categoryRef = useRef<number | "all">("all");
  const likeErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadMore = useCallback(async () => {
    const targetPage = pageRef.current;
    if (loadingRef.current || !hasMoreRef.current) return;
    if (loadedPagesRef.current.has(targetPage)) return;

    const requestCategory = categoryRef.current;
    loadingRef.current = true;
    setLoading(true);
    try {
      loadedPagesRef.current.add(targetPage);
      const categoryId = requestCategory === "all" ? undefined : requestCategory;
      const data = await fetchBooks(targetPage, PAGE_SIZE, categoryId);
      if (categoryRef.current !== requestCategory) return; // 카테고리 변경됨 → 결과 폐기

      setBooks((prev) => {
        const map = new Map(prev.map((b) => [b.bookId, b]));
        data.items.forEach((b) => map.set(b.bookId, b));
        return Array.from(map.values());
      });

      const nextHasMore = !data.last;
      hasMoreRef.current = nextHasMore;
      setHasMore(nextHasMore);
      if (nextHasMore) {
        pageRef.current = targetPage + 1;
      }
    } catch {
      if (categoryRef.current === requestCategory) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } finally {
      if (categoryRef.current === requestCategory) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    categoryRef.current = selectedCategory;
    pageRef.current = 0;
    loadedPagesRef.current = new Set();
    hasMoreRef.current = true;
    loadingRef.current = false;
    animatedIdsRef.current = new Set();
    setBooks([]);
    setHasMore(true);
    loadMore();
  }, [selectedCategory, loadMore]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    return () => {
      if (likeErrorTimerRef.current) clearTimeout(likeErrorTimerRef.current);
    };
  }, []);

  const visibleBooks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let result = books;

    if (normalized) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(normalized) ||
          (book.authorName ?? "").toLowerCase().includes(normalized)
      );
    }

    if (sort === "titleAsc") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "titleDesc") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [books, query, sort]);

  const isSearching = query.trim().length > 0;

  const toggleLike = async (bookId: string) => {
    if (likeLoadingMap[bookId]) return;

    if (!isLoggedIn()) {
      if (window.confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }

    const book = books.find((b) => b.bookId === bookId);
    const liked = book?.liked ?? false;

    setLikeLoadingMap((prev) => ({ ...prev, [bookId]: true }));

    try {
      const status = liked ? await removeBookLike(bookId) : await addBookLike(bookId);
      setBooks((prev) => prev.map((b) => (b.bookId === bookId ? { ...b, liked: status.likedByMe } : b)));
    } catch (error) {
      setLikeErrorMessage(error instanceof Error ? error.message : "좋아요 처리에 실패했습니다.");
      if (likeErrorTimerRef.current) clearTimeout(likeErrorTimerRef.current);
      likeErrorTimerRef.current = setTimeout(() => setLikeErrorMessage(null), 2500);
    } finally {
      setLikeLoadingMap((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-extrabold leading-tight tracking-tight text-on-surface">
            무한한 이야기의 세계, <br />
            <span className="text-primary italic">갤러리</span>에서 완성해요
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg max-w-xl">
            우리 커뮤니티가 만든 AI 생성 이야기를 만나보세요. 동화부터 모험까지 다양한 작품이 준비되어 있어요.
          </p>
        </div>

        <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex gap-2 md:gap-3 px-1 min-w-max">
            {[{ id: "all" as const, name: "전체" }, ...categories].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-primary text-on-primary shadow-lg"
                    : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/20"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-surface-container-lowest rounded-2xl border-2 border-outline-variant/30 focus-within:border-primary transition-colors px-4 md:px-5 py-3 md:py-4 shadow-sm">
            <Search size={20} className="text-on-surface-variant flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목, 작가 검색..."
              className="flex-grow bg-transparent outline-none text-on-surface text-base md:text-lg placeholder:text-on-surface-variant/50 font-body min-w-0"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-on-surface-variant hover:text-on-surface p-1"
                aria-label="검색어 지우기"
              >
                <X size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                showFilters
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
              aria-label="정렬 옵션 열기"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-4 md:p-6 space-y-3"
            >
              <p className="text-sm font-bold text-on-surface">정렬</p>
              <div className="flex flex-wrap gap-2">
                {([
                  { value: "newest", label: "최신순" },
                  { value: "titleAsc", label: "제목 오름차순" },
                  { value: "titleDesc", label: "제목 내림차순" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      sort === opt.value
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <p className="text-sm text-on-surface-variant">
            {isSearching ? `"${query}" 검색 결과` : "전체 작품"} ({visibleBooks.length}개)
          </p>
          {likeErrorMessage && <p className="text-sm text-red-600 font-bold">{likeErrorMessage}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {visibleBooks.map((book, i) => {
            const liked = book.liked ?? false;
            const liking = likeLoadingMap[book.bookId] ?? false;
            const alreadyAnimated = animatedIdsRef.current.has(book.bookId);
            if (!alreadyAnimated) animatedIdsRef.current.add(book.bookId);

            return (
              <motion.div
                key={book.bookId}
                initial={alreadyAnimated ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: alreadyAnimated ? 0 : (i % 4) * 0.05 }}
                className="group cursor-pointer"
              >
                <div className="flex flex-row sm:flex-col gap-4 sm:gap-0">
                  <div className="relative w-1/3 sm:w-full aspect-[3/4] sm:mb-4 group-hover:-translate-y-2 transition-transform duration-500 flex-shrink-0">
                    <Link
                      to={`/book/${book.bookId}`}
                      className="absolute inset-0 rounded-2xl overflow-hidden book-shadow"
                    >
                      {book.coverImageUrl ? (
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant/50">
                          <BookOpen size={40} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary scale-0 group-hover:scale-100 transition-transform duration-500">
                          <BookOpen size={32} />
                        </div>
                      </div>

                      {book.price != null && book.price > 0 && (
                        <span className="absolute top-2 left-2 z-30 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-on-primary shadow-md">
                          {book.price.toLocaleString()}원
                        </span>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        void toggleLike(book.bookId);
                      }}
                      disabled={liking}
                      className={`absolute right-2 bottom-2 z-30 w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-sm transition-all ${
                        liked
                          ? "bg-rose-500/95 border-rose-400 text-white"
                          : "bg-white/90 border-white text-rose-500 hover:bg-white"
                      } ${liking ? "opacity-70" : ""}`}
                      aria-label={liked ? "좋아요 취소" : "좋아요"}
                    >
                      <Heart size={18} className={liked ? "fill-current" : ""} />
                    </button>
                  </div>

                  <Link
                    to={`/book/${book.bookId}`}
                    className="flex flex-col justify-center sm:justify-start flex-grow min-w-0"
                  >
                    <h3 className="text-base sm:text-lg md:text-xl font-bold group-hover:text-primary transition-colors truncate sm:whitespace-normal">{book.title}</h3>
                    <p className="text-on-surface-variant text-xs sm:text-sm font-medium">{book.authorName} 작가</p>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {visibleBooks.length === 0 && !loading && (
          <div className="text-center py-16 space-y-3">
            <Search size={44} className="mx-auto text-on-surface-variant/30" />
            <p className="text-on-surface-variant text-lg">검색 결과가 없습니다.</p>
            <p className="text-on-surface-variant/70 text-sm">다른 키워드로 검색해보세요.</p>
          </div>
        )}

        <div ref={observerRef} className="h-10 flex items-center justify-center">
          {loading && <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>

        {isSearching && hasMore && (
          <p className="text-center text-xs text-on-surface-variant/70">
            다음 페이지를 불러오는 중입니다. 검색 결과도 계속 확장돼요.
          </p>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
