import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Palette } from "lucide-react";
import { MOCK_BOOKS } from "../constants";
import { fetchUserMe, isLoggedIn, type UserInfo } from "../lib/auth";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const monthlyCompleted = Math.max(1, Math.floor(MOCK_BOOKS.length / 3));
  const averageRating = 4.6;
  const favoriteCategory = "판타지";
  const recentReadTitle = MOCK_BOOKS[0]?.title ?? "-";
  const followingAuthors = 12;
  const libraryCount = MOCK_BOOKS.length;
  const streakDays = 7;

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    fetchUserMe().then((data) => {
      if (!data) {
        navigate("/login");
        return;
      }
      setUser(data);
      setLoading(false);
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
        <div className="glass p-6 md:p-12 rounded-3xl flex flex-col md:flex-row items-center gap-8 md:gap-10">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary shadow-2xl flex-shrink-0">
              <img
                src={user?.profileImage || "https://i.pravatar.cc/150?u=default"}
                alt="프로필"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
            <button
              onClick={() => navigate("/profile/edit")}
              aria-label="프로필 사진 수정"
              className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-primary hover:scale-110 transition-transform"
            >
              <Palette size={18} className="md:w-5 md:h-5" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-headline font-bold">{user?.nickname || "사용자"}</h1>
              <p className="text-on-surface-variant font-medium text-sm md:text-base">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate("/profile/edit")}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-secondary transition-all text-sm md:text-base"
            >
              프로필 수정
            </button>
            <button className="px-6 py-3 glass rounded-xl font-bold hover:bg-white transition-all text-sm md:text-base">설정</button>
          </div>
        </div>

        <div className="glass p-6 md:p-8 rounded-3xl">
          <h3 className="text-lg md:text-xl font-bold text-on-surface mb-4">대시보드 바로가기</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/author")}
              className="px-5 py-4 rounded-xl bg-primary text-white font-bold hover:bg-secondary transition-colors"
            >
              작가 대시보드
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/reader")}
              className="px-5 py-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-bold hover:bg-surface-container transition-colors"
            >
              독자 대시보드
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8">
          <div className="glass p-6 md:p-8 rounded-3xl space-y-6">
            <h3 className="text-lg md:text-xl font-headline font-bold text-on-surface">간략 정보</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/20">
                <p className="text-xs font-body text-on-surface-variant">이번 달 완독 수</p>
                <p className="mt-1 text-xl md:text-2xl font-headline font-bold text-on-surface">{monthlyCompleted}</p>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/20">
                <p className="text-xs font-body text-on-surface-variant">평균 별점(내가 준 별점)</p>
                <p className="mt-1 text-xl md:text-2xl font-headline font-bold text-on-surface">{averageRating}</p>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/20">
                <p className="text-xs font-body text-on-surface-variant">가장 많이 읽은 카테고리</p>
                <p className="mt-1 text-xl md:text-2xl font-headline font-bold text-on-surface truncate">{favoriteCategory}</p>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/20">
                <p className="text-xs font-body text-on-surface-variant">최근 본 책</p>
                <p className="mt-1 text-xl md:text-2xl font-headline font-bold text-on-surface truncate">{recentReadTitle}</p>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/20">
                <p className="text-xs font-body text-on-surface-variant">팔로우 작가 수</p>
                <p className="mt-1 text-xl md:text-2xl font-headline font-bold text-on-surface">{followingAuthors}</p>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/20">
                <p className="text-xs font-body text-on-surface-variant">내 책장 총 권수</p>
                <p className="mt-1 text-xl md:text-2xl font-headline font-bold text-on-surface">{libraryCount}</p>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/20">
                <p className="text-xs font-body text-on-surface-variant">연속 활동일(스트릭)</p>
                <p className="mt-1 text-xl md:text-2xl font-headline font-bold text-on-surface">{streakDays}일</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
