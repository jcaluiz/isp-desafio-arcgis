"use client";

import dynamic from "next/dynamic";
import { Select, SelectItem } from "@nextui-org/select";
import { Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import ChroroplethMap from "./components/ChroroplethMap";

const MapComponent = dynamic(() => import("./components/ArcGISMap"), {
  ssr: false,
});

interface AttributeData {
  [key: string]: number;
}

export default function Home() {
  const [attributes, setAttributes] = useState<AttributeData | null>(null);
  const [attributesKeys, setAttributesKeys] = useState<string[] | []>([]);
  const [search, setSearch] = useState<boolean>(false);
  const [cameraQuantity] = useState([
    { id: 1, min: 1, max: 5, label: "1-5 câmeras" },
    { id: 2, min: 6, max: 10, label: "6-10 câmeras" },
    { id: 3, min: 11, max: 20, label: "11-20 câmeras" },
    { id: 4, min: 21, max: 50, label: "21-50 câmeras" },
    { id: 5, min: 51, max: 10000, label: "> 50 câmeras" },
  ]);

  useEffect(() => {
    if (attributes) {
      const keys = Object.keys(attributes);
      if (attributesKeys.length === 0)
        setAttributesKeys((_prevAttributes) => [
          ...keys.filter((e) => e !== "Baltimore City"),
        ]);
    }
  }, [attributes, attributesKeys]);

  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedCameraQuantity, setSelectedCameraQuantity] = useState<
    { id: number; min: number; max: number; label: string }[]
  >([]);

  const handleSelectionChange = (keys: any) => {
    const selectedItems = Array.from(keys).map((selectedId) =>
      cameraQuantity.find((item) => item.id === Number(selectedId))
    );
    setSelectedCameraQuantity(
      selectedItems.filter((item) => item !== undefined) as {
        id: number;
        min: number;
        max: number;
        label: string;
      }[]
    );
  };

  return (
    <div className="relative">
      <header className="absolute  w-screen z-20">
        <div className="flex h-24 justify-around items-center">
          {!search && (
            <>
              <Select
                label="Busca por condado"
                className="max-w-xs"
                selectionMode="multiple"
                onSelectionChange={(selected) =>
                  setSelectedAttributes(Array.from(selected) as string[])
                }
              >
                {attributesKeys.map((key) => (
                  <SelectItem key={key}>{key}</SelectItem>
                ))}
              </Select>
              <Select
                label="Busca por quantidade de câmeras"
                className="max-w-xs"
                selectionMode="multiple"
                onSelectionChange={(keys) => handleSelectionChange(keys)}
              >
                {cameraQuantity.map((key) => (
                  <SelectItem key={key.id}>{key.label}</SelectItem>
                ))}
              </Select>
            </>
          )}
          <Button
            onClick={() => setSearch((prevSearch) => !prevSearch)}
            color="default"
          >
            {search ? "Voltar" : "Buscar"}
          </Button>
        </div>
      </header>

      <main className="absolute top-0 w-screen">
        {search ? (
          <ChroroplethMap
            selectedAttributes={selectedAttributes}
            selectedCameraQuantity={selectedCameraQuantity}
          />
        ) : (
          <MapComponent setAttributes={setAttributes} />
        )}
      </main>
    </div>
  );
}
