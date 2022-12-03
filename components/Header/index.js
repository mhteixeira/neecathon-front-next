import Image from 'next/image'
import styles from './Header.module.css'

export default function Header({ page }) {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.upperNav}>
            <a href='.' className={styles.navbarLogo}>
                <img className={styles.logoImg} src='./icon.svg'/>
                <span className={styles.logoText}>Voice of the Employee</span>  
            </a>
            <a href='.' className={styles.navbarUser}>
                <img className={styles.userSettings} src='./images/settings.svg'/>
                <img className={styles.userPicture} src='./images/person1.svg'/>
            </a>
        </div>
        <div className={styles.navigation}>
            <a href='.' className={`${styles.button} ${page == 1? styles.selected: ''}`}>Dashboard</a>
            <a href='./feedbacks' className={`${styles.button} ${page == 2? styles.selected: ''}`}>Feedbacks</a>
        </div>
        
      </header>
      <div className={styles.space}></div>
      </>
  )
}
