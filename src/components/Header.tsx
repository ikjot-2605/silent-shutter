import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import styles from "../styles/Header.module.css";

const homeNavItems = [
  { label: "PORTFOLIO", href: "#portfolio" },
  { label: "ABOUT", href: "#about" },
  { label: "CONTACT", href: "#contact" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            <a key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </a>
          ))
        ) : (
          <>
            <Link to="/" className={styles.navLink}>
              ← BACK
            </Link>
            <Link to="/#about" className={styles.navLink}>
              ABOUT
            </Link>
            <Link to="/#contact" className={styles.navLink}>
              CONTACT
            </Link>
          </>
        )}
      </nav>
    </motion.header>
  );
};
