import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import DashboardCard from "../components/DashboardCard";
import { registerables } from "chart.js";
import { useEffect, useState } from "react";
import path from "path";
//import fsPromises from "fs/promises";
import { monthString } from "../components/utils/date.js";

Chart.register(...registerables);

export default function Home({ data }) {
  const [negativeTerms, setNegativeTerms] = useState([]);
  const [generalTerms, setGeneralTerms] = useState([]);
  const [positiveRate, setPositiveRate] = useState(0);
  const [dataByMonth, setDataByMonth] = useState({});

  const [showDropdown, setShowDropdown] = useState(false);

  const feedbacks = data;

  useEffect(() => {
    const regexType = /(?<=\').+?(?=\')/; // grap 'pos' 'neg'
    let terms = feedbacks.filter(feedback => feedback.id != 2828 && feedback.id != 6898)
      .map((feedback) => {
        return JSON.parse(feedback.comment_absa_result.split(`'`).join(`"`));
      });
    let p = [];
    let n = [];
    let keys = [];
    let negatives = [];
    let months = [
      ...new Set(
        feedbacks.map((feedback) =>
          feedback.month == "12" ? "Dec" : feedback.month
        )
      ),
    ];
    let years = [...new Set(feedbacks.map((feedback) => feedback.year))];
    let datasetSeparateByMonth = {};
    years.map((year) => {
      let obj = {};
      for (const month of months) {
        let count = 0;
        let value = 0;
        for (const feedback of feedbacks) {
          if (feedback.month == month && feedback.year == year) {
            count += 1;
            console.log(feedback.comment_sa_result)
            console.log(new RegExp(regexType).test(feedback.comment_sa_result))
            if (feedback.comment_sa_result.match(regexType) == 'pos') {
              console.log(feedback.comment_sa_result)
                value += 1
              }
          }
        }
        obj[month] = { rate: count > 0 ? (value / count) * 100 : 0 };
      }
      datasetSeparateByMonth[year] = obj;
    });
    setDataByMonth(datasetSeparateByMonth["2022"]);
    terms.map((data) => {
      for (const [key, value] of Object.entries(data)) {
        keys.push(key.toLowerCase());
        if (value > 0) {
          p.push(key.toLowerCase());
        } else {
          n.push(key.toLowerCase());
        }
      }
    });

    terms = [...new Set(keys)];
    terms = terms.map((item) => {
      let count_positive = 0;
      let count_negative = 0;
      let obj = {};
      for (const positiveFeedback of p) {
        if (item == positiveFeedback) {
          count_positive += 1;
        }
      }
      for (const negativeFeedaback of n) {
        if (item == negativeFeedaback) {
          count_negative += 10;
        }
      }
      obj["word"] = item;
      obj["value_negative"] = count_negative;
      obj['value_positive'] = count_positive;
      return obj;
    });

    setGeneralTerms(terms);
    setPositiveRate(
      (terms
        .map((item) => item.value)
        .reduce((partialSum, a) => partialSum + a, 0) /
        (n.length + p.length)) *
        100
    );
  }, []);

  return (
    <>
      <Head>
        <title>VoE - Dashboard</title>
        <meta name="description" content="Submission for NEECathon'22" />
        <link rel="icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;0,900;1,400&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Header page={1}></Header>

      <div className={styles.container}>
        <div style={{ display: "flex", flexDirection: "row", width:'' }}>
          <DashboardCard
            title={"Satisfação com a empresa"}
            value={dataByMonth[
              monthString[new Date().getMonth()]
            ]?.rate.toFixed(2)}
            color={"green"}
          >
            <Pie
              data={{
                datasets: [
                  {
                    data: [
                      100 -
                        dataByMonth[monthString[new Date().getMonth()]]?.rate,
                      dataByMonth[monthString[new Date().getMonth()]]?.rate,
                    ],
                    backgroundColor: ["red", "rgb(54, 162, 235)"],
                  },
                ],
              }}
              width={110}
              height={120}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </DashboardCard>
          <DashboardCard
            title={"Satisfação marginal"}
            value={(
              dataByMonth[monthString[new Date().getMonth()]]?.rate -
              dataByMonth[monthString[new Date().getMonth() - 1]]?.rate
            ).toFixed(2)}
            color={"green"}
          />
          <DashboardCard
            title={"Média historíca"}
            value={(
              Object.keys(dataByMonth)
                .map(function (key) {
                  return dataByMonth[key].rate;
                })
                .reduce((partialSum, a) => partialSum + a, 0) /
              Object.keys(dataByMonth).length
            ).toFixed(2)}
            color={"green"}
          />
        </div>
        <div className={`${styles.cardBar} ${styles.barPlot}`}>
          <h2>Visão sobre a empresa</h2>
          <Bar
            data={{
              labels: Object.keys(dataByMonth).map(function (key) {
                return key;
              }),
              datasets: [
                {
                  label: "Frequency",
                  data: Object.keys(dataByMonth).map(function (key) {
                    return dataByMonth[key].rate;
                  }),
                  borderWidth: 1,
                },
              ],
            }}
            width={1800}
            height={700}
            options={{
              scales: {
                x: { title: { display: true, text: "Time (per month)", font: {
                  size: 18,
              } },ticks: {
                  font: {
                      size: 18,
                  }
              } },
              },
              plugins: {
                title: { display: true, text: "Positive feedbacks (%)", font: {
                  size: 18,
              }},
                legend: {
                  labels: {
                      // This more specific font property overrides the global property
                      font: {
                          size: 18
                      }
                  }
              }
              },
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: "50%" }}>
            <DashboardCard
              title={"Melhores avaliações"}
              value={`${
                generalTerms.sort((a, b) => b.value_positive - a.value_positive)[0]?.word
              } & ${generalTerms.sort((a, b) => b.value_positive - a.value_positive)[1]?.word}`}
              hidden={true}
              color={"green"}
            />
          </div>
          <div style={{ width: "50%" }}>
            <DashboardCard
              title={"Piores avaliações"}
              value={`${
                generalTerms.sort((a, b) => b.value_negative - a.value_negative).slice(2, 4)[0]?.word
              } & ${generalTerms.sort((a, b) => b.value_negative - a.value_negative).slice(2, 4)[1]?.word}`}
              hidden={true}
              onMouseOver={() => setShowDropdown(true)}
              onMouseOut={() => setShowDropdown(false)}
              showDropdown={showDropdown}
              specialCard={true}
              color={"red"}
            >
              {showDropdown ? (
                <div style={{ position: "relative" }}>
                  <div className={`${styles.dropdown} ${styles.selectedCard}`}>
                    <ul>
                      <li style={{textDecoration:'underline', cursor:'pointer'}}>What to do when employees complain about <b>{generalTerms.sort((a, b) => b.value_negative - a.value_negative)[0]?.word}</b></li>
                      <li style={{textDecoration:'underline'}}>What to do when employees complain about <b>{generalTerms.sort((a, b) => b.value_negative - a.value_negative)[1]?.word}</b></li>
                    </ul>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </DashboardCard>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: "50%" }}>
            <div className={styles.cardBarGreen}>
              <h2>Termos bem avaliados</h2>
              <Line
                data={{
                  labels: generalTerms
                    .sort((a, b) => b.value_positive - a.value_positive)
                    .map((term) => term.word)
                    .slice(0, 10),
                  datasets: [
                    {
                      label: "Frequency",
                      data: generalTerms
                        .sort((a, b) => b.value_positive - a.value_positive)
                        .map((term) => term.value_positive)
                        .slice(0, 10),
                      fill: false,
                      borderColor: "#0D8E0B",
                    },
                  ],
                }}
                width={1200}
                height={400}
              />
            </div>
          </div>
          <div style={{ width: "50%" }}>
            <div className={styles.cardBarRed}>
              <h2>Termos mal avaliados</h2>
              <Line
                data={{
                  labels: generalTerms
                    .sort((a, b) => b.value_negative - a.value_negative)
                    .map((term) => term.word)
                    .slice(2, 11),
                  datasets: [
                    {
                      label: "Frequency",
                      data: generalTerms
                        .sort((a, b) => b.value_negative - a.value_negative)
                        .map((term) => term.value_negative)
                        .slice(0, 10),
                      fill: false,
                      borderColor: "#D30000",
                    },
                  ],
                }}
                width={1200}
                height={400}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const res = await fetch(`http://3.88.45.53:8000/api/analysis/?format=json`);
  const data = await res.json();
  //const res = path.join(process.cwd(), "test.json");
  //const data = JSON.parse(await fsPromises.readFile(res));
  // const filteredData = data.sort((a, b) =>  b.id- a.id).slice(0, 100);
  return {
    props: { data },
  };
}
