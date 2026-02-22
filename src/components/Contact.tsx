import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import styles from "../styles/Contact.module.css";

export const Contact = () => {
  return (
    <section className={styles.contact} id="contact">
      <div className={styles.divider} />
      <div className={styles.container}>
        <ScrollReveal delay={0}>
          <span className={styles.label}>GET IN TOUCH</span>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 className={styles.title}>
            Let&rsquo;s Create
            <br />
            Something Beautiful
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className={styles.description}>
            Available for commissions, collaborations, and prints.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <motion.a
            href="mailto:hello@silentshutter.com"
            className={styles.button}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            hello@silentshutter.com
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  );
};
