import { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { categoryDetails, type CategoryPhoto } from "../config/categoryImages";
import { categories } from "../config/images";
import { ScrollReveal } from "./ScrollReveal";
import styles from "../styles/CategoryDetail.module.css";

/**
 * Chunk an array into rows, alternating between 2-col and 3-col.
 */
function buildRows(photos: CategoryPhoto[]): CategoryPhoto[][] {
  const rows: CategoryPhoto[][] = [];
  let i = 0;
  let rowIndex = 0;
  while (i < photos.length) {
    const cols = rowIndex % 2 === 0 ? 2 : 3;
    rows.push(photos.slice(i, i + cols));
    i += cols;
    rowIndex++;
  }
  return rows;
}

const rowHeights = [500, 380, 500, 440, 460, 380];

export const CategoryDetail = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const detail = categoryId ? categoryDetails[categoryId] : undefined;
  const category = categories.find((c) => c.id === categoryId);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const navigateLightbox = useCallback(
    (direction: 1 | -1) => {
      if (lightboxIndex === null || !detail) return;
      const total = detail.photos.length;
      setLightboxIndex((lightboxIndex + direction + total) % total);
    },
    [lightboxIndex, detail]
  );

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, navigateLightbox]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

  if (!detail || !category) {
    return (
      <div className={styles.categoryPage}>
        <div style={{ padding: "200px 64px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 48 }}>
            Collection not found
          </h1>
          <Link to="/" className={styles.backLink} style={{ marginTop: 40, display: "inline-block" }}>
            ← Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  const rows = buildRows(detail.photos);

  // Track global index for lightbox
  let globalIndex = 0;

  return (
    <div className={styles.categoryPage}>
      {/* Hero Banner */}
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={category.cover}
          alt={detail.name}
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <ScrollReveal delay={0.1}>
            <span className={styles.categoryLabel}>COLLECTION</span>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <h1 className={styles.categoryTitle}>{detail.name}</h1>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <p className={styles.categoryDescription}>{detail.description}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <span className={styles.photoCount}>
              {detail.photos.length} PHOTOGRAPHS
            </span>
          </ScrollReveal>
        </div>
      </motion.div>

      {/* Photo Grid */}
      <section className={styles.gridSection}>
        <div className={styles.gridContainer}>
          {rows.map((row, rowIdx) => {
            const startIdx = globalIndex;
            globalIndex += row.length;

            return (
              <ScrollReveal key={rowIdx} delay={rowIdx * 0.08}>
                <div
                  className={styles.gridRow}
                  data-cols={row.length}
                  style={{
                    height: rowHeights[rowIdx % rowHeights.length],
                  }}
                >
                  {row.map((photo, colIdx) => (
                    <motion.div
                      key={photo.id}
                      className={styles.photoCard}
                      data-aspect={photo.aspect || "landscape"}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{
                        duration: 0.6,
                        delay: colIdx * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={() => openLightbox(startIdx + colIdx)}
                    >
                      <div className={styles.photoCardInner}>
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className={styles.photoImage}
                          loading="lazy"
                        />
                        <div className={styles.photoOverlay} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Back to Portfolio */}
      <ScrollReveal>
        <div className={styles.backSection}>
          <Link to="/" className={styles.backLink}>
            ← Back to Portfolio
          </Link>
        </div>
      </ScrollReveal>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeLightbox}
          >
            <button
              className={styles.lightboxClose}
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
            >
              CLOSE
            </button>

            <button
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox(-1);
              }}
            >
              ←
            </button>

            <motion.img
              key={lightboxIndex}
              src={detail.photos[lightboxIndex].src}
              alt={detail.photos[lightboxIndex].alt}
              className={styles.lightboxImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />

            <button
              className={`${styles.lightboxNav} ${styles.lightboxNext}`}
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox(1);
              }}
            >
              →
            </button>

            <span className={styles.lightboxCounter}>
              {lightboxIndex + 1} / {detail.photos.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
