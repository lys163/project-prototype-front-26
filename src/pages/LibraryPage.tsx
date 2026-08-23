import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Wand2, Image as ImageIcon, Coins, X } from "lucide-react";
import { fetchMyBooks, fetchMyLikedBooks, publishPaidBook, type LikedBookItem, type MyBookItem } from "../lib/api";
import { isLoggedIn } from "../lib/auth";

type LibraryTab = "working" | "completed" | "liked";

const PAGE_SIZE = 30;

const statusLabel: Record<MyBookItem["status"], string> = {
  DRAFT: "제작중",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
};

const tabLabel: Record<LibraryTab, string> = {
  working: "제작 중인 책",
  completed: "완성된 책",
  liked: "좋아요 한 책",
};

const progressByStatus: Record<MyBookItem["status"], number> = {
  DRAFT: 15,
  IN_PROGRESS: 55,
  COMPLETED: 100,
};

const LibraryPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab: LibraryTab =
    searchParams.get("tab") === "completed" || searchParams.get("tab") === "liked"
      ? (searchParams.get("tab") as LibraryTab)
      : "working";
  const [activeTab, setActiveTab] = useState<LibraryTab>(initialTab);

  const [draftBooks, setDraftBooks] = useState<MyBookItem[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<MyBookItem[]>([]);
  const [completedBooks, setCompletedBooks] = useState<MyBookItem[]>([]);

  const [draftPage, setDraftPage] = useState(0);
  const [inProgressPage, setInProgressPage] = useState(0);
  const [completedPage, setCompletedPage] = useState(0);

  const [hasMoreDraft, setHasMoreDraft] = useState(false);
  const [hasMoreInProgress, setHasMoreInProgress] = useState(false);
  const [hasMoreCompleted, setHasMoreCompleted] = useState(false);

  const [likedBooks, setLikedBooks] = useState<LikedBookItem[]>([]);
  const [likedPage, setLikedPage] = useState(0);
  const [hasMoreLiked, setHasMoreLiked] = useState(false);
  const [likedLoaded, setLikedLoaded] = useState(false);
  const [likedLoading, setLikedLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 유료 출판 모달
  const [publishTarget, setPublishTarget] = useState<MyBookItem | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  const openPublishModal = (book: MyBookItem) => {
    setPublishTarget(book);
    setPriceInput("");
    setPublishError(null);
  };

  const closePublishModal = () => {
    if (publishing) return;
    setPublishTarget(null);
    setPublishError(null);
  };

  const handleConfirmPublish = async () => {
    if (!publishTarget) return;

    const price = Number(priceInput);
    if (!Number.isInteger(price) || price < 1) {
      setPublishError("가격은 1 이상의 정수여야 합니다.");
      return;
    }

    setPublishing(true);
    setPublishError(null);
    try {
      await publishPaidBook(publishTarget.bookId, price);
      setCompletedBooks((prev) =>
        prev.map((b) => (b.bookId === publishTarget.bookId ? { ...b, visibility: "PAID" } : b))
      );
      setPublishSuccess(`'${publishTarget.title}'을(를) ${price.toLocaleString()}원에 유료 출판했어요.`);
      setPublishTarget(null);
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : "유료 출판에 실패했습니다.");
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    if (!publishSuccess) return;
    const timer = setTimeout(() => setPublishSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [publishSuccess]);

  const loadInitial = async () => {
    setLoading(true);
    setError(null);

    try {
      const [draft, inProgress, completed] = await Promise.all([
        fetchMyBooks(0, PAGE_SIZE, "DRAFT"),
        fetchMyBooks(0, PAGE_SIZE, "IN_PROGRESS"),
        fetchMyBooks(0, PAGE_SIZE, "COMPLETED"),
      ]);

      setDraftBooks(draft.items ?? []);
      setInProgressBooks(inProgress.items ?? []);
      setCompletedBooks(completed.items ?? []);

      setDraftPage(0);
      setInProgressPage(0);
      setCompletedPage(0);

      setHasMoreDraft(!draft.last);
      setHasMoreInProgress(!inProgress.last);
      setHasMoreCompleted(!completed.last);
    } catch (e) {
      setError(e instanceof Error ? e.message : "내 책 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    void loadInitial();
  }, [navigate]);

  // 좋아요 한 책 탭은 처음 열릴 때 한 번만 로드한다.
  useEffect(() => {
    if (activeTab !== "liked" || likedLoaded) return;
    let cancelled = false;
    setLikedLoading(true);
    fetchMyLikedBooks(0, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setLikedBooks(res.items);
        setLikedPage(0);
        setHasMoreLiked(res.hasNext);
        setLikedLoaded(true);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "좋아요 한 책을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLikedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, likedLoaded]);

  const workingBooks = useMemo(() => [...draftBooks, ...inProgressBooks], [draftBooks, inProgressBooks]);

  const visibleBooks = useMemo(() => {
    if (activeTab === "working") return workingBooks;
    if (activeTab === "completed") return completedBooks;
    return [] as MyBookItem[];
  }, [activeTab, workingBooks, completedBooks]);

  const hasMore = useMemo(() => {
    if (activeTab === "working") return hasMoreDraft || hasMoreInProgress;
    if (activeTab === "completed") return hasMoreCompleted;
    return hasMoreLiked;
  }, [activeTab, hasMoreDraft, hasMoreInProgress, hasMoreCompleted, hasMoreLiked]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      if (activeTab === "working") {
        const tasks: Promise<void>[] = [];

        if (hasMoreDraft) {
          const nextDraftPage = draftPage + 1;
          tasks.push(
            fetchMyBooks(nextDraftPage, PAGE_SIZE, "DRAFT").then((res) => {
              setDraftBooks((prev) => [...prev, ...(res.items ?? [])]);
              setDraftPage(nextDraftPage);
              setHasMoreDraft(!res.last);
            })
          );
        }

        if (hasMoreInProgress) {
          const nextProgressPage = inProgressPage + 1;
          tasks.push(
            fetchMyBooks(nextProgressPage, PAGE_SIZE, "IN_PROGRESS").then((res) => {
              setInProgressBooks((prev) => [...prev, ...(res.items ?? [])]);
              setInProgressPage(nextProgressPage);
              setHasMoreInProgress(!res.last);
            })
          );
        }

        await Promise.all(tasks);
      } else if (activeTab === "completed" && hasMoreCompleted) {
        const nextPage = completedPage + 1;
        const res = await fetchMyBooks(nextPage, PAGE_SIZE, "COMPLETED");
        setCompletedBooks((prev) => [...prev, ...(res.items ?? [])]);
        setCompletedPage(nextPage);
        setHasMoreCompleted(!res.last);
      } else if (activeTab === "liked" && hasMoreLiked) {
        const nextPage = likedPage + 1;
        const res = await fetchMyLikedBooks(nextPage, PAGE_SIZE);
        setLikedBooks((prev) => [...prev, ...res.items]);
        setLikedPage(nextPage);
        setHasMoreLiked(res.hasNext);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "목록을 더 불러오지 못했습니다.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6 bg-[#f4f4fa]">
      <div className="max-w-7xl mx-auto space-y-10">
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e2e66] tracking-tight">나의 책</h1>
              <p className="text-[#5a6595] max-w-2xl text-sm md:text-base">
                상상의 날개를 펼쳐 제작 중인 이야기들을 확인하세요. AI 아틀리에에서 당신만의 동화가 탄생하고 있습니다.
              </p>
            </div>

            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-[#6f82dc] hover:bg-[#6074d0] text-white px-6 py-3 rounded-full font-bold shadow"
            >
              <Plus size={18} />
              새 책 만들기
            </Link>
          </div>

          <div className="flex items-center gap-6 border-b border-[#dde1f2]">
            {(["working", "completed", "liked"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-3 pt-1 text-sm md:text-lg font-bold transition-colors border-b-4 ${
                  activeTab === tab
                    ? "text-[#4862d3] border-[#4862d3]"
                    : "text-[#2d3f80] border-transparent hover:text-[#4862d3]"
                }`}
              >
                {tabLabel[tab]}
              </button>
            ))}
          </div>
        </section>

        {publishSuccess && (
          <div className="rounded-2xl bg-[#e7f6ec] border border-[#bfe6cb] px-5 py-3 text-sm font-bold text-[#1f7a43]">
            {publishSuccess}
          </div>
        )}

        {loading && <p className="text-[#5a6595]">책 목록을 불러오는 중...</p>}

        {!loading && (
          <>
            {error && (
              <div className="flex items-center gap-3">
                <p className="text-red-600 font-bold">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadInitial()}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#d9dff7] text-sm font-bold"
                >
                  다시 시도
                </button>
              </div>
            )}

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeTab === "working" && (
                <Link
                  to="/create"
                  className="rounded-[32px] border-2 border-dashed border-[#d3daf8] bg-white/40 min-h-[360px] flex items-center justify-center text-center p-7 hover:bg-white/70 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-full bg-[#e5e9fb] text-[#5f72c8] mx-auto flex items-center justify-center">
                      <Wand2 size={22} />
                    </div>
                    <h3 className="text-3xl font-bold text-[#1e2e66]">새로운 이야기 시작</h3>
                    <p className="text-sm text-[#6673a8]">AI와 함께 마법 같은 동화 속으로 떠나볼까요?</p>
                  </div>
                </Link>
              )}

              {visibleBooks.map((book) => {
                const progress = progressByStatus[book.status];
                const showPublish = activeTab === "completed" && book.status === "COMPLETED";
                return (
                  <div key={book.bookId} className="flex flex-col rounded-[32px] overflow-hidden bg-white shadow-sm hover:-translate-y-1 transition-transform">
                    <Link to={`/book/${book.bookId}`} className="block">
                      <div className="aspect-[4/3] bg-[#dde2f6]">
                        {book.coverImageUrl ? (
                          <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#a6b0db]">
                            <ImageIcon size={30} />
                          </div>
                        )}
                      </div>
                      <div className="p-5 space-y-3.5">
                        <h4 className="text-[30px] leading-tight font-bold text-[#1e2e66] truncate">{book.title}</h4>
                        <p className="text-sm text-[#6673a8]">{book.authorName} · {statusLabel[book.status]}</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-bold text-[#4d5fb7]">
                            <span>진행률</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#e6e9f7] overflow-hidden">
                            <div className="h-full bg-[#576bd0]" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                    </Link>

                    {showPublish && (
                      <div className="px-5 pb-5">
                        {book.visibility === "PAID" ? (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eef0fb] px-4 py-2 text-sm font-bold text-[#4862d3]">
                            <Coins size={16} />
                            유료 출판됨
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openPublishModal(book)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#6f82dc] hover:bg-[#6074d0] px-4 py-2 text-sm font-bold text-white shadow-sm"
                          >
                            <Coins size={16} />
                            유료 출판
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {activeTab === "liked" &&
                likedBooks.map((book) => (
                  <Link key={book.bookId} to={`/book/${book.bookId}`} className="rounded-[32px] overflow-hidden bg-white shadow-sm hover:-translate-y-1 transition-transform">
                    <div className="aspect-[4/3] bg-[#dde2f6]">
                      {book.coverImageUrl ? (
                        <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#a6b0db]">
                          <ImageIcon size={30} />
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-2">
                      <h4 className="text-[30px] leading-tight font-bold text-[#1e2e66] truncate">{book.title}</h4>
                      <p className="text-sm text-[#6673a8]">{book.authorName}</p>
                    </div>
                  </Link>
                ))}

              {activeTab === "liked" && likedLoading && likedBooks.length === 0 && (
                <div className="col-span-full text-center py-16 text-[#6673a8]">좋아요 한 책을 불러오는 중...</div>
              )}

              {activeTab === "liked" && !likedLoading && likedBooks.length === 0 && (
                <div className="col-span-full text-center py-16 text-[#6673a8]">아직 좋아요 한 책이 없어요.</div>
              )}

              {activeTab !== "liked" && visibleBooks.length === 0 && (
                <div className="col-span-full text-center py-16 text-[#6673a8]">표시할 책이 없어요.</div>
              )}
            </section>

            {hasMore && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  className="px-5 py-2 rounded-full bg-white border border-[#d9dff7] text-sm font-bold text-[#2d3f80] disabled:opacity-60"
                >
                  {loadingMore ? "불러오는 중..." : "더 보기"}
                </button>
              </div>
            )}

            <section className="rounded-[34px] bg-[#e9ebf8] p-10 text-center space-y-4">
              <h3 className="text-3xl font-extrabold text-[#1f2f67]">영감이 필요한가요?</h3>
              <p className="text-[#6270a8]">다른 작가들의 이야기를 둘러보고 새로운 영감을 얻어보세요.</p>
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#cfd7ff] text-[#23357b] font-bold hover:bg-[#c0cbfd]"
              >
                둘러보기
              </Link>
            </section>
          </>
        )}
      </div>

      {publishTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closePublishModal}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-[#1e2e66]">유료 출판</h3>
                <p className="text-sm text-[#6673a8]">'{publishTarget.title}'을(를) 유료로 출판합니다.</p>
              </div>
              <button
                type="button"
                onClick={closePublishModal}
                disabled={publishing}
                className="text-[#9aa3cf] hover:text-[#5a6595] disabled:opacity-50"
                aria-label="닫기"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="paid-price" className="block text-sm font-bold text-[#2d3f80]">
                가격 (원)
              </label>
              <input
                id="paid-price"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleConfirmPublish();
                }}
                placeholder="예: 3000"
                autoFocus
                className="w-full rounded-xl border border-[#d9dff7] px-4 py-3 text-[#1e2e66] font-bold outline-none focus:border-[#6f82dc]"
              />
              <p className="text-xs text-[#8a93c0]">1 이상의 정수만 입력할 수 있어요.</p>
            </div>

            {publishError && <p className="text-sm font-bold text-red-600">{publishError}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closePublishModal}
                disabled={publishing}
                className="px-5 py-2.5 rounded-full border border-[#d9dff7] text-sm font-bold text-[#2d3f80] disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmPublish()}
                disabled={publishing}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#6f82dc] hover:bg-[#6074d0] text-sm font-bold text-white shadow-sm disabled:opacity-60"
              >
                <Coins size={16} />
                {publishing ? "출판 중..." : "출판하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
