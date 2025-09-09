import cv2
import numpy as np
from skimage.measure import label, regionprops
from ultralytics import YOLO

class BeanFeatureExtractor:
    def __init__(self, marker_length=20):
        """
        marker_length: physical side length of the ArUco marker in mm.
        """
        self.mm_per_px = None
        self.marker_length = marker_length
        self.model = YOLO()

    def extract_mm_per_px(self, img):
        try:
            # Load predefined dictionary of ArUco markers
            aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
            parameters = cv2.aruco.DetectorParameters()

            # Detect markers
            detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)
            corners, ids, _ = detector.detectMarkers(img)

            img_debug = img.copy()

            if ids is not None and len(corners) > 0:
                # Assume the first detected marker is our calibration marker
                c = corners[0][0]  # 4 corners of marker
                cv2.polylines(img_debug, [np.int32(c)], True, (0, 255, 0), 2)

                # Compute pixel side length (average of all 4 sides)
                side_lengths = [
                    np.linalg.norm(c[0] - c[1]),
                    np.linalg.norm(c[1] - c[2]),
                    np.linalg.norm(c[2] - c[3]),
                    np.linalg.norm(c[3] - c[0]),
                ]
                avg_side_px = np.mean(side_lengths)

                # Convert to mm/px
                self.mm_per_px = self.marker_length / avg_side_px

                # Draw label
                cv2.putText(img_debug, f"{self.mm_per_px:.4f} mm/px",
                            (int(c[0][0]), int(c[0][1]) - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)
                
                # Also return here the whole length and widht size of the iamge in mm converted using mm_per_px
                h, w = img.shape[:2]
                if self.mm_per_px is not None:
                    h_mm = h * self.mm_per_px
                    w_mm = w * self.mm_per_px
                else:
                    h_mm = w_mm = None
                return (img_debug, h_mm, w_mm)
            else:
                return False
        except Exception:
            return False




    def preprocess_image(self, img):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Create a mask to exclude ArUco markers
        aruco_mask = np.ones_like(gray, dtype=np.uint8) * 255
        try:
            aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
            parameters = cv2.aruco.DetectorParameters()
            detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)
            corners, ids, _ = detector.detectMarkers(img)
            
            if ids is not None and len(corners) > 0:
                for corner in corners:
                    # Create mask to exclude ArUco marker area
                    cv2.fillPoly(aruco_mask, [np.int32(corner[0])], 0)
        except Exception:
            pass
        
        _, mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        if np.mean(gray[mask == 255]) > np.mean(gray[mask == 0]):
            mask = cv2.bitwise_not(mask)
        
        # Apply ArUco exclusion mask
        mask = cv2.bitwise_and(mask, aruco_mask)
        
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5,5), np.uint8))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((7,7), np.uint8))
        labeled = label(mask)
        props = regionprops(labeled)
        if len(props) > 0:
            largest = max(props, key=lambda x: x.area)
            new_mask = np.zeros_like(mask)
            new_mask[labeled == largest.label] = 255
            mask = new_mask
        black_bg = np.zeros_like(img)
        black_bg[mask == 255] = img[mask == 255]
        return black_bg, mask, gray

    def extract_features(self, mask, gray):
        labeled = label(mask)
        props = regionprops(labeled, intensity_image=gray)
        if len(props) == 0:
            return None, None
        bean = max(props, key=lambda x: x.area)
        features = {
            "area_mm2": bean.area * (self.mm_per_px**2),
            "perimeter_mm": bean.perimeter * self.mm_per_px,
            "major_axis_length_mm": bean.major_axis_length * self.mm_per_px,
            "minor_axis_length_mm": bean.minor_axis_length * self.mm_per_px,
            "eccentricity": bean.eccentricity,
            "extent": bean.extent,
            "equivalent_diameter_mm": bean.equivalent_diameter * self.mm_per_px,
            "solidity": bean.solidity,
            "mean_intensity": bean.mean_intensity
        }
        minr, minc, maxr, maxc = bean.bbox
        bbox = (minc, minr, maxc-minc, maxr-minr)
        return features, bbox

    def draw_bbox(self, img, bbox):
        x, y, w, h = bbox
        debug_img = img.copy()
        cv2.rectangle(debug_img, (x, y), (x+w, y+h), (0,0,255), 2)
        cv2.putText(debug_img, f"{w*self.mm_per_px:.2f} mm", (x, y-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,0,0), 2)
        cv2.putText(debug_img, f"{h*self.mm_per_px:.2f} mm", (x+w+5, y+h//2),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,0,0), 2)
        return debug_img
