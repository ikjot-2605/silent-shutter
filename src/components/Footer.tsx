import { ScrollReveal } from "./ScrollReveal";
import styles from "../styles/Footer.module.css";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/silentshutter",
  },
  {
    label: "Behance",
    href: "https://behance.net/silentshutter",
  },
  {
    label: "500px",
    href: "https://500px.com/silentshutter",
  },
];

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.divider} />
      <ScrollReveal>
        <div className={styles.container}>
          <span className={styles.copyright}>
            &copy; {new Date().getFullYear()} Silent Shutter. All rights
            reserved.
          </span>
          <div className={styles.social}>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </footer>
  );
};
