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
  const [generalTerms, setGeneralTerms] = useState([]);
  const [positiveRate, setPositiveRate] = useState(0);
  const [dataByMonth, setDataByMonth] = useState({});

  const [showDropdown, setShowDropdown] = useState(false);

  const feedbacks = data;

  useEffect(() => {
    const regexType = /(?<=\').+?(?=\')/; // grap 'pos' 'neg'
    let terms = feedbacks.filter(feedback => feedback.id != 2828)
      .map((feedback) => {
        console.log(feedback.id)
        return JSON.parse(feedback.comment_absa_result.split(`'`).join(`"`));
      });
    let p = [];
    let n = [];
    let keys = [];
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
            if (new RegExp(regexType).test(feedback.comment_sa_result)) {
              value += parseInt(
                feedback.comment_sa_result.match(/[0-9].[0-9]/)[0]
              );
            } else {
              value -= parseInt(
                feedback.comment_sa_result.match(/[0-9].[0-9]/)[0]
              );
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
        keys.push(key);
        if (value == 1) {
          p.push(key);
        } else {
          n.push(key);
        }
      }
    });

    terms = [...new Set(keys)];
    terms = terms.map((item) => {
      let count = 0;
      let obj = {};
      for (const positiveFeedback of p) {
        if (item == positiveFeedback) {
          count += 1;
        }
      }
      for (const negativeFeedaback of n) {
        if (item == negativeFeedaback) {
          count -= 1;
        }
      }
      obj["word"] = item;
      obj["value"] = count;
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
        <div style={{ display: "flex", flexDirection: "row" }}>
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
        <div className={styles.cardBar}>
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
            height={250}
            options={{
              scales: {
                x: { title: { display: true, text: "Time (per month)" } },
              },
              plugins: {
                title: { display: true, text: "Positive feedbacks (%)" },
              },
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: "50%" }}>
            <DashboardCard
              title={"Melhores avaliações"}
              value={`${
                generalTerms.sort((a, b) => b.value - a.value)[0]?.word
              } & ${generalTerms.sort((a, b) => b.value - a.value)[1]?.word}`}
              hidden={true}
              color={"green"}
            />
          </div>
          <div style={{ width: "50%" }}>
            <DashboardCard
              title={"Piores avaliações"}
              value={`${
                generalTerms.sort((a, b) => a.value - b.value)[0]?.word
              } & ${generalTerms.sort((a, b) => a.value - b.value)[1]?.word}`}
              hidden={true}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
              showDropdown={showDropdown}
              specialCard={true}
              color={"red"}
            >
              {showDropdown ? (
                <div style={{ position: "relative" }}>
                  <div className={`${styles.dropdown} ${styles.selectedCard}`}>
                    <ul>
                      <li>Companies who suffer from ${generalTerms.sort((a, b) => a.value - b.value)[0]?.word} usually give more sallary to employeers</li>
                      <li>Companies who suffer from ${generalTerms.sort((a, b) => a.value - b.value)[0]?.word} usually make the environment more healthier</li>
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
                    .sort((a, b) => b.value - a.value)
                    .map((term) => term.word)
                    .slice(0, 10),
                  datasets: [
                    {
                      label: "Frequency",
                      data: generalTerms
                        .sort((a, b) => b.value - a.value)
                        .map((term) => term.value)
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
                    .sort((a, b) => a.value - b.value)
                    .map((term) => term.word)
                    .slice(0, 10),
                  datasets: [
                    {
                      label: "Frequency",
                      data: generalTerms
                        .sort((a, b) => a.value - b.value)
                        .map((term) => term.value)
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
  return {
    props: { data },
  };
}
