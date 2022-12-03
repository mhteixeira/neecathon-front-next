/* eslint-disable @next/next/no-page-custom-font */
/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Feedbacks.module.css'
import Header from '../components/Header'
import FeedbackCard from '../components/FeedbackCard'
import fsPromises from 'fs/promises';
import path from 'path'
import { useEffect, useState } from 'react'
import useSWR from 'swr'


export default function Feedbacks({ objectData, data }) {

    const [selectedCard, setSelectedCard] = useState(1);
    const [positiveTerms, setPositiveTerms] = useState([]);
    const [negativeTerms, setNegativeTerms] = useState([]);
    const feedbacks = data
    const users = objectData.users

    console.log(data)
    console.log(feedbacks)

    useEffect(() => {
        const data = JSON.parse(feedbacks[`${selectedCard-1}`].comment_absa_result.split(`'`).join(`"`))
        let p = []; let n = []
        for (const [key, value] of Object.entries(data)) {
            if(value == 1) {
                p.push(key)
            } else {
                n.push(key)
            }
        }
        setPositiveTerms(p); setNegativeTerms(n);
    }, [selectedCard]);
    
  return (
    <>
    <Head>
        <title>VoE - Feedbacks</title>
        <meta name="description" content="Submission for NEECathon'22" />
        <link rel="icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
        <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;0,900;1,400&display=swap" rel="stylesheet"/>
    </Head>

    <Header page={2}></Header>

    
    <div className={styles.container}>
        <div className={styles.users}>
            <div className={styles.title}>
                <h3>Feedbacks</h3>
                <input placeholder='Search by name or position'></input>
            </div>
            <div className={styles.usersList}>
                {feedbacks.map((e) =>                
                    <FeedbackCard 
                        key={e.id}
                        isSelected={Number(e.id)==selectedCard}
                        data={{
                            "id":e.person_id, 
                            "name": users[e.person_id].name, 
                            "job":users[e.person_id].job,
                            // "month":e.month,
                            // "year":e.year,
                            "month":'9',
                            "year":'2022',
                            "status": e.comment_sa_result.substring(2, 5)=='pos'
                        }}
                        onClick={() => {
                            setSelectedCard(e.id)
                        }}
                    />
                )}
                    
            </div>
        </div>
        <div className={styles.hline}></div>
        <div className={styles.feedbackDetails}>
            <div className={styles.detailedFeedbackUser}>
                <img src={`./images/user${feedbacks[`${selectedCard-1}`].person_id}.svg`}></img>
                <div className={styles.detailedFeedbackUserPersonalInfoText}>
                  {/* <span>{feedbacks[`${selectedCard-1}`].month}/{feedbacks[`${selectedCard-1}`].year}</span> */}
                  <span>{'09/2022'}</span>
                  <h4>{users[feedbacks[`${selectedCard-1}`].person_id].name}</h4>
                  <p>{users[feedbacks[`${selectedCard-1}`].person_id].job}</p>
              </div>
            </div>
            <div className={styles.detailedFeedbackText}>
                <h4>Feedback</h4>
                <div className={styles.detailedFeedbackTextDiv}>
                    <p>{feedbacks[`${selectedCard-1}`].comment_text}</p>
                    <img 
                        src={feedbacks[`${selectedCard-1}`].comment_sa_result.substring(2, 5)=='pos' ? './images/mood.svg' : './images/mood_bad.svg'} 
                        className={styles.feedbackStatus}/>
                </div>
            </div>
            <div className={styles.detailedFeedbackABSA}>
                <h4>Sentiment Analysis</h4>
                <div className={styles.resultsABSA}>
                    <div className={styles.stratifiedResultsABSA}>
                        <img src={'./images/thumb_up.svg'} 
                            className={styles.feedbackStatus}/>
                        <ul>
                            {positiveTerms.map((e) => {
                                return (<li key={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</li>)
                            })}
                        </ul>
                    </div>
                    <div className={styles.stratifiedResultsABSA}>
                        <img src={'./images/thumb_down_alt.svg'} 
                            className={styles.feedbackStatus}/>
                        <ul>
                            {negativeTerms.map((e) => {
                                return (<li key={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</li>)
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export async function getStaticProps() {
    const filePath = path.join(process.cwd(), 'data.json');
    const jsonData = await fsPromises.readFile(filePath);
    const objectData = JSON.parse(jsonData);

    const res = await fetch(`http://3.88.45.53:8000/api/analysis/?format=json`);
    const data = await res.json()

    return {
        props: { objectData, data }
    }
}