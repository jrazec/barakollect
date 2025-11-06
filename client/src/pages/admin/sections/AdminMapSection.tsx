import React, { useState, useEffect, useRef } from "react";
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

// Add color constants and custom pin styles
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
  const mapRef = useRef<L.Map | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load farms on component mount
  useEffect(() => {
    loadFarms();
  }, []);

  // Update cursor style when selecting location
  useEffect(() => {
    if (mapRef.current) {
      const container = mapRef.current.getContainer();
      if (isSelectingLocation) {
        container.style.cursor = 'crosshair';
      } else {
        container.style.cursor = '';
      }
    }
  }, [isSelectingLocation]);

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
      if (mapRef.current) {
        mapRef.current.setView([farm.lat, farm.lng], 18);
      }
    } else {
      setIsSelectingLocation(true);
    }
  };

  const centerMapOnFarm = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const farmId = e.target.value;
    const farm = farms.find(f => f.id === farmId);
    if (farm?.lat && farm?.lng && mapRef.current) {
      mapRef.current.setView([farm.lat, farm.lng], 16);
      setSelectedFarm(farm);
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

  const handleFarmAdded = async (farmData: { name: string; lat: number; lng: number; }) => {
    try {
      await AdminService.createFarm(farmData);
      await loadFarms();
      setShowAddFarmModal(false);
    } catch (error) {
      console.error('Error adding farm:', error);
    }
  };

  const handleViewFarmDetails = async (farm: Farm) => {
    console.log('Viewing details for farm:', farm);
    try {
      console.log("viewing details")
      const details = await AdminService.getFarmDetails(farm.id);
      if (details) {
        setFarmDetails({
          ...details,
          id: farm.id,
          userCount: selectedFarm?.userCount || 0,
          imageCount: selectedFarm?.imageCount || 0,
          owner: selectedFarm?.owner || '',
          pendingValidations: selectedFarm?.pendingValidations || 0,
          validatedUploads: selectedFarm?.validatedUploads || 0,
          lat: selectedFarm?.lat,
          lng: selectedFarm?.lng,
          hasLocation: selectedFarm?.hasLocation || false,
        });
        setShowFarmDetailsModal(true);
      } 
    } catch (error) {
      console.log("errors")
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
    return <div className="h-full flex items-center justify-center">Loading farms...</div>;
  }

  return (
    <div className="h-full flex">
      {/* Main Map Area */}
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'mr-0' : 'mr-4'}`}>
        {/* Top Controls */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            
            
            {isSelectingLocation && (
              <div className="text-sm text-orange-600 font-medium">
                Click on the map to set location for {selectedFarm?.name}
              </div>
            )}
          </div>

       
        </div>

        {/* Map Container - Always visible */}
        <div className="flex-1 relative rounded-lg overflow-hidden" style={{ zIndex: 0 }}>
          <MapContainer
            center={[13.956626112464809, 121.16317033767702]}
            zoom={15}
            style={{ height: "100%", width: "100%", position: "relative", zIndex: 0 }}
            ref={mapRef}
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

            {/* Render farm markers with custom icons */}
            {farms
              .filter(farm => farm.hasLocation && farm.lat && farm.lng)
              .map((farm, index) => (
                <Marker 
                  key={farm.id} 
                  position={[farm.lat!, farm.lng!]}
                  icon={customIcon(getFarmColor(index))}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="font-bold text-lg mb-2">{farm.name}</div>
                      <div className="space-y-1 text-sm">
                        <div>Users: {farm.userCount}</div>
                        <div>Uploaded images: {farm.imageCount}</div>
                        <div>Validated Images: {farm.validatedUploads}</div>
                        <div>Pending: {farm.pendingValidations}</div>
                        <div>Farmer: {farm.owner}</div>
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

        {/* Map Stats - Always visible */}
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>Showing {farms.filter(f => f.hasLocation).length} located farms of {farms.length} total</span>
          <span>{selectedFarm ? `Selected: ${selectedFarm.name}` : 'No farm selected'}</span>
        </div>
      </div>

      {/* Collapsible Sidebar - Only this part is hidden/shown */}
      {!sidebarCollapsed && (
        <div className="w-96 bg-white rounded-lg shadow-lg flex-shrink-0">
          <FarmListHeader
            farms={farms}
            selectedFarm={selectedFarm}
            onFarmClick={handleFarmClick}
            buttonText={getButtonText()}
            onAddFarm={handleAddFarm}
            onCancel={handleCancel}
            onActionButtonClick={handleActionButtonClick}
          />
        </div>
      )}

      {/* Modals */}
        <AddFarmModal
          isOpen={showAddFarmModal}
          onClose={() => setShowAddFarmModal(false)}
          onSubmit={handleFarmAdded}
        />

        <FarmDetailsModal
          isOpen={showFarmDetailsModal}
          farmDetails={farmDetails}
          // Here's the farmId prop

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
