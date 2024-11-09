"use client";
import React, { useEffect, useRef } from "react";
import "@arcgis/core/assets/esri/themes/light/main.css";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Legend from "@arcgis/core/widgets/Legend";
import Query from "@arcgis/core/rest/support/Query";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";

interface ISelectedCameraQuantity {
  id: number;
  min: number;
  max: number;
  label: string;
}

interface ChroroplethMapProps {
  selectedAttributes: string[];
  selectedCameraQuantity: ISelectedCameraQuantity[];
}

const ChroroplethMap = ({
  selectedAttributes,
  selectedCameraQuantity,
}: ChroroplethMapProps) => {
  const mapDiv = useRef<HTMLDivElement | null>(null);
  const legendDiv = useRef<HTMLDivElement | null>(null);

  const query = new Query({
    where: "1=1",
    spatialRelationship: "intersects",
    returnGeometry: true,
    outStatistics: [
      {
        onStatisticField: "OBJECTID",
        outStatisticFieldName: "cameraCount",
        statisticType: "count",
      },
    ],
    groupByFieldsForStatistics: ["COUNTY"],
  });

  const queryCounty = new Query({
    where: "STATE_ABBR = 'MD'",
    returnGeometry: true,
    outFields: ["*"],
  });

  const handleQuery = async (
    countiesLayer: FeatureLayer,
    camerasLayer: FeatureLayer
  ) => {
    try {
      const cameraResults = await camerasLayer.queryFeatures(query);

      const counts = cameraResults.features.reduce(
        (acc: { [key: string]: number }, feature) => {
          const quantityNumber = feature.attributes.cameraCount || 0;
          const keyCheck = selectedAttributes.some(
            (attribute) => attribute === feature.attributes.COUNTY
          );
          const quantityCheck = selectedCameraQuantity.some(
            (quantity) =>
              quantityNumber >= quantity.min && quantityNumber <= quantity.max
          );

          const truePremiseFunction = () =>
            feature.attributes.COUNTY.replace(/\s+/gm, "")
              ? (acc[feature.attributes.COUNTY] = quantityNumber)
              : null;

          const attrBool = selectedAttributes.length > 0;
          const camBool = selectedCameraQuantity.length > 0;
          const conditionOne = attrBool && camBool && keyCheck && quantityCheck;
          const conditionTwo = attrBool && !camBool && keyCheck;
          const conditionThree = !attrBool && camBool && quantityCheck;
          const conditionFour = !attrBool && !camBool;

          (conditionOne || conditionTwo || conditionThree || conditionFour) &&
            truePremiseFunction();
          return acc;
        },
        {}
      );

      const countyResults = await countiesLayer.queryFeatures(queryCounty);
      const updatedCountyResults = countyResults.features
        .map((feature) => {
          if (!counts[feature.attributes.NAME]) return;
          feature.attributes.cameraCount = counts[feature.attributes.NAME] || 0;
          return feature;
        })
        .filter(Boolean);

      if (legendDiv.current) {
        legendDiv.current.innerHTML = Object.entries(counts)
          .map(
            ([county, count]) =>
              `<div><strong>${county}:</strong> ${count} câmeras</div>`
          )
          .join("");
      }

      return updatedCountyResults;
    } catch (error) {
      console.error("Query error:", error);
      return [];
    }
  };

  const aplyRendererInCountiesLayer = (features: any) => {
    return new FeatureLayer({
      source: features,
      objectIdField: "OBJECTID",
      fields: [
        { name: "OBJECTID", alias: "Object ID", type: "oid" },
        { name: "NAME", alias: "County Name", type: "string" },
        { name: "cameraCount", alias: "Cameras por Condado", type: "integer" },
      ],
      renderer: new ClassBreaksRenderer({
        field: "cameraCount",
        classBreakInfos: [
          {
            minValue: 1,
            maxValue: 5,
            symbol: new SimpleFillSymbol({ color: "#FFEDA0" }),
            label: "1-5 câmeras",
          },
          {
            minValue: 6,
            maxValue: 10,
            symbol: new SimpleFillSymbol({ color: "#FED976" }),
            label: "6-10 câmeras",
          },
          {
            minValue: 11,
            maxValue: 20,
            symbol: new SimpleFillSymbol({ color: "#FEB24C" }),
            label: "11-20 câmeras",
          },
          {
            minValue: 21,
            maxValue: 50,
            symbol: new SimpleFillSymbol({ color: "#FD8D3C" }),
            label: "21-50 câmeras",
          },
          {
            minValue: 51,
            maxValue: Infinity,
            symbol: new SimpleFillSymbol({ color: "#E31A1C" }),
            label: "> 50 câmeras",
          },
        ],
      }),
    });
  };

  useEffect(() => {
    const initMap = async () => {
      if (!mapDiv.current) return;

      const countiesLayer = new FeatureLayer({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_Counties/FeatureServer/0",
        outFields: ["*"],
      });
      const camerasLayer = new FeatureLayer({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Traffic_Cameras/FeatureServer/0",
        outFields: ["COUNTY"],
      });

      const features = await handleQuery(countiesLayer, camerasLayer);
      const featureCountLayer = aplyRendererInCountiesLayer(features);

      const map = new Map({
        basemap: "streets-navigation-vector",
        layers: [featureCountLayer],
      });

      const view = new MapView({
        container: mapDiv.current,
        map: map,
        center: [-76.6413, 39.0458],
        zoom: 7,
      });

      view.when(() => {
        const legend = new Legend({ view });
        view.ui.add(legend, "bottom-right");
      });
    };

    initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div ref={mapDiv} style={{ width: "100%", height: "100%" }}></div>
      <div
        ref={legendDiv}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        <h3>Legenda - Câmeras por Condado</h3>
      </div>
    </div>
  );
};

export default ChroroplethMap;
