import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, BookOpen, Heart, PenTool, Sparkles, Star, UserCheck, UserPlus } from "lucide-react";
import { isLoggedIn } from "../lib/auth";
import {
  fetchAuthorBooks,
  fetchAuthorFollowStatus,
  fetchAuthorProfile,
  fetchAuthorStats,
  followAuthor,
  unfollowAuthor,
  type AuthorBookResponse,
  type AuthorProfile,
  type AuthorStats,
} from "../lib/api";

function formatJoinedAt(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}년 ${parsed.getMonth() + 1}월 가입`;
}

function formatPrice(book: AuthorBookResponse): string {
  if (book.visibility === "PUBLIC" || !book.price) return "무료";
  return `${book.price.toLocaleString()}원`;
}

const AuthorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followPending, setFollowPending] = useState(false);
  const [books, setBooks] = useState<AuthorBookResponse[]>([]);
  const [booksTotal, setBooksTotal] = useState(0);
  const [booksLoading, setBooksLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setProfile(null);
    fetchAuthorProfile(id)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setStats(null);
    fetchAuthorStats(id)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setFollowing(false);
    setFollowerCount(null);
    fetchAuthorFollowStatus(id)
      .then((status) => {
        if (cancelled) return;
        setFollowing(status.followedByMe);
        setFollowerCount(status.followerCount);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setBooks([]);
    setBooksTotal(0);
    setBooksLoading(true);
    fetchAuthorBooks(id)
      .then((data) => {
        if (cancelled) return;
        setBooks(data.items);
        setBooksTotal(data.totalCount);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setBooksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const displayName = profile?.nickname ?? "";
  const displayBio = profile?.bio?.trim() ?? "";
  const displayJoinedAt = profile ? formatJoinedAt(profile.joinedAt) : "";
  const fallbackImage = id ? `https://i.pravatar.cc/240?u=${id}` : "https://i.pravatar.cc/240";
  const profileImage = profile?.profileImage ?? fallbackImage;

  const handleToggleFollow = async () => {
    if (!id || followPending) return;
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    setFollowPending(true);
    try {
      const status = following ? await unfollowAuthor(id) : await followAuthor(id);
      setFollowing(status.followedByMe);
      setFollowerCount(status.followerCount);
    } catch (err) {
      alert(err instanceof Error ? err.message : "요청에 실패했습니다.");
    } finally {
      setFollowPending(false);
    }
  };

  const displayedFollowers = followerCount ?? stats?.followerCount ?? 0;

  const statCards = [
    {
      label: "작품 수",
      value: (stats?.bookCount ?? 0).toLocaleString(),
      icon: BookOpen,
    },
    {
      label: "총 좋아요",
      value: (stats?.totalLikeCount ?? 0).toLocaleString(),
      icon: Heart,
    },
    {
      label: "평균 평점",
      value: (stats?.averageRating ?? 0).toFixed(1),
      icon: Star,
    },
    { label: "팔로워", value: displayedFollowers.toLocaleString(), icon: UserPlus },
  ];

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
        <div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ArrowLeft size={16} />
            작품 둘러보기로 돌아가기
          </Link>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden glass rounded-3xl p-6 md:p-10"
        >
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
              <img
                src={profileImage}
                alt={`${displayName} 프로필`}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
              <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[11px] md:text-xs">
                <Sparkles size={14} />
                AUTHOR
              </div>
              <h1 className="text-3xl md:text-5xl font-headline font-extrabold text-on-surface break-keep">{displayName}</h1>
              <p className="text-xs md:text-sm text-on-surface-variant">{displayJoinedAt}</p>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed whitespace-pre-wrap">{displayBio}</p>
            </div>

            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={handleToggleFollow}
                disabled={followPending}
                className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold shadow-lg transition-colors disabled:opacity-60 ${
                  following
                    ? "border border-outline-variant/40 bg-white text-on-surface hover:bg-surface-container-low"
                    : "bg-primary text-on-primary hover:bg-secondary"
                }`}
              >
                {following ? <UserCheck size={16} /> : <UserPlus size={16} />}
                {following ? "팔로잉" : "팔로우"}
              </button>
              <button
                type="button"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-outline-variant/40 bg-white text-on-surface font-bold hover:bg-surface-container-low transition-colors"
              >
                <PenTool size={16} />
                메시지
              </button>
            </div>
          </div>
        </motion.section>

        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-4 md:p-5 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <stat.icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-on-surface-variant">{stat.label}</p>
                  <p className="text-lg md:text-xl font-headline font-bold text-on-surface truncate">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface flex items-center gap-2">
                <BookOpen size={22} className="text-primary" />
                작품 목록
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                {displayName ? `${displayName} 작가의 작품 ${booksTotal}권` : `작품 ${booksTotal}권`}
              </p>
            </div>
          </div>

          {booksLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/4] rounded-2xl bg-surface-container-low animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-surface-container-low animate-pulse" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-10 text-center text-on-surface-variant">
              아직 등록된 작품이 없어요.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {books.map((book, i) => (
                <motion.div
                  key={book.bookId}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
                  className="group"
                >
                  <Link to={`/book/${book.bookId}`} className="block space-y-3">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden book-shadow group-hover:-translate-y-1 transition-transform duration-500">
                      {book.coverImageUrl ? (
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant/50">
                          <BookOpen size={36} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">{book.title}</h3>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                            book.visibility === "PAID"
                              ? "bg-primary/10 text-primary"
                              : "bg-surface-container-low text-on-surface-variant"
                          }`}
                        >
                          {formatPrice(book)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AuthorProfilePage;
