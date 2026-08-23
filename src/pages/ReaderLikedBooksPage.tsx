import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Heart, BookOpen } from "lucide-react";
import { isLoggedIn } from "../lib/auth";

type LikedBook = {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
};

const likedBooks: LikedBook[] = [
  { id: "l1", title: "달빛 아래 작은 모험", author: "하늘봄", coverImageUrl: "https://picsum.photos/seed/liked1/800/1200" },
  { id: "l2", title: "숲속 요정의 편지", author: "초록나무", coverImageUrl: "https://picsum.photos/seed/liked2/800/1200" },
  { id: "l3", title: "바다를 건너는 별", author: "푸른노리", coverImageUrl: "https://picsum.photos/seed/liked3/800/1200" },
  { id: "l4", title: "구름 마을의 비밀", author: "봄햇살", coverImageUrl: "https://picsum.photos/seed/liked4/800/1200" },
  { id: "l5", title: "노을빛 기차 여행", author: "달빛", coverImageUrl: "https://picsum.photos/seed/liked5/800/1200" },
  { id: "l6", title: "반짝이는 겨울 숲", author: "별하", coverImageUrl: "https://picsum.photos/seed/liked6/800/1200" },
];

const ReaderLikedBooksPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/reader")}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold text-on-surface">좋아요 한 책</h1>
            <p className="text-on-surface-variant text-sm md:text-base">마음에 들어 저장한 책 목록이에요</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {likedBooks.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
              className="group cursor-pointer"
            >
              <Link to={`/book/${book.id}`} className="flex flex-row sm:flex-col gap-4 sm:gap-0">
                <div className="relative w-1/3 sm:w-full aspect-[3/4] rounded-2xl overflow-hidden book-shadow sm:mb-4 group-hover:-translate-y-2 transition-transform duration-500 flex-shrink-0">
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />

                  <div className="absolute right-2 bottom-2 z-20 w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-sm bg-rose-500/95 border-rose-400 text-white">
                    <Heart size={18} className="fill-current" />
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary scale-0 group-hover:scale-100 transition-transform duration-500">
                      <BookOpen size={32} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center sm:justify-start flex-grow min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold group-hover:text-primary transition-colors truncate sm:whitespace-normal">{book.title}</h3>
                  <p className="text-on-surface-variant text-xs sm:text-sm font-medium">{book.author} 작가</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReaderLikedBooksPage;
