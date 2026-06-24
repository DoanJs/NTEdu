import { useEffect, useState } from "react";
import "./ScrollButtons.css";

const ScrollButtons = () => {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      // Hiện nút lên đầu
      setShowTop(scrollTop > 200);

      // Ẩn nút xuống cuối khi gần cuối trang
      setShowBottom(scrollTop + windowHeight < fullHeight - 200);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Scroll lên đầu
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Scroll xuống cuối
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="scroll-buttons">
      {showTop && (
        <button
          className="btn scroll-btn scroll-btn-light"
          onClick={scrollToTop}
        >
          <i className="bi bi-chevron-up"></i>
        </button>
      )}

      {showBottom && (
        <button
          className="btn scroll-btn scroll-btn-primary"
          onClick={scrollToBottom}
        >
          <i className="bi bi-chevron-down"></i>
        </button>
      )}
    </div>
  );
};

export default ScrollButtons;
