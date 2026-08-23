import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookPlus, BookOpen, LogIn, Compass, Library, Trophy } from "lucide-react";
import { cn } from "../lib/utils";
import { isLoggedIn as checkAuth, fetchUserMe, type UserInfo } from "../lib/auth";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const isReading = location.pathname.startsWith("/read");

  useEffect(() => {
    let cancelled = false;

    if (!checkAuth()) {
      setIsLoggedIn(false);
      setUser(null);
      return;
    }

    fetchUserMe().then((info) => {
      if (cancelled) return;

      if (info) {
        setIsLoggedIn(true);
        setUser(info);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [location]);

  const handleProtectedClick = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    if (!checkAuth()) {
      if (window.confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }

    navigate(target);
  };

  if (isReading) return null;

  const isExploreActive = location.pathname === "/explore" || location.pathname === "/search";
  const isRankingsActive = location.pathname.startsWith("/rankings");
  const isLibraryActive = location.pathname.startsWith("/library");
  const isCreateActive = location.pathname.startsWith("/create");
  const isProfileActive = location.pathname.startsWith("/profile");

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-background border-b border-primary/5 shadow-[0px_20px_40px_rgba(39,48,87,0.06)]">
        <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary font-headline tracking-tight">
            <BookOpen className="text-primary shrink-0" size={28} />
            <span className="translate-y-[1px]">Mongle</span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/explore"
              className={cn(
                "px-3 py-2 rounded-full font-label font-semibold transition-colors",
                isExploreActive
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface hover:text-primary hover:bg-surface-container-low",
              )}
            >
              갤러리
            </Link>

            <Link
              to="/rankings"
              className={cn(
                "px-3 py-2 rounded-full font-label font-semibold transition-colors",
                isRankingsActive
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface hover:text-primary hover:bg-surface-container-low",
              )}
            >
              랭킹
            </Link>

            <Link
              to="/library"
              onClick={(e) => handleProtectedClick(e, "/library")}
              className={cn(
                "px-3 py-2 rounded-full font-label font-semibold transition-colors",
                isLibraryActive
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface hover:text-primary hover:bg-surface-container-low",
              )}
            >
              내 서재
            </Link>

            <Link
              to="/create"
              onClick={(e) => handleProtectedClick(e, "/create")}
              className={cn(
                "px-6 py-2.5 rounded-full font-bold transition-all active:scale-95 duration-200 flex items-center gap-2 border",
                isCreateActive
                  ? "bg-gradient-to-br from-primary to-primary-container text-on-primary border-primary/30"
                  : "bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:bg-surface-container-low",
              )}
            >
              <BookPlus size={18} />
              동화 만들기
            </Link>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link
                  to="/profile"
                  className={cn(
                    "w-10 h-10 rounded-full overflow-hidden border-2 transition-colors",
                    isProfileActive ? "border-primary" : "border-primary/20 hover:border-primary",
                  )}
                >
                  <img
                    src={user?.profileImage || "https://i.pravatar.cc/150?u=default"}
                    alt="프로필"
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-surface-container-high text-primary px-6 py-2.5 rounded-full font-bold hover:bg-white transition-all shadow-sm active:scale-95"
                >
                  <LogIn size={18} />
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-primary/10 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <Link
            to="/explore"
            className={cn("flex flex-col items-center gap-1 transition-colors", isExploreActive ? "text-primary" : "text-on-surface-variant")}
          >
            <Compass size={20} />
            <span className="text-[10px] font-bold">갤러리</span>
          </Link>

          <Link
            to="/rankings"
            className={cn("flex flex-col items-center gap-1 transition-colors", isRankingsActive ? "text-primary" : "text-on-surface-variant")}
          >
            <Trophy size={20} />
            <span className="text-[10px] font-bold">랭킹</span>
          </Link>

          <Link
            to="/library"
            onClick={(e) => handleProtectedClick(e, "/library")}
            className={cn("flex flex-col items-center gap-1 transition-colors", isLibraryActive ? "text-primary" : "text-on-surface-variant")}
          >
            <Library size={20} />
            <span className="text-[10px] font-bold">내 서재</span>
          </Link>

          <Link
            to="/create"
            onClick={(e) => handleProtectedClick(e, "/create")}
            className={cn("flex flex-col items-center gap-1 transition-colors", isCreateActive ? "text-primary" : "text-on-surface-variant")}
          >
            <BookPlus size={20} />
            <span className="text-[10px] font-bold">동화 만들기</span>
          </Link>

          {isLoggedIn ? (
            <Link
              to="/profile"
              className={cn("flex flex-col items-center gap-1 transition-colors", isProfileActive ? "text-primary" : "text-on-surface-variant")}
            >
              <div className={cn("w-5 h-5 rounded-full overflow-hidden border", isProfileActive ? "border-primary" : "border-on-surface-variant")}>
                <img src={user?.profileImage || "https://i.pravatar.cc/150?u=default"} alt="프로필" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-bold">프로필</span>
            </Link>
          ) : (
            <Link to="/login" className={cn("flex flex-col items-center gap-1 transition-colors", location.pathname === "/login" ? "text-primary" : "text-on-surface-variant")}>
              <LogIn size={20} />
              <span className="text-[10px] font-bold">로그인</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
