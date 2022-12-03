import styles from './DashboardCard.module.css';


export default function DashboardCard(props) {
  return (
    <div className={styles.card}>
      <div
        className={styles.cardBody}
      >
        <div className={styles.cardTitle}>
          <h2>{props.title}</h2>
          {props.value != undefined ? <h1>{props.value}{props.hidden ? '': '%'}</h1> : props.children}
        </div>
        {props.value != undefined && props.children}
      </div>
    </div>
  );
}
