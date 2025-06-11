import { useEffect, useState } from "react";
import { FaAngleDoubleUp, FaAngleDoubleDown } from "react-icons/fa";

const ScrollToTopBottom = () => {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 100); 
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollClick = () => {
    if (isAtTop) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      onClick={handleScrollClick}
      className="bg-white p-4 animate-bounce w-fit rounded-full cursor-pointer shadow-md fixed bottom-6 right-6 z-50"
    >
      {isAtTop ? <FaAngleDoubleDown size={20} /> : <FaAngleDoubleUp size={20} />}
    </div>
  );
};

export default ScrollToTopBottom;
