import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Sparkles, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { setAccessToken } from "../lib/auth";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const isNewUser = searchParams.get("isNewUser") === "true";

    if (!accessToken) {
      setError(true);
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    // 토큰 저장
    setAccessToken(accessToken);

    if (isNewUser) {
      // 신규 유저: 폭죽 + 선택 화면
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#ec4899"],
      });
      setSuccess(true);
    } else {
      // 기존 유저: 바로 홈으로
      navigate("/");
    }
  }, [searchParams, navigate]);

  const goHome = () => navigate("/");
  const goProfile = () => navigate("/profile");

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="glass-card rounded-2xl p-12 shadow-2xl border border-white/30 flex flex-col items-center">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-6 text-error">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-headline font-black text-on-surface mb-2">
              로그인 실패
            </h2>
            <p className="text-on-surface-variant font-medium">
              다시 시도해주세요. <br /> 로그인 페이지로 이동합니다.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!success) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="glass-card rounded-2xl p-12 shadow-2xl border border-white/30 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
            <Sparkles size={40} className="animate-pulse" />
          </div>
          <h2 className="text-3xl font-headline font-black text-on-surface mb-2">
            반가워요!
          </h2>
          <p className="text-on-surface-variant font-medium mb-8">로그인에 성공했습니다. <br /> 어디로 이동할까요?</p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={goHome}
              className="flex-1 py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-secondary transition-all"
            >
              홈으로
            </button>
            <button
              onClick={goProfile}
              className="flex-1 py-4 glass rounded-xl font-bold hover:bg-white transition-all text-on-surface"
            >
              나의 프로필로
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OAuthCallbackPage;
