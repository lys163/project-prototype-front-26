import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { redirectToKakaoLogin, redirectToNaverLogin } from "../lib/auth";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-surface font-body text-on-surface">
      <main className="flex-grow flex items-center justify-center relative pt-20 pb-12 px-6">
        <div
          className="absolute inset-0 z-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-BOjPd2NLrVS5sE-5ZN7YWo3Y5QbPQAPT7_bOwJPcnmoVrxT4d9i4_SnN6Y88uXp75QO_VQn_qcxq1AzpF6xrW9VJYn_twsEPKDbAWTB99JIH3YZDc4C5ENtV43qZek7Q7dQdyDnx8okJHSZu9WzbCk16v3hmn2IVXhPmuJxoF_J-7J2pSyp3zpUN9erkCujXGobAl-4czmAPpH5lC_II2Zfy03AtX9xmbPk5lJkdAEM0t1A3-Is_vJb9LrWSi9rcF-QYrH94g1VZ')",
            backgroundSize: "cover"
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="glass-card rounded-xl p-8 md:p-10 shadow-[0px_20px_40px_rgba(39,48,87,0.06)] border border-white/20">
            <div className="text-center mb-10">
              <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2 break-keep">
                다시 오신 것을 <br className="block sm:hidden" />환영해요
              </h1>
              <p className="text-on-surface-variant text-sm font-medium">소셜 계정으로 간편하게 시작하세요</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={redirectToNaverLogin}
                className="w-full flex items-center justify-center gap-3 bg-[#03C75A] text-white py-4 rounded-xl hover:brightness-95 active:scale-[0.98] transition-all font-bold text-base shadow-md"
              >
                <span className="w-6 h-6 flex items-center justify-center font-black text-sm border-2 border-white rounded-md">N</span>
                네이버로 시작하기
              </button>
              <button
                onClick={redirectToKakaoLogin}
                className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#191919] py-4 rounded-xl hover:brightness-95 active:scale-[0.98] transition-all font-bold text-base shadow-md"
              >
                <MessageCircle size={24} fill="currentColor" />
                카카오로 시작하기
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default LoginPage;
