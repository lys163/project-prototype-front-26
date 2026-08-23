import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { User, Lock, Mail, CheckCircle, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePassword = (password: string) => {
    // Minimum 8 characters, at least one special character
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return password.length >= 8 && specialCharRegex.test(password);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("이름은 최소 2자 이상이어야 합니다.");
      return;
    }

    if (!validateEmail(email)) {
      setError("유효한 이메일 주소를 입력해주세요.");
      return;
    }

    if (!validatePassword(password)) {
      setError("비밀번호는 최소 8자 이상이며, 최소 하나의 특수문자를 포함해야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    // Trigger Success State
    setIsSuccess(true);
    
    // Trigger Confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Redirect after a delay
    setTimeout(() => {
      navigate("/");
      window.location.reload(); // Refresh to update navbar state
    }, 4000);
  };

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
        
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="signup-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 w-full max-w-md"
            >
              <div className="glass-card rounded-xl p-8 md:p-10 shadow-[0px_20px_40px_rgba(39,48,87,0.06)] border border-white/20">
                <div className="text-center mb-8">
                  <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">새로운 모험을 시작해보세요</h1>
                  <p className="text-on-surface-variant text-sm font-medium">당신만의 마법 같은 이야기를 만들어보세요</p>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  {error && (
                    <div className="bg-error-container/10 border border-error/20 text-error text-xs font-bold p-3 rounded-lg text-center">
                      {error}
                    </div>
                  )}
                  
                  {/* Input: Name */}
                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-on-surface ml-1 font-label">이름</label>
                    <div className="relative">
                      <input 
                        className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 transition-all outline-none" 
                        placeholder="홍길동" 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
                    </div>
                  </div>

                  {/* Input: Email */}
                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-on-surface ml-1 font-label">이메일</label>
                    <div className="relative">
                      <input 
                        className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 transition-all outline-none" 
                        placeholder="dreamer@magic.com" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
                    </div>
                  </div>
                  
                  {/* Input: Password */}
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-on-surface font-label ml-1">비밀번호</label>
                    <div className="relative">
                      <input 
                        className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 transition-all outline-none" 
                        placeholder="••••••••" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
                    </div>
                    <p className="text-[10px] text-on-surface-variant/60 ml-1">최소 8자 이상, 특수문자 포함</p>
                  </div>

                  {/* Input: Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-on-surface font-label ml-1">비밀번호 확인</label>
                    <div className="relative">
                      <input 
                        className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 transition-all outline-none" 
                        placeholder="••••••••" 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
                    </div>
                  </div>
                  
                  <button 
                    className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all mt-4" 
                    type="submit"
                  >
                    회원가입
                  </button>
                </form>
                
                <p className="text-center mt-8 text-on-surface-variant text-sm font-medium">
                  이미 계정이 있으신가요? <Link className="text-primary font-bold hover:underline" to="/login">로그인</Link>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 100 }}
              className="relative z-10 w-full max-w-md text-center"
            >
              <div className="glass-card rounded-2xl p-12 shadow-2xl border border-white/30 flex flex-col items-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                  <Sparkles size={48} className="animate-pulse" />
                </div>
                <h2 className="text-4xl font-headline font-black text-on-surface mb-4 leading-tight">
                  환영합니다, <br /> {name}님!
                </h2>
                <p className="text-on-surface-variant text-lg font-medium mb-8">
                  마법 같은 이야기의 세계가 <br /> 당신을 기다리고 있어요.
                </p>
                <div className="flex items-center gap-2 text-primary font-bold animate-bounce">
                  <span>잠시 후 모험이 시작됩니다</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    🚀
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SignUpPage;
