"use client";
// components/Map.js
import React, { useEffect, useRef, useState } from "react";
import "@arcgis/core/assets/esri/themes/light/main.css";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Legend from "@arcgis/core/widgets/Legend";
import Query from "@arcgis/core/rest/support/Query";

interface AttributeData {
  [key: string]: number;
}

interface ArcGISMapProps {
  setAttributes: (attributes: AttributeData | null) => void;
}

const ArcGISMap = ({ setAttributes }: ArcGISMapProps) => {
  const mapDiv = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && mapDiv.current) {
      const map = new Map({
        basemap: "streets-navigation-vector",
      });

      const view = new MapView({
        container: mapDiv.current,
        map: map,
        center: [-76.6413, 39.0458],
        zoom: 7,
      });

      const countiesLayer: any = new FeatureLayer({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_Counties/FeatureServer/0",
        outFields: ["*"],
      });

      const camerasLayer = new FeatureLayer({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Traffic_Cameras/FeatureServer/0",
        outFields: ["*"],
      });

      map.add(countiesLayer);
      map.add(camerasLayer);

      const query = new Query({
        where: "1=1",
        spatialRelationship: "intersects",
        returnGeometry: false,
        outStatistics: [
          {
            onStatisticField: "OBJECTID",
            outStatisticFieldName: "cameraCount",
            statisticType: "count",
          },
        ],
        groupByFieldsForStatistics: ["COUNTY"],
      });

      camerasLayer.queryFeatures(query).then((results) => {
        const counts = results.features.reduce(
          (acc: { [key: string]: number }, feature) => {
            acc[feature.attributes.COUNTY] = feature.attributes.cameraCount;
            return acc;
          },
          {}
        );

        setAttributes(counts);

        const renderer = {
          type: "simple",
          symbol: {
            type: "simple-fill",
            size: "8px",
            outline: {
              width: 1,
              color: "black",
            },
          },
        };

        countiesLayer.renderer = renderer;
      });

      // Adicionando legenda
      const legend = new Legend({
        view: view,
      });

      view.ui.add(legend, "bottom-right");
    }
  }, [setAttributes, isClient]);

  return <div style={{ width: "100%", height: "100vh" }} ref={mapDiv}></div>;
};

export default ArcGISMap;
