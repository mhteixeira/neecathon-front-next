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
import fsPromises from "fs/promises";
import { monthString } from "../components/utils/date.js";

Chart.register(...registerables);

export default function Home({ objectData, data }) {
  const [generalTerms, setGeneralTerms] = useState([]);
  const [positiveRate, setPositiveRate] = useState(0);
  const [dataByMonth, setDataByMonth] = useState({});

  const [showDropdown, setShowDropdown] = useState(false);

  const feedbacks = data;
  const users = objectData.users;

  useEffect(() => {
    const regexType = /(?<=\').+?(?=\')/; // grap 'pos' 'neg'
    let terms = feedbacks.map((feedback) =>
      JSON.parse(feedback.comment_absa_result.split(`'`).join(`"`))
    );
    let p = [];
    let n = [];
    let keys = [];
    let months = [
      ...new Set(
        feedbacks.map((feedback) => 12 - parseInt(feedback.person_id))
      ),
    ];
    let datasetSeparateByMonth = {};
    months.map((month) => {
      let count = 0;
      let value = 0;
      for (const feedback of feedbacks) {
        if (12 - parseInt(feedback.person_id) == month) {
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
      datasetSeparateByMonth[month] = { rate: (value / count) * 100 };
    });
    setDataByMonth(datasetSeparateByMonth);
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
            value={dataByMonth[new Date().getMonth() + 1]?.rate.toFixed(2)}
            color={'green'}
          >
            <Pie
              data={{
                datasets: [
                  {
                    data: [
                      100 - dataByMonth[new Date().getMonth() + 1]?.rate,
                      dataByMonth[new Date().getMonth() + 1]?.rate,
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
              dataByMonth[new Date().getMonth() + 1]?.rate -
              dataByMonth[new Date().getMonth()]?.rate
            ).toFixed(2)}
            color={'green'}
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
            color={'green'}
          />
        </div>
        <div className={styles.cardBar}>
          <h2>Visão sobre a empresa</h2>
          <Bar
            data={{
              labels: Object.keys(dataByMonth).map(function (key) {
                return monthString[parseInt(key) - 1];
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
              color={'green'}
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
              color={'red'}
            >
              {showDropdown ? (
                <div style={{ position: "relative" }}>
                  <div className={`${styles.dropdown} ${styles.selectedCard}`}>
                    <ul>
                      <li>Try this</li>
                      <li>Try that</li>
                      <li>Try third</li>
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
            <div className={styles.cardBar}>
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
                      borderColor: "#742774",
                    },
                  ],
                }}
                width={1200}
                height={400}
              />
            </div>
          </div>
          <div style={{ width: "50%" }}>
            <div className={styles.cardBar}>
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
                      borderColor: "#742774",
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
  const filePath = path.join(process.cwd(), "data.json");
  const jsonData = await fsPromises.readFile(filePath);
  const objectData = JSON.parse(jsonData);

  const res = await fetch(`http://3.88.45.53:8000/api/analysis/?format=json`);
  const data = await res.json();

  return {
    props: { objectData, data },
  };
}
