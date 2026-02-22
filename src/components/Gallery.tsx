import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { categories } from "../config/images";
import { ScrollReveal } from "./ScrollReveal";
import styles from "../styles/Gallery.module.css";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

interface GalleryCardProps {
  id: string;
  name: string;
  count: number;
  cover: string;
  index: number;
}

const GalleryCard = ({ id, name, count, cover, index }: GalleryCardProps) => (
  <Link to={`/category/${id}`} style={{ textDecoration: "none", flex: 1 }}>
    <motion.div
      className={styles.card}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      custom={index}
    >
      <div className={styles.cardImageWrapper}>
        <img
          src={cover}
          alt={`${name} photography`}
          className={styles.cardImage}
          loading="lazy"
        />
        <div className={styles.cardOverlay} />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{name}</h3>
        <span className={styles.cardCount}>{count} photographs</span>
      </div>
    </motion.div>
  </Link>
);

export const Gallery = () => {
  const topRow = categories.slice(0, 2);
  const bottomRow = categories.slice(2, 5);

  return (
    <section className={styles.gallery} id="portfolio">
      <div className={styles.container}>
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Selected Works</h2>
            <span className={styles.sectionMeta}>2024 — 2026</span>
          </div>
        </ScrollReveal>

        <div className={styles.grid}>
          <div className={styles.row}>
            {topRow.map((cat, i) => (
              <GalleryCard key={cat.id} {...cat} index={i} />
            ))}
          </div>
          <div className={styles.row}>
            {bottomRow.map((cat, i) => (
              <GalleryCard key={cat.id} {...cat} index={i + 2} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
