import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full py-12 mt-auto bg-surface-container-low">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 gap-6 w-full max-w-7xl mx-auto">
        <div className="text-lg font-bold text-on-surface font-headline">mongle</div>
        <div className="flex flex-wrap justify-center gap-6 font-body text-sm text-on-surface/70">
          <Link className="hover:text-primary transition-colors" to="/about">브랜드 스토리</Link>
          <Link className="hover:text-primary transition-colors" to="#">개인정보 처리방침</Link>
          <Link className="hover:text-primary transition-colors" to="#">이용약관</Link>
          <Link className="hover:text-primary transition-colors" to="#">고객센터</Link>
        </div>
        <div className="text-sm font-body text-on-surface/70">
          © 2026 몽글. 어린 꿈나무들을 위해 만들어졌어요.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
