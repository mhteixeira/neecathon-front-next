import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js";
import { Bar } from "react-chartjs-2";
import DashboardCard from "../components/DashboardCard";
import { registerables } from "chart.js";

Chart.register(...registerables);

const pieData = {
  datasets: [
    {
      data: [30, 70],
      backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)"],
    },
  ],

  // These labels appear in the legend and in the tooltips when hovering different arcs
  labels: ["Positive", "Negative"],
};

const data = {
  labels: ["We", "are", "going", "to", "win", "Hackaton"],
  datasets: [
    {
      label: "Frequency",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

export default function Home() {
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
          <DashboardCard title={"Satisfação com a empresa"} value={"83.2"}>
            <Pie
              data={pieData}
              width={110}
              height={110}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </DashboardCard>
          <DashboardCard title={"Satisfação marginal"} value={"9.12"} />
          <DashboardCard title={"Média historíca"} value={"70.4"} />
        </div>
        <div className={styles.cardBar}>
          <Bar
            data={data}
            width={1200}
            height={400}
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
            
        <DashboardCard title={"Melhores avaliações"} value={"Benefícios & Colegas"} hidden={true} />
        <DashboardCard title={"Melhores avaliações"} value={"Chefe & Prazos"} hidden={true} />
        </div>
      </div>
    </>
  );
}
