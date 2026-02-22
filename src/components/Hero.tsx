import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { images } from "../config/images";
import { ScrollReveal } from "./ScrollReveal";
import styles from "../styles/Hero.module.css";

export const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className={styles.hero} id="home">
      <motion.div className={styles.imageWrapper} style={{ y: imageY }}>
        <img
          src={images.hero}
          alt="Dramatic mountain landscape at golden hour"
          className={styles.image}
        />
      </motion.div>
      <div className={styles.gradient} />
      <motion.div className={styles.content} style={{ opacity: contentOpacity }}>
        <ScrollReveal delay={0.4}>
          <h1 className={styles.title}>Capturing Light & Shadows</h1>
        </ScrollReveal>
        <ScrollReveal delay={0.6}>
          <p className={styles.subtitle}>SILENT SHUTTER — PHOTOGRAPHY</p>
        </ScrollReveal>
      </motion.div>
    </section>
  );
};
