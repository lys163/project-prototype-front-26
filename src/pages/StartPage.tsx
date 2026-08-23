import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { PenTool, BookOpen } from "lucide-react";
import { isLoggedIn } from "../lib/auth";

const StartPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface">어떻게 시작할까요?</h1>
          <p className="text-on-surface-variant text-base md:text-lg">원하는 역할을 선택하면 바로 시작할 수 있어요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to="/dashboard/author"
              className="group block rounded-3xl p-8 md:p-10 bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-2xl hover:-translate-y-1 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                <PenTool size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">작가로 시작하기</h2>
              <p className="text-on-primary/90">새 동화를 만들고 장면을 구성해보세요.</p>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Link
              to="/dashboard/reader"
              className="group block rounded-3xl p-8 md:p-10 border border-outline-variant/30 bg-surface-container-lowest text-on-surface shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center mb-5">
                <BookOpen size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">독자로 시작하기</h2>
              <p className="text-on-surface-variant">다른 작품을 둘러보고 읽어보세요.</p>
            </Link>
          </motion.div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-primary font-bold hover:underline">이전으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
};

export default StartPage;
