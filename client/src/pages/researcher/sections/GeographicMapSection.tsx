import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet’s default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const farms = [
  { id: "A", name: "Farm A", lat: 13.956626112464809, lng: 121.16317033767702, beans: 34, avgSize: 13.2, quality: 3.7 },
  { id: "B", name: "Farm B", lat: 13.950, lng: 121.150, beans: 21, avgSize: 12.8, quality: 3.5 },
  { id: "C", name: "Farm C", lat: 13.940, lng: 121.160, beans: 18, avgSize: 14.1, quality: 3.9 },
];

const ClickHandler = () => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      console.log("Clicked coordinates:", lat, lng);
    },
  });
  return null;
};

const GeographicMapSection: React.FC = () => {
  return (
    <div className="bg-[var(--parchment)] rounded-lg shadow p-4 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-main font-bold text-[var(--espresso-black)] text-lg">
          &#128506; Geographic Data View
        </span>
        <span className="text-xs font-accent text-[var(--espresso-black)] ml-auto">
          Farm locations and bean production statistics
        </span>
      </div>

      <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden border border-[var(--mocha-beige)]">
        <MapContainer
          center={[13.956626112464809, 121.16317033767702]} 
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <LayersControl position="topright">
            {/* Normal Map with Labels */}
            <LayersControl.BaseLayer checked name="Map with Labels">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            {/* Satellite View */}
            <LayersControl.BaseLayer name="Satellite View">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            {/* Satellite + Labels */}
            <LayersControl.BaseLayer name="Satellite + Labels">
              <TileLayer
                attribution="Esri World Imagery + Labels"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                attribution="Esri Labels"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {farms.map((farm) => (
            <Marker key={farm.id} position={[farm.lat, farm.lng]}>
              <Popup>
                <div className="font-bold">{farm.name}</div>
                <div>Bean Count: {farm.beans}</div>
                <div>Avg Size: {farm.avgSize} mm</div>
                <div>Quality: {farm.quality}</div>
              </Popup>
            </Marker>
          ))}
          <ClickHandler />
        </MapContainer>
      </div>

      <div className="flex justify-between text-xs text-stone-400 mt-2">
        <span>Showing data from {farms.length} farms across the region</span>
        <span>Active Farms</span>
        <span>Selected Farms</span>
      </div>
    </div>
  );
};

export default GeographicMapSection;
