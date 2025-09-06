import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AdminService } from "../../../services/adminService";
import type { Farm, FarmDetails } from "../../../services/adminService";
import FarmListHeader from "../components/FarmListHeader";
import AddFarmModal from "../components/AddFarmModal";
import FarmDetailsModal from "../components/FarmDetailsModal";
import ConfirmationModal from "../components/ConfirmationModal";

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

// Custom map click handler
const MapClickHandler: React.FC<{
  isSelectingLocation: boolean;
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ isSelectingLocation, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      if (isSelectingLocation) {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);
      }
    },
  });
  return null;
};

const AdminMapSection: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [showFarmDetailsModal, setShowFarmDetailsModal] = useState(false);
  const [farmDetails, setFarmDetails] = useState<FarmDetails | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationAction, setConfirmationAction] = useState<() => void>(() => {});
  const [loading, setLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Load farms on component mount
  useEffect(() => {
    loadFarms();
  }, []);

  // Update cursor style when selecting location
  useEffect(() => {
    if (mapInstance) {
      const container = mapInstance.getContainer();
      if (isSelectingLocation) {
        container.style.cursor = 'crosshair';
      } else {
        container.style.cursor = '';
      }
    }
  }, [isSelectingLocation, mapInstance]);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const farmsData = await AdminService.getFarms();
      setFarms(farmsData);
    } catch (error) {
      console.error('Error loading farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmClick = (farm: Farm) => {
    setSelectedFarm(farm);
    if (farm.hasLocation && farm.lat && farm.lng) {
      // Center map on the farm's location
      if (mapInstance) {
        mapInstance.setView([farm.lat, farm.lng], 18);
      }
    } else {
      // Start location selection for farms without location
      setIsSelectingLocation(true);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    if (selectedFarm) {
      if (selectedFarm.hasLocation) {
        setConfirmationMessage(`Do you want to change the location for "${selectedFarm.name}" on the map?`);
      } else {
        setConfirmationMessage(`Are you sure you want to put "${selectedFarm.name}" at this location?`);
      }
      setConfirmationAction(() => () => confirmLocationUpdate(lat, lng));
      setShowConfirmationModal(true);
    }
  };

  const confirmLocationUpdate = async (lat: number, lng: number) => {
    if (!selectedFarm) return;
    
    try {
      await AdminService.updateFarmLocation(selectedFarm.id, lat, lng);
      await loadFarms(); // Reload farms to get updated data
      resetSelection();
    } catch (error) {
      console.error('Error updating farm location:', error);
    }
  };

  const resetSelection = () => {
    setSelectedFarm(null);
    setIsSelectingLocation(false);
    setShowConfirmationModal(false);
  };

  const handleAddFarm = () => {
    setShowAddFarmModal(true);
  };

  const handleFarmAdded = async (farmData: { name: string; lat: number; lng: number; owner: string }) => {
    try {
      await AdminService.createFarm(farmData);
      await loadFarms();
      setShowAddFarmModal(false);
    } catch (error) {
      console.error('Error adding farm:', error);
    }
  };

  const handleViewFarmDetails = async (farm: Farm) => {
    try {
      const details = await AdminService.getFarmDetails(farm.id);
      if (details) {
        setFarmDetails(details);
        setShowFarmDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching farm details:', error);
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    try {
      await AdminService.deleteFarm(farmId);
      await loadFarms();
      setShowFarmDetailsModal(false);
    } catch (error) {
      console.error('Error deleting farm:', error);
    }
  };

  const getButtonText = () => {
    if (!selectedFarm) return "Choose a Farm";
    if (selectedFarm.hasLocation) return "Change Location";
    if (isSelectingLocation) return "Select";
    return "Set Location";
  };

  const handleCancel = () => {
    resetSelection();
  };

  const handleActionButtonClick = () => {
    if (!selectedFarm) return;
    
    if (selectedFarm.hasLocation) {
      // Farm already has location, allow changing it
      setIsSelectingLocation(true);
    } else {
      // Farm doesn't have location, start location selection
      setIsSelectingLocation(true);
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4 mb-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-[var(--espresso-black)]">Loading farms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Farm List Header */}
      <FarmListHeader
        farms={farms}
        selectedFarm={selectedFarm}
        onFarmClick={handleFarmClick}
        buttonText={getButtonText()}
        onAddFarm={handleAddFarm}
        onCancel={handleCancel}
        onActionButtonClick={handleActionButtonClick}
      />

      {/* Map Section */}
      <div className="bg-[var(--parchment)] rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-main font-bold text-[var(--espresso-black)] text-lg">
            &#128506; Farm Locations Management
          </span>
          <span className="text-xs font-accent text-[var(--espresso-black)] ml-auto">
            {isSelectingLocation ? "Click on the map to select location" : "Click on markers for farm details"}
          </span>
        </div>

        <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden border border-[var(--mocha-beige)] z-0">
          <MapContainer
            center={[13.956626112464809, 121.16317033767702]}
            zoom={15}
            style={{ height: "100%", width: "100%", position: "relative", zIndex: 0 }}
            ref={setMapInstance}
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Map with Labels">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Satellite View">
                <TileLayer
                  attribution='Tiles &copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>

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

            {/* Render farm markers */}
            {farms
              .filter(farm => farm.hasLocation && farm.lat && farm.lng)
              .map((farm) => (
                <Marker key={farm.id} position={[farm.lat!, farm.lng!]}>
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="font-bold text-lg mb-2">{farm.name}</div>
                      <div className="space-y-1 text-sm">
                        <div>Users: {farm.userCount}</div>
                        <div>Images: {farm.imageCount}</div>
                        <div>Avg Bean Size: {farm.avgBeanSize} mm</div>
                        <div>Quality: {farm.qualityRating}/5</div>
                        <div>Owner: {farm.owner}</div>
                        <div>Last Activity: {farm.lastActivity}</div>
                      </div>
                      <button
                        onClick={() => handleViewFarmDetails(farm)}
                        className="mt-3 w-full bg-[var(--espresso-black)] text-white px-3 py-1 rounded text-sm hover:bg-opacity-90"
                      >
                        View More
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

            <MapClickHandler
              isSelectingLocation={isSelectingLocation}
              onLocationSelect={handleLocationSelect}
            />
          </MapContainer>
        </div>

        <div className="flex justify-between text-xs text-stone-400 mt-2">
          <span>Showing {farms.filter(f => f.hasLocation).length} located farms of {farms.length} total</span>
          <span>{selectedFarm ? `Selected: ${selectedFarm.name}` : 'No farm selected'}</span>
        </div>
      </div>

      {/* Modals */}
      <AddFarmModal
        isOpen={showAddFarmModal}
        onClose={() => setShowAddFarmModal(false)}
        onSubmit={handleFarmAdded}
      />

      <FarmDetailsModal
        isOpen={showFarmDetailsModal}
        farmDetails={farmDetails}
        onClose={() => setShowFarmDetailsModal(false)}
        onDelete={handleDeleteFarm}
      />

      <ConfirmationModal
        isOpen={showConfirmationModal}
        message={confirmationMessage}
        onConfirm={() => {
          confirmationAction();
          setShowConfirmationModal(false);
        }}
        onCancel={resetSelection}
      />
    </div>
  );
};

export default AdminMapSection;
