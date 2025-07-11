import { useEffect, useState } from "react";

interface WindowsDimensions {
  width: number;
  height: number;
}

const useWindowsDimensions = (): WindowsDimensions => {
  const [size, setSize] = useState<WindowsDimensions>({
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    width: typeof window !== "undefined" ? window.innerWidth : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
};

export default useWindowsDimensions;
