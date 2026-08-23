import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Sparkles, BookOpen, Users, Flag, X, Star, Pencil, Trash2, MessageCircle, Heart, UserPlus, UserCheck } from "lucide-react";
import {
  addBookLike,
  createBookReview,
  deleteBookReview,
  fetchAuthorFollowStatus,
  fetchBookDetail,
  fetchBookLikeStatus,
  fetchBookReviews,
  followAuthor,
  removeBookLike,
  reportBook,
  unfollowAuthor,
  updateBookReview,
  type BookDetail,
  type BookLikeStatus,
  type BookReviewItem,
  type ReportReason,
  type ReviewPageResponse,
} from "../lib/api";
import { isLoggedIn } from "../lib/auth";

const reportReasons: ReadonlyArray<{ label: string; value: ReportReason }> = [
  { label: "스팸/광고", value: "SPAM" },
  { label: "부적절한 내용", value: "INAPPROPRIATE" },
  { label: "저작권 침해", value: "COPYRIGHT" },
  { label: "기타", value: "OTHER" },
];

const REVIEW_PAGE_SIZE = 10;

const BookDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [likeStatus, setLikeStatus] = useState<BookLikeStatus | null>(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeErrorMessage, setLikeErrorMessage] = useState<string | null>(null);

  const [following, setFollowing] = useState(false);
  const [followPending, setFollowPending] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("SPAM");
  const [reportDetail, setReportDetail] = useState("");
  const [reportDoneMessage, setReportDoneMessage] = useState<string | null>(null);
  const [reportErrorMessage, setReportErrorMessage] = useState<string | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reviews, setReviews] = useState<BookReviewItem[]>([]);
  const [reviewPage, setReviewPage] = useState<ReviewPageResponse | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewErrorMessage, setReviewErrorMessage] = useState<string | null>(null);
  const [reviewDoneMessage, setReviewDoneMessage] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchBookDetail(id)
      .then((data) => {
        setBook(data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLikeStatus(null);
    fetchBookLikeStatus(id)
      .then((status) => {
        if (active) setLikeStatus(status);
      })
      .catch(() => {
        if (active) setLikeStatus(null);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const authorId = book?.authorId;
    if (!authorId) return;
    let active = true;
    setFollowing(false);
    fetchAuthorFollowStatus(authorId)
      .then((status) => {
        if (active) setFollowing(status.followedByMe);
      })
      .catch(() => {
        if (active) setFollowing(false);
      });
    return () => {
      active = false;
    };
  }, [book?.authorId]);

  const handleToggleFollow = async () => {
    const authorId = book?.authorId;
    if (!authorId || followPending) return;

    if (!isLoggedIn()) {
      if (window.confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }

    setFollowPending(true);
    try {
      const status = following ? await unfollowAuthor(authorId) : await followAuthor(authorId);
      setFollowing(status.followedByMe);
    } catch (err) {
      alert(err instanceof Error ? err.message : "요청에 실패했습니다.");
    } finally {
      setFollowPending(false);
    }
  };

  const toggleLike = async () => {
    if (!book?.bookId || likeLoading) return;

    if (!isLoggedIn()) {
      if (window.confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }

    const liked = likeStatus?.likedByMe ?? false;

    setLikeLoading(true);
    setLikeErrorMessage(null);

    try {
      const status = liked ? await removeBookLike(book.bookId) : await addBookLike(book.bookId);
      setLikeStatus(status);
    } catch (err) {
      setLikeErrorMessage(err instanceof Error ? err.message : "좋아요 처리에 실패했습니다.");
      window.setTimeout(() => setLikeErrorMessage(null), 2500);
    } finally {
      setLikeLoading(false);
    }
  };

  const loadReviews = async (targetPage = 0, append = false) => {
    if (!id) return;
    setReviewLoading(true);
    setReviewErrorMessage(null);

    try {
      const data = await fetchBookReviews(id, targetPage, REVIEW_PAGE_SIZE);
      setReviewPage(data);
      setReviews((prev) => (append ? [...prev, ...data.items] : data.items));
    } catch (err) {
      setReviewErrorMessage(err instanceof Error ? err.message : "리뷰 목록을 불러오지 못했습니다.");
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    setReviews([]);
    setReviewPage(null);
    setReviewContent("");
    setReviewRating(5);
    setEditingReviewId(null);
    loadReviews(0, false);
  }, [id]);

  const myReview = reviews.find((review) => review.mine);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!book?.bookId) return;

    if (!isLoggedIn()) {
      setIsReportOpen(false);
      navigate("/login");
      return;
    }

    setReportSubmitting(true);
    setReportErrorMessage(null);

    try {
      const message = await reportBook(book.bookId, {
        reason: reportReason,
        detail: reportDetail.trim() || undefined,
      });

      setIsReportOpen(false);
      setReportDoneMessage(message);
      setReportDetail("");
      setReportReason("SPAM");
      window.setTimeout(() => setReportDoneMessage(null), 2500);
    } catch (err) {
      setReportErrorMessage(err instanceof Error ? err.message : "신고 접수에 실패했습니다.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const resetReviewForm = () => {
    setReviewRating(5);
    setReviewContent("");
    setEditingReviewId(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!book?.bookId) return;

    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    const trimmedContent = reviewContent.trim();
    if (!trimmedContent) {
      setReviewErrorMessage("리뷰 내용을 입력해주세요.");
      return;
    }

    setReviewSubmitting(true);
    setReviewErrorMessage(null);

    try {
      if (editingReviewId) {
        await updateBookReview(editingReviewId, {
          rating: reviewRating,
          content: trimmedContent,
        });
        setReviewDoneMessage("리뷰가 수정되었습니다.");
      } else {
        await createBookReview(book.bookId, {
          rating: reviewRating,
          content: trimmedContent,
        });
        setReviewDoneMessage("리뷰가 등록되었습니다.");
      }

      resetReviewForm();
      await loadReviews(0, false);
      window.setTimeout(() => setReviewDoneMessage(null), 2500);
    } catch (err) {
      setReviewErrorMessage(err instanceof Error ? err.message : "리뷰 처리에 실패했습니다.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleEditReview = (review: BookReviewItem) => {
    setEditingReviewId(review.reviewId);
    setReviewRating(review.rating);
    setReviewContent(review.content);
    setReviewErrorMessage(null);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("리뷰를 삭제할까요?")) return;

    setReviewSubmitting(true);
    setReviewErrorMessage(null);

    try {
      await deleteBookReview(reviewId);
      resetReviewForm();
      setReviewDoneMessage("리뷰가 삭제되었습니다.");
      await loadReviews(0, false);
      window.setTimeout(() => setReviewDoneMessage(null), 2500);
    } catch (err) {
      setReviewErrorMessage(err instanceof Error ? err.message : "리뷰 삭제에 실패했습니다.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderFollowButton = () => (
    <div className="relative inline-flex group">
      <button
        type="button"
        onClick={() => void handleToggleFollow()}
        disabled={followPending}
        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-sm transition-colors disabled:opacity-60 ${
          following
            ? "border border-outline-variant/40 bg-white text-on-surface hover:bg-surface-container-low"
            : "bg-primary text-on-primary hover:bg-secondary"
        }`}
      >
        {following ? <UserCheck size={15} /> : <UserPlus size={15} />}
        {following ? "팔로잉" : "팔로우"}
      </button>
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden whitespace-nowrap rounded-xl bg-on-surface px-3 py-2 text-xs font-bold text-white shadow-lg group-hover:block">
        작가의 다른 작품이 궁금하다면?
        <span className="absolute left-1/2 top-full -translate-x-1/2 h-0 w-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-on-surface" />
      </div>
    </div>
  );

  const formatReviewDate = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-on-surface-variant text-lg">책을 찾을 수 없습니다.</p>
        <Link to="/explore" className="text-primary font-bold hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => void toggleLike()}
              disabled={likeLoading || (isLoggedIn() && !likeStatus)}
              aria-pressed={likeStatus?.likedByMe ?? false}
              aria-label={likeStatus?.likedByMe ? "좋아요 취소" : "좋아요"}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold transition-colors disabled:opacity-50 ${
                likeStatus?.likedByMe
                  ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-on-surface-variant/30 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Heart size={16} className={likeStatus?.likedByMe ? "fill-current" : ""} />
              좋아요
              {likeStatus && <span>{likeStatus.likeCount.toLocaleString()}</span>}
            </button>
            <a
              href="#book-reviews"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-bold hover:bg-primary/15 transition-colors"
            >
              <MessageCircle size={16} />
              리뷰 보기
            </a>
            <button
              type="button"
              onClick={() => {
                setReportErrorMessage(null);
                setIsReportOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-300 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
            >
              <Flag size={16} />
              신고
            </button>
          </div>

          {reportDoneMessage && (
            <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary font-bold">
              {reportDoneMessage}
            </div>
          )}

          {likeErrorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-bold">
              {likeErrorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 md:gap-16 items-start">
            <div className="md:sticky md:top-32 space-y-4 md:space-y-8">
              <div className="flex flex-row md:flex-col gap-5 md:gap-8 items-start">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-[150px] md:w-full aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden book-shadow flex-shrink-0"
                >
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant/50">
                      <BookOpen size={44} />
                    </div>
                  )}
                </motion.div>

                <div className="flex-grow md:hidden pt-1">
                  <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[11px] mb-2">
                    <Sparkles size={14} />
                    AI 그림책
                  </div>
                  <h2 className="text-3xl font-headline font-bold leading-tight mb-2">{book.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="text-on-surface-variant text-base font-medium">
                      <Link to={`/author/${book.authorId}`} className="hover:text-primary transition-colors">
                        {book.authorName} 작가
                      </Link>
                    </p>
                    {renderFollowButton()}
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <BookOpen size={16} />
                    <span className="text-sm font-medium">{book.pages.length} 페이지</span>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex flex-col gap-4">
                <Link to={`/read/${book.bookId}`} className="w-full bg-primary text-white py-4 md:py-5 rounded-2xl text-center font-bold text-lg shadow-xl hover:bg-secondary transition-all active:scale-95">
                  이야기 읽기
                </Link>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 md:space-y-10"
            >
              <div className="hidden md:block space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm">
                  <Sparkles size={16} />
                  AI 그림책
                </div>
                <h1 className="text-6xl font-headline font-bold leading-tight">{book.title}</h1>
                <div className="flex items-center gap-4">
                  <Link to={`/author/${book.authorId}`} className="font-bold hover:text-primary transition-colors">
                    {book.authorName} 작가
                  </Link>
                  {renderFollowButton()}
                  <div className="h-4 w-[1px] bg-on-surface-variant/20" />
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <BookOpen size={18} />
                    <span className="font-medium">{book.pages.length} 페이지</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:hidden">
                <Link to={`/read/${book.bookId}`} className="w-full bg-primary text-white py-4 rounded-xl text-center font-bold text-lg shadow-lg active:scale-95">
                  이야기 읽기
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="glass p-3 md:p-4 rounded-xl md:rounded-2xl text-center">
                  <p className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase mb-1">분량</p>
                  <p className="font-bold text-sm md:text-base">{book.pages.length} 페이지</p>
                </div>
                <div className="glass p-3 md:p-4 rounded-xl md:rounded-2xl text-center">
                  <p className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase mb-1">카테고리</p>
                  <p className="font-bold text-sm md:text-base">{book.categoryName ?? "-"}</p>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">이야기 소개</h3>
                <p className="text-on-surface-variant leading-relaxed text-base md:text-lg">{book.description}</p>
              </div>

              {book.characters.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-on-surface-variant/10">
                  <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <Users size={22} />
                    등장인물
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {book.characters.map((character, i) => (
                      <div key={i} className="glass p-4 md:p-5 rounded-2xl space-y-2">
                        <p className="font-bold text-base md:text-lg">{character.name}</p>
                        <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">{character.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {book.pages.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-on-surface-variant/10">
                  <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <BookOpen size={22} />
                    미리보기
                  </h3>
                  <div className="space-y-4">
                    {book.pages.map((page) => (
                      <div key={page.pageNumber} className="glass p-4 md:p-6 rounded-2xl space-y-2">
                        <p className="text-xs font-bold text-primary uppercase">{page.pageNumber} 페이지</p>
                        <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">{page.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div id="book-reviews" className="scroll-mt-24 md:scroll-mt-32 space-y-5 pt-8 border-t border-on-surface-variant/10">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                      <Star size={22} className="text-yellow-500 fill-yellow-500" />
                      리뷰
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {reviewPage ? `${reviewPage.totalCount.toLocaleString()}개의 리뷰` : "리뷰를 불러오는 중입니다."}
                    </p>
                  </div>
                </div>

                {reviewDoneMessage && (
                  <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary font-bold">
                    {reviewDoneMessage}
                  </div>
                )}

                {reviewErrorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-bold">
                    {reviewErrorMessage}
                  </div>
                )}

                {isLoggedIn() ? (
                  !myReview || editingReviewId ? (
                    <form onSubmit={handleSubmitReview} className="glass p-4 md:p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-on-surface">{editingReviewId ? "리뷰 수정" : "리뷰 작성"}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, index) => {
                            const value = index + 1;
                            const active = value <= reviewRating;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setReviewRating(value)}
                                className="p-1 text-yellow-500"
                                aria-label={`${value}점`}
                              >
                                <Star size={22} className={active ? "fill-yellow-500" : ""} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <textarea
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value.slice(0, 500))}
                        rows={4}
                        maxLength={500}
                        placeholder="이 책을 읽고 느낀 점을 남겨주세요."
                        className="w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 text-sm md:text-base focus:outline-none focus:border-primary"
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-xs text-on-surface-variant">{reviewContent.length}/500</p>
                        <div className="flex gap-2">
                          {editingReviewId && (
                            <button
                              type="button"
                              onClick={resetReviewForm}
                              disabled={reviewSubmitting}
                              className="px-4 py-2 rounded-xl border border-outline-variant/40 text-on-surface-variant font-bold disabled:opacity-50"
                            >
                              취소
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={reviewSubmitting}
                            className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-secondary disabled:opacity-50"
                          >
                            {reviewSubmitting ? "저장 중..." : editingReviewId ? "수정하기" : "등록하기"}
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary font-bold">
                      이미 이 책에 리뷰를 작성했어요. 아래 내 리뷰에서 수정하거나 삭제할 수 있습니다.
                    </div>
                  )
                ) : (
                  <div className="glass p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-on-surface-variant">로그인하면 리뷰를 작성할 수 있어요.</p>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-secondary"
                    >
                      로그인
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.reviewId} className="glass p-4 md:p-5 rounded-2xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-on-surface">{review.nickname}</p>
                            {review.mine && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">내 리뷰</span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="flex items-center gap-0.5 text-yellow-500">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star key={index} size={14} className={index < review.rating ? "fill-yellow-500" : ""} />
                              ))}
                            </div>
                            <span className="text-xs text-on-surface-variant">{formatReviewDate(review.updatedAt || review.createdAt)}</span>
                          </div>
                        </div>

                        {review.mine && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditReview(review)}
                              disabled={reviewSubmitting}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
                            >
                              <Pencil size={13} />
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(review.reviewId)}
                              disabled={reviewSubmitting}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-on-surface-variant leading-relaxed text-sm md:text-base whitespace-pre-wrap">{review.content}</p>
                    </div>
                  ))}

                  {!reviewLoading && reviews.length === 0 && (
                    <div className="glass p-6 rounded-2xl text-center text-on-surface-variant">
                      아직 작성된 리뷰가 없습니다.
                    </div>
                  )}
                </div>

                {reviewPage?.hasNext && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => loadReviews(reviewPage.page + 1, true)}
                      disabled={reviewLoading}
                      className="px-5 py-2 rounded-xl border border-outline-variant/40 text-on-surface-variant font-bold hover:bg-surface-container-low disabled:opacity-50"
                    >
                      {reviewLoading ? "불러오는 중..." : "리뷰 더보기"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>


      {isReportOpen && (
        <div className="fixed inset-0 z-[90] bg-black/55 px-4 flex items-center justify-center" onClick={() => !reportSubmitting && setIsReportOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface">작품 신고</h2>
              <button type="button" onClick={() => setIsReportOpen(false)} disabled={reportSubmitting} className="text-on-surface-variant hover:text-on-surface disabled:opacity-50">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-bold text-on-surface">신고 사유</p>
                <div className="grid grid-cols-2 gap-2">
                  {reportReasons.map((reason) => (
                    <button
                      key={reason.value}
                      type="button"
                      onClick={() => setReportReason(reason.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${
                        reportReason === reason.value
                          ? "bg-red-100 border-red-300 text-red-700"
                          : "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="report-detail" className="text-sm font-bold text-on-surface">
                  상세 내용
                </label>
                <textarea
                  id="report-detail"
                  value={reportDetail}
                  onChange={(e) => setReportDetail(e.target.value)}
                  rows={4}
                  placeholder="신고 내용을 입력해주세요."
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  disabled={reportSubmitting}
                  className="flex-1 py-3 rounded-xl border border-outline-variant/40 text-on-surface-variant font-bold hover:bg-surface-container-low disabled:opacity-50"
                >
                  취소
                </button>
                <button type="submit" disabled={reportSubmitting} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50">
                  {reportSubmitting ? "접수 중..." : "신고 접수"}
                </button>
              </div>

              {reportErrorMessage && <p className="text-sm text-red-600 font-bold">{reportErrorMessage}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BookDetailPage;
