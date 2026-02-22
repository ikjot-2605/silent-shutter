import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "../styles/Header.module.css";

const navItems = [
  { label: "PORTFOLIO", href: "#portfolio" },
  { label: "ABOUT", href: "#about" },
  { label: "CONTACT", href: "#contact" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);

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
      <a href="#home" className={styles.logo}>
        Silent Shutter
      </a>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <a key={item.href} href={item.href} className={styles.navLink}>
            {item.label}
          </a>
        ))}
      </nav>
    </motion.header>
  );
};
