import React, { useState, useEffect } from "react";
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

const GeographicMapSection: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [farmViewData, setFarmViewData] = useState<any>(null);
  const [showFarmViewModal, setShowFarmViewModal] = useState(false);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4 mb-4">
        <div className="flex items-center justify-center h-80">
          <div className="text-gray-500">Loading farm data...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-main font-bold text-[var(--espresso-black)] text-lg">
            &#128506; Geographic Data View
          </span>
          <span className="text-xs font-accent text-[var(--espresso-black)] ml-auto">
            Farm locations and bean production statistics - Click markers for detailed view
          </span>
        </div>

        <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden border border-[var(--mocha-beige)]">
          {farms.length > 0 ? (
            <MapContainer
              center={farms[0].lat && farms[0].lng ? [farms[0].lat, farms[0].lng] : [13.956626112464809, 121.16317033767702]} 
              zoom={12}
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
                <Marker key={farm.id} position={[farm.lat!, farm.lng!]}>
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
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">No farm data with valid locations found</div>
            </div>
          )}
        </div>

        <div className="flex justify-between text-xs text-stone-400 mt-2">
          <span>Showing data from {farms.length} farms across the region</span>
          <span>Click markers for detailed analytics</span>
          <span>Real-time data</span>
        </div>
      </div>

      {/* Farm View Modal */}
      <FarmViewModal
        isOpen={showFarmViewModal}
        farmData={farmViewData}
        onClose={closeFarmViewModal}
      />
    </>
  );
};

export default GeographicMapSection;
