"use client";
// pages/index.js
import Head from "next/head";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./components/ArcGISMap"), {
  ssr: false,
});

export default function Home() {
  return (
    <div>
      <Head>
        <title>Mapa Coroplético de Câmeras de Tráfego</title>
        <meta
          name="description"
          content="Mapa coroplético baseado na contagem de câmeras de tráfego por condado"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 style={{ textAlign: "center" }}>
          Mapa Coroplético de Câmeras de Tráfego por Condado
        </h1>
        <MapComponent />
      </main>
    </div>
  );
}
