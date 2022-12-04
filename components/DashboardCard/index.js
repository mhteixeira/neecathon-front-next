import { useState } from "react";
import styles from "./DashboardCard.module.css";

export default function DashboardCard({
  value,
  hidden,
  children,
  showDropdown,
  title,
  color,
  specialCard,
  ...props
}) {
  const [selectedCard, setSelectedCard] = useState(false);
  return (
    <div className={`${styles.card} ${selectedCard? styles[color + 'Selected']: ''}`} {...props} onMouseOver={() => setSelectedCard(true)}
    onMouseOut={() => setSelectedCard(false)}>
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>
          <h2>{title}</h2>
          {value != undefined ? (
            <h1 className={styles[color]}>
              {value}
              {hidden ? "" : "%"}
            </h1>
          ) : (
            children
          )}
        </div>
        {!specialCard && children}
      </div>
      {specialCard && children}
    </div>
  );
}
