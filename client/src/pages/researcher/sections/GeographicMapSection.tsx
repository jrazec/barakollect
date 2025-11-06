import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import FarmViewModal from "../../../components/FarmViewModal";
import { useCachedAdminService } from "../../../hooks/useCachedServices";

// Fix Leaflet's default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Farm {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  hasLocation: boolean;
  userCount: number;
  imageCount: number;
  avgBeanSize: number;
  qualityRating: number;
}

const ClickHandler = () => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      console.log("Clicked coordinates:", lat, lng);
    },
  });
  return null;
};

const FARM_COLORS = [
  "#FF5733", "#33FF57", "#3357FF", "#FF33F6", 
  "#33FFF6", "#F6FF33", "#FF3333", "#33FFB5"
];

const getFarmColor = (index: number) => {
  return FARM_COLORS[index % FARM_COLORS.length];
};

const markerHtmlStyles = (color: string) => `
  background-color: ${color};
  width: 2rem;
  height: 2rem;
  display: block;
  position: relative;
  border-radius: 3rem 3rem 0;
  transform: rotate(45deg);
  border: 1px solid #FFFFFF;
  box-shadow: 0 0 4px rgba(0,0,0,0.5);
`;

const customIcon = (color: string) => L.divIcon({
  className: "custom-pin",
  html: `<span style="${markerHtmlStyles(color)}"></span>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -45]
});

const GeographicMapSection: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [farmViewData, setFarmViewData] = useState<any>(null);
  const [showFarmViewModal, setShowFarmViewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  // Initialize cached services
  const cachedAdminService = useCachedAdminService();

  // Load farms on component mount
  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const farmsData = await cachedAdminService.getFarms();
      // Only show farms with valid locations
      const validFarms = farmsData.filter(farm => farm.hasLocation && farm.lat && farm.lng);
      setFarms(validFarms);
    } catch (error) {
      console.error("Error loading farms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmClick = async (farmId: string) => {
    try {
      setSelectedFarmId(farmId);
      const farmData = await cachedAdminService.getFarmView(farmId);
      if (farmData) {
        setFarmViewData(farmData);
        setShowFarmViewModal(true);
      }
    } catch (error) {
      console.error("Error loading farm view data:", error);
    }
  };

  const closeFarmViewModal = () => {
    setShowFarmViewModal(false);
    setSelectedFarmId(null);
    setFarmViewData(null);
  };

  const centerMapOnFarm = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const farmId = e.target.value;
    const farm = farms.find(f => f.id === farmId);
    if (farm?.lat && farm?.lng && mapRef.current) {
      mapRef.current.setView([farm.lat, farm.lng], 16);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center">Loading farm data...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Farm Selector */}
      <div className="mb-4 flex items-center gap-4">
        <select
          className="w-64 h-10 px-3 rounded-md border border-input bg-white text-sm"
          onChange={centerMapOnFarm}
          defaultValue=""
        >
          <option value="" disabled>Select a farm to focus</option>
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
        
        {/* Legend */}
        {/* <div className="flex items-center gap-4 ml-auto">
          {farms.map((farm, index) => (
            <div key={farm.id} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getFarmColor(index) }}
              />
              <span className="text-sm text-gray-600">{farm.name}</span>
            </div>
          ))}
        </div> */}
      </div>

      {/* Map Container - Update z-index */}
      <div className="flex-1 relative rounded-lg overflow-hidden" style={{ zIndex: 0 }}>
        <MapContainer
          center={farms[0]?.lat && farms[0]?.lng ? 
            [farms[0].lat, farms[0].lng] : 
            [13.956626112464809, 121.16317033767702]}
          zoom={12}
          style={{ height: "100%", width: "100%", position: "relative", zIndex: 0 }}
          ref={mapRef}
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

          {farms.map((farm, index) => (
            <Marker 
              key={farm.id} 
              position={[farm.lat!, farm.lng!]}
              icon={customIcon(getFarmColor(index))}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-bold text-[var(--espresso-black)] mb-2">{farm.name}</div>
                  <div className="space-y-1 text-sm">
                    <div>Users: {farm.userCount || 0}</div>
                    <div>Images: {farm.imageCount || 0}</div>
                    {/* farm.avgBeanSize = 1.1123323mm x 12.asdasdmm */}
                    <div>Avg Size: {(farm.avgBeanSize || 0)}</div>
                  </div>
                  <button
                    onClick={() => handleFarmClick(farm.id)}
                    className="w-full mt-3 px-3 py-1 bg-[var(--espresso-black)] text-white rounded text-sm hover:bg-opacity-90"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          <ClickHandler />
        </MapContainer>
      </div>

      {/* Map Stats */}
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Showing {farms.length} farms across the region</span>
        <span>Last updated: {new Date().toLocaleDateString()}</span>
      </div>

      {/* Farm View Modal */}
      <FarmViewModal
        isOpen={showFarmViewModal}
        farmData={farmViewData}
        onClose={closeFarmViewModal}
      />
    </div>
  );
};

export default GeographicMapSection;
