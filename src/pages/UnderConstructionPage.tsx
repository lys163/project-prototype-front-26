import { motion } from "motion/react";
import { Hammer, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

const UnderConstructionPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-background text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center space-y-8"
      >
        {/* Icon with Animation */}
        <div className="relative inline-block">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              y: [0, -5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
            className="p-6 bg-primary/10 rounded-full"
          >
            <Hammer className="w-16 h-16 text-primary" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full border-4 border-background"
          />
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-serif italic text-primary">
            페이지 준비 중이에요
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            더 멋진 경험을 위해 열심히 작업하고 있어요.<br />
            조금만 더 기다려 주세요!
          </p>
        </div>

        {/* Progress Bar (Visual only) */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "75%" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-primary"
          />
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
          Progress: 75% Complete
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 border border-muted-foreground/20 rounded-full font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            이전 페이지
          </button>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="fixed bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary/5 to-transparent -z-10" />
    </div>
  );
};

export default UnderConstructionPage;
