export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <p className="footer-message">
          작은 일상과 따뜻한 이야기가 모이는 곳
        </p>

        <p className="footer-copyright">
          © {new Date().getFullYear()} Utangland
        </p>
      </div>
    </footer>
  );
}