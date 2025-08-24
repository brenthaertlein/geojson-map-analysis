import React, {useState, useEffect, useRef} from "react";
import { MapContainer, TileLayer, GeoJSON, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function App() {
  const [geoData, setGeoData] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    fetch("http://localhost:8000/neighborhoods?include_geometry=true")
      .then((res) => res.json())
      .then((data) => {
          return {
            "type": "FeatureCollection",
              "features": data.map(it => {
                const { geometry, ...properties } = it
                return {
                    "type": "Feature",
                    properties,
                    geometry
                }
              })
          }
        })
      .then((data) => setGeoData(data));
  }, []);

  useEffect(() => {
    if (geoData && mapRef.current) {
      const map = mapRef.current;
      const geoJsonLayer = L.geoJSON(geoData);
      map.fitBounds(geoJsonLayer.getBounds());
    }
  }, [geoData]);

  const onEachFeature = (feature, layer) => {
    // Build a dynamic popup content string
    let popupContent = `<strong>${feature.properties.name}</strong><br/>`;
    for (const [key, value] of Object.entries(feature.properties)) {
      popupContent += `${key}: ${JSON.stringify(value)}<br/>`;
    }
    layer.bindPopup(popupContent);
  };

  // Choropleth color scale based on a "value" property
  // Color function based on livability_score
  const getColor = (score) => {
    if (score > 60) return "#006400";
    if (score > 50) return "#228B22";
    if (score > 40) return "#FFFF00";
    if (score > 30) return "#FFA500";
    if (score > 20) return "#FF7F00"
    if (score > 10) return "#FF7000"
    return "#FF0000";
  };

  const styleFeature = (feature) => ({
    fillColor: getColor(feature.properties.livability_score),
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  });

  return (
    <div style={{ height: "100vh", width: "100%" }}>
        <MapContainer
            center={[37.8, -96]}
            zoom={4}
            style={{height: "100%", width: "100%"}}
            whenCreated={(mapInstance) => {
                mapRef.current = mapInstance;
            }}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {geoData && (
                <GeoJSON
                    data={geoData}
                    style={styleFeature}
                    onEachFeature={onEachFeature}
                >
                    <Tooltip sticky>Click for details</Tooltip>
                </GeoJSON>
            )}
        </MapContainer>
    </div>
  );
}
