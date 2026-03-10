import { ScrollReveal } from "./ScrollReveal";
import styles from "../styles/About.module.css";

export const About = () => {
  return (
    <section className={styles.about} id="about">
      <div className={styles.divider} />
      <div className={styles.container}>
        <div className={styles.contentColumn} style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <ScrollReveal delay={0.1}>
            <span className={styles.label}>ABOUT</span>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <h2 className={styles.title}>
              The Story Behind
              <br />
              the Lens
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <p className={styles.description}>
              I believe every photograph holds a universe within it — a fleeting
              moment of light, emotion, and truth preserved forever. My work
              spans landscapes, nature, street photography, and architectural
              studies, always seeking the extraordinary in the ordinary.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <a
              href="https://instagram.com/silent_shutter2605"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagramLink}
            >
              @silent_shutter2605
            </a>
          </ScrollReveal>
        </div>
      </div>
      <div className={styles.divider} />
    </section>
  );
};
