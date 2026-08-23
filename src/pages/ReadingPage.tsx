import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Settings, Info, Sparkles } from "lucide-react";
import {
  completeReadingProgress,
  fetchBookDetail,
  fetchReadingProgress,
  upsertReadingProgress,
  type BookDetail,
} from "../lib/api";

const ReadingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(0);
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [initializedProgress, setInitializedProgress] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchBookDetail(id)
      .then((data) => setBook(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !book || book.pages.length === 0) return;
    let cancelled = false;

    fetchReadingProgress(id)
      .then((progress) => {
        if (cancelled) return;
        const pageIndex = Math.max(0, Math.min(book.pages.length - 1, progress.lastReadPageNumber - 1));
        setCurrentPage(pageIndex);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setInitializedProgress(true);
      });

    return () => {
      cancelled = true;
    };
  }, [id, book]);

  useEffect(() => {
    if (!id || !book || book.pages.length === 0 || !initializedProgress) return;

    const pageNumber = currentPage + 1;
    const isLastPage = currentPage === book.pages.length - 1;

    const timer = window.setTimeout(() => {
      if (isLastPage) {
        void completeReadingProgress(id, pageNumber).catch(() => {});
      } else {
        void upsertReadingProgress(id, pageNumber).catch(() => {});
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [id, book, currentPage, initializedProgress]);

  if (loading) {
    return (
      <div className="h-screen bg-on-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !book || book.pages.length === 0) {
    return (
      <div className="h-screen bg-on-surface flex flex-col items-center justify-center gap-4">
        <p className="text-white/60 text-lg">
          {book?.pages.length === 0 ? "아직 페이지가 없습니다." : "책을 불러올 수 없습니다."}
        </p>
        <Link to="/explore" className="text-primary font-bold hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen bg-on-surface flex flex-col overflow-hidden">
      <div className="px-4 py-2 md:px-6 md:py-3 flex items-center justify-between text-white/60">
        <Link to={`/book/${book.bookId}`} className="flex items-center gap-2 hover:text-white transition-colors">
          <ChevronLeft size={24} />
          <span className="hidden sm:inline font-bold">상세 페이지로</span>
        </Link>
        <div className="flex flex-col items-center">
          <h2 className="text-white font-display font-bold text-lg md:text-xl text-center truncate max-w-[200px] md:max-w-md">{book.title}</h2>
          <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold">{book.pages[currentPage].pageNumber} 페이지</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 hover:text-white transition-colors"><Settings size={20} /></button>
          <button className="p-2 hover:text-white transition-colors"><Info size={20} /></button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-2 md:p-6">
        <div className="w-full max-w-[95vw] md:max-w-[90vw] h-full max-h-full aspect-auto md:aspect-[2/1] flex flex-col md:flex-row gap-1 bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Page: Illustration (Top on mobile, Left on desktop) */}
          <div className="flex-1 relative h-1/2 md:h-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentPage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8 }}
                src={book.pages[currentPage].imageUrl || book.coverImageUrl || undefined}
                alt="페이지 일러스트"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 glass px-4 py-2 rounded-full text-[10px] md:text-xs font-bold">
              {book.pages[currentPage].pageNumber} 페이지
            </div>
          </div>

          {/* Page: Text (Bottom on mobile, Right on desktop) */}
          <div className="flex-1 bg-surface-container-lowest p-6 md:p-16 flex flex-col justify-center relative h-1/2 md:h-full">
            <div className="absolute top-4 right-4 md:top-8 md:right-8 text-primary/20">
              <Sparkles size={32} className="md:w-12 md:h-12" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4 md:space-y-8"
              >
                <p className="text-xl md:text-3xl font-display leading-relaxed text-on-surface">
                  {book.pages[currentPage].content}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-6 left-6 right-6 md:bottom-16 md:left-16 md:right-16 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full glass flex items-center justify-center hover:bg-white transition-all disabled:opacity-30"
              >
                <ChevronLeft size={20} className="md:w-6 md:h-6" />
              </button>
              <div className="flex-1 mx-4 md:mx-8 h-1 bg-on-surface-variant/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={false}
                  animate={{ width: `${((currentPage + 1) / book.pages.length) * 100}%` }}
                />
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(book.pages.length - 1, prev + 1))}
                disabled={currentPage === book.pages.length - 1}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary text-white flex items-center justify-center hover:bg-secondary transition-all disabled:opacity-30"
              >
                <ChevronRight size={20} className="md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingPage;
