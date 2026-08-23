import { motion } from "motion/react";
import { ShieldCheck, Heart, Brain, Lock, Sparkles, CheckCircle2 } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6 magical-gradient relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none storybook-bg" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-20">
        
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest font-label"
          >
            <ShieldCheck size={16} />
            Trust & Safety
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold leading-tight tracking-tight text-on-surface"
          >
            우리아이 안심 놀이터, <br />
            <span className="text-primary italic">몽글의 안전 약속</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto font-body font-medium"
          >
            몽글은 아이들이 유해한 콘텐츠 걱정 없이 마음껏 상상력을 펼치고, 
            자신만의 동화를 창작할 수 있도록 최고 수준의 안전 기준을 준수합니다.
          </motion.p>
        </section>

        {/* Core Values / Safety Features */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl glass-card border border-white/40 space-y-4 hover:-translate-y-1 transition-transform"
          >
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-2xl font-headline font-bold text-on-surface">엄격한 AI 콘텐츠 필터링</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              몽글의 AI는 아이들에게 적합하지 않은 폭력적, 선정적, 혐오적인 단어와 이미지를 
              사전에 완벽하게 차단하도록 학습되었습니다. 부모님이 안심하고 맡길 수 있는 청정 구역입니다.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl glass-card border border-white/40 space-y-4 hover:-translate-y-1 transition-transform"
          >
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Lock size={28} />
            </div>
            <h3 className="text-2xl font-headline font-bold text-on-surface">철저한 개인정보 보호</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              아이들의 개인정보는 가장 높은 수준의 암호화 기술로 보호됩니다. 
              동화 제작에 사용된 데이터는 학습 목적으로 무단 사용되지 않으며, 
              가족의 소중한 추억으로만 안전하게 보관됩니다.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl glass-card border border-white/40 space-y-4 hover:-translate-y-1 transition-transform"
          >
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Brain size={28} />
            </div>
            <h3 className="text-2xl font-headline font-bold text-on-surface">교육적 가치 중심</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              단순한 재미를 넘어, 올바른 가치관과 교훈을 담은 스토리가 생성되도록 설계되었습니다. 
              아이들은 동화를 만들며 자연스럽게 어휘력과 논리적 사고력을 키울 수 있습니다.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl glass-card border border-white/40 space-y-4 hover:-translate-y-1 transition-transform"
          >
            <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
              <Heart size={28} />
            </div>
            <h3 className="text-2xl font-headline font-bold text-on-surface">정서적 교감과 따뜻함</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              자극적인 콘텐츠가 넘쳐나는 디지털 세상 속에서, 몽글은 
              가족이 함께 읽고 웃을 수 있는 따뜻하고 긍정적인 이야기만을 지향합니다.
            </p>
          </motion.div>
        </section>

        {/* Brand Story */}
        <section className="py-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 md:p-16 text-center space-y-8 shadow-xl border border-white"
          >
            <Sparkles className="mx-auto text-primary w-12 h-12" />
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-on-surface">
              소비자에서 창작자로, <br className="md:hidden" />아이들의 성장을 돕습니다
            </h2>
            <div className="space-y-6 text-on-surface-variant font-body text-lg max-w-3xl mx-auto leading-relaxed">
              <p>
                스마트폰과 태블릿이 일상이 된 지금, 우리 아이들은 끊임없이 쏟아지는 영상 콘텐츠를 수동적으로 소비하기만 합니다. 
                몽글 팀은 고민했습니다. <strong>"아이들이 디지털 기기를 창의적인 도구로 활용할 수는 없을까?"</strong>
              </p>
              <p>
                그렇게 탄생한 몽글은 아이의 엉뚱한 상상력에 날개를 달아줍니다. 
                하늘을 나는 강아지, 초콜릿으로 만든 성, 별빛을 먹는 고래... 
                어떤 상상이든 몽글의 AI를 만나면 아름다운 한 권의 동화책이 됩니다.
              </p>
              <p className="font-bold text-primary">
                우리는 아이들이 세상에 단 하나뿐인 자신의 이야기를 만들며 
                성취감을 느끼고, 더 큰 꿈을 꾸기를 바랍니다.
              </p>
            </div>
            
            <div className="pt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-bold text-on-surface">
                <CheckCircle2 size={18} className="text-primary" />
                광고 없는 청정 환경
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-bold text-on-surface">
                <CheckCircle2 size={18} className="text-primary" />
                전문가 자문 필터링 시스템
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-bold text-on-surface">
                <CheckCircle2 size={18} className="text-primary" />
                가족 친화적 콘텐츠
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
};

export default AboutPage;
