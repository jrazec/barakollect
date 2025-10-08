import cv2, os
import numpy as np
from skimage.measure import label, regionprops
from ultralytics import YOLO

current_dir = os.path.dirname(os.path.abspath(__file__))
MODEL = os.path.join(current_dir, "my_model", "cv_yolov11.pt")
class BeanFeatureExtractor:
    def __init__(self, marker_length=20):
        """
        marker_length: physical side length of the ArUco marker in mm.
        """
        self.mm_per_px = None
        self.marker_length = marker_length
        self.model = YOLO(MODEL)


    # ---------- Calibration ----------
    def extract_mm_per_px(self, img):
        try:
            aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
            parameters = cv2.aruco.DetectorParameters()
            detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)
            corners, ids, _ = detector.detectMarkers(img)
            img_debug = img.copy()

            if ids is not None and len(corners) > 0:
                c = corners[0][0]
                cv2.polylines(img_debug, [np.int32(c)], True, (0, 255, 0), 2)

                side_lengths = [
                    np.linalg.norm(c[0] - c[1]),
                    np.linalg.norm(c[1] - c[2]),
                    np.linalg.norm(c[2] - c[3]),
                    np.linalg.norm(c[3] - c[0]),
                ]
                avg_side_px = np.mean(side_lengths)
                self.mm_per_px = self.marker_length / avg_side_px

                h, w = img.shape[:2]
                h_mm = h * self.mm_per_px
                w_mm = w * self.mm_per_px
                return (img_debug, h_mm, w_mm)
            else:
                return False
        except Exception:
            return False

    # ---------- Watershed helper ----------
    def apply_watershed(self, img, mask):
        """
        Apply watershed algorithm to split touching beans.
        img  - original BGR image
        mask - binary mask of beans (255 = bean, 0 = background)
        """
        ret, thresh = cv2.threshold(mask, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

        kernel = np.ones((3,3), np.uint8)
        opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
        sure_bg = cv2.dilate(opening, kernel, iterations=3)

        dist_transform = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
        ret, sure_fg = cv2.threshold(dist_transform, 0.5 * dist_transform.max(), 255, 0)
        sure_fg = np.uint8(sure_fg)

        unknown = cv2.subtract(sure_bg, sure_fg)

        ret, markers = cv2.connectedComponents(sure_fg)
        markers = markers + 1
        markers[unknown == 255] = 0

        markers = cv2.watershed(img, markers)

        segmented_mask = np.zeros_like(mask)
        segmented_mask[markers > 1] = 255

        return segmented_mask, markers

    # ---------- Preprocessing ----------
    def preprocess_image(self, img):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        aruco_mask = np.ones_like(gray, dtype=np.uint8) * 255

        # Mask out ArUco markers if found
        try:
            aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
            parameters = cv2.aruco.DetectorParameters()
            detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)
            corners, ids, _ = detector.detectMarkers(img)
            if ids is not None and len(corners) > 0:
                for corner in corners:
                    cv2.fillPoly(aruco_mask, [np.int32(corner[0])], 0)
        except Exception:
            pass

        # Step 1: YOLO detections → coarse bean mask
        results = self.model(img)
        bean_mask = np.zeros_like(gray, dtype=np.uint8)
                    
        for result in results:
            # Print confidence level of each result in results
            print(f"Result: {result.boxes.conf.tolist()}")
            if result.boxes is not None:
                for box in result.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(bean_mask, (x1, y1), (x2, y2), 255, -1)
        # Step 2: Clean up mask
        bean_mask = cv2.bitwise_and(bean_mask, aruco_mask)
        bean_mask = cv2.morphologyEx(bean_mask, cv2.MORPH_OPEN, np.ones((5,5), np.uint8))
        bean_mask = cv2.morphologyEx(bean_mask, cv2.MORPH_CLOSE, np.ones((7,7), np.uint8))

        # Step 3: Watershed segmentation
        segmented_mask, markers = self.apply_watershed(img, bean_mask)

        # Step 4: Recompute bean bboxes from watershed regions
        bean_bboxes = []
        labeled = label(segmented_mask)
        props = regionprops(labeled)
        for prop in props:
            if prop.area > 100:  # skip tiny noise
                minr, minc, maxr, maxc = prop.bbox
                bean_bboxes.append((minc, minr, maxc - minc, maxr - minr))

        # Visualization mask
        black_bg = np.zeros_like(img)
        black_bg[segmented_mask == 255] = img[segmented_mask == 255]

        return black_bg, segmented_mask, gray, bean_bboxes

    # ---------- Visualization ----------
    def draw_bbox(self, img, bboxes):
        debug_img = img.copy()
        for i, bbox in enumerate(bboxes):
            x, y, w, h = bbox
            cv2.rectangle(debug_img, (x, y), (x+w, y+h), (0, 255, 0), 2)
            if self.mm_per_px is not None:
                cv2.putText(debug_img, f"{w*self.mm_per_px:.1f}x{h*self.mm_per_px:.1f}mm",
                           (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
            cv2.putText(debug_img, f"Bean {i+1}", (x, y-25),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        return debug_img


    # ---------- Feature extraction ----------
    def extract_features_for_all_beans(self, mask, gray, bean_bboxes):
        all_beans = []
        
        # If no YOLO detections, fall back to connected components
        if not bean_bboxes:
            labeled = label(mask)
            props = regionprops(labeled, intensity_image=gray)
            
            for i, bean in enumerate(props):
                if bean.area > 100:  # Filter small noise
                    features = self._calculate_bean_features(bean)
                    minr, minc, maxr, maxc = bean.bbox
                    bbox = (minc, minr, maxc-minc, maxr-minr)
                    
                    all_beans.append({
                        "bean_id": i + 1,
                        "length_mm": features["major_axis_length_mm"],
                        "width_mm": features["minor_axis_length_mm"],
                        "bbox": bbox,
                        "features": features
                    })
        else:
            # Process each YOLO detected bean
            for i, (x, y, w, h) in enumerate(bean_bboxes):
                # Extract region for this bean
                bean_region_mask = np.zeros_like(mask)
                bean_region_mask[y:y+h, x:x+w] = mask[y:y+h, x:x+w]
                
                # Get properties for this specific bean region
                labeled = label(bean_region_mask)
                props = regionprops(labeled, intensity_image=gray)
                
                if props:
                    # Take the largest component in this region
                    bean = max(props, key=lambda x: x.area)
                    features = self._calculate_bean_features(bean)
                    
                    all_beans.append({
                        "bean_id": i + 1,
                        "length_mm": features["major_axis_length_mm"],
                        "width_mm": features["minor_axis_length_mm"],
                        "bbox": (x, y, w, h),
                        "features": features
                    })
        
        return all_beans

    def _calculate_bean_features(self, bean_props):
        return {
            "area_mm2": bean_props.area * (self.mm_per_px**2),
            "perimeter_mm": bean_props.perimeter * self.mm_per_px,
            "major_axis_length_mm": bean_props.major_axis_length * self.mm_per_px,
            "minor_axis_length_mm": bean_props.minor_axis_length * self.mm_per_px,
            "eccentricity": bean_props.eccentricity,
            "extent": bean_props.extent,
            "equivalent_diameter_mm": bean_props.equivalent_diameter * self.mm_per_px,
            "solidity": bean_props.solidity,
            "mean_intensity": bean_props.mean_intensity,
            "aspect_ratio": bean_props.major_axis_length / bean_props.minor_axis_length if bean_props.minor_axis_length > 0 else 0
        }

    def extract_features(self, mask, gray):
        labeled = label(mask)
        props = regionprops(labeled, intensity_image=gray)
        if len(props) == 0:
            return None, None
        bean = max(props, key=lambda x: x.area)
        features = self._calculate_bean_features(bean)
        minr, minc, maxr, maxc = bean.bbox
        bbox = (minc, minr, maxc-minc, maxr-minr)
        return features, bbox

    def save_temporary_image(self, img, folder, prefix="temp"):
        import uuid
        filename = f"{prefix}_{uuid.uuid4()}.png"
        filepath = os.path.join(folder, filename)
        cv2.imwrite(filepath, img)
        return filename
