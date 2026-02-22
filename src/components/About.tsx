import { images } from "../config/images";
import { ScrollReveal } from "./ScrollReveal";
import styles from "../styles/About.module.css";

export const About = () => {
  return (
    <section className={styles.about} id="about">
      <div className={styles.divider} />
      <div className={styles.container}>
        <ScrollReveal direction="left" className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <img
              src={images.about}
              alt="Photographer with camera"
              className={styles.image}
              loading="lazy"
            />
          </div>
        </ScrollReveal>

        <div className={styles.contentColumn}>
          <ScrollReveal direction="right" delay={0.1}>
            <span className={styles.label}>ABOUT</span>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.2}>
            <h2 className={styles.title}>
              The Story Behind
              <br />
              the Lens
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.3}>
            <p className={styles.description}>
              I believe every photograph holds a universe within it — a fleeting
              moment of light, emotion, and truth preserved forever. My work
              spans landscapes, nature, street photography, and architectural
              studies, always seeking the extraordinary in the ordinary.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.4}>
            <p className={styles.secondary}>
              Based in the Pacific Northwest. Available for commissions,
              editorial work, and gallery exhibitions worldwide.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.5}>
            <a
              href="https://instagram.com/silentshutter"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagramLink}
            >
              @silentshutter
            </a>
          </ScrollReveal>
        </div>
      </div>
      <div className={styles.divider} />
    </section>
  );
};
