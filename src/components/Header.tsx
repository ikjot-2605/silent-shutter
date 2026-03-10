import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/Header.module.css";

const homeNavItems = [
  { label: "PORTFOLIO", sectionId: "portfolio" },
  { label: "ABOUT", sectionId: "about" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback(
    (sectionId: string) => {
      if (isHome) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        // Wait for home page to render, then scroll
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    },
    [isHome, navigate]
  );

  return (
    <motion.header
      className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to="/" className={styles.logo}>
        Silent Shutter
      </Link>
      <nav className={styles.nav}>
        {isHome ? (
          homeNavItems.map((item) => (
            <a
              key={item.sectionId}
              href={`#${item.sectionId}`}
              className={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(item.sectionId);
              }}
            >
              {item.label}
            </a>
          ))
        ) : (
          <>
            <Link to="/" className={styles.navLink}>
              ← BACK
            </Link>
            <a
              href="#about"
              className={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                scrollTo("about");
              }}
            >
              ABOUT
            </a>
          </>
        )}
      </nav>
    </motion.header>
  );
};
