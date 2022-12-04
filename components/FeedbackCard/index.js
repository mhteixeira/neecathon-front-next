import Image from 'next/image'
import styles from './FeedbackCard.module.css'

export default function FeedbackCard({ data, isSelected, ...props}) {
  
  return (
    <>
      <div {...props} className={`${styles.userCard} ${isSelected ? styles.selectedCard : ""}`}>
          <div className={styles.personalInfo}>
              <img src={`./images/user${data.id}.webp`} style={{width: '80px', height: '50px', objectFit: 'cover'}}></img>
              <div className={styles.personalInfoText}>
                  <span>{data.month}/{data.year}</span>
                  <h4>{data.name}</h4>
                  <p>{data.job}</p>
              </div>
          </div>
          <img 
            src={data.status ? './images/mood.svg' : './images/mood_bad.svg'} 
            className={styles.feedbackStatus}/>
      </div>
      </>
  )
}
