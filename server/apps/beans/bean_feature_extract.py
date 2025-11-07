import cv2, os
import numpy as np
from skimage.measure import label, regionprops
from ultralytics import YOLO
from skimage import color, filters, morphology, measure, segmentation, util
from scipy import ndimage as ndi
from skimage.feature import peak_local_max


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
        Apply watershed algorithm using scikit-image to split touching beans.
        """
        mask_bool = mask > 0

        # Distance transform
        distance = ndi.distance_transform_edt(mask_bool)

        # Local maxima as markers
        coords = peak_local_max(distance, footprint=np.ones((3, 3)), labels=mask_bool)
        markers = np.zeros_like(distance, dtype=int)
        for i, (r, c) in enumerate(coords, start=1):
            markers[r, c] = i

        # Watershed segmentation
        labels_ws = segmentation.watershed(-distance, markers, mask=mask_bool)

        # Segmented mask
        segmented_mask = np.zeros_like(mask)
        segmented_mask[labels_ws > 0] = 255

        return segmented_mask, labels_ws

    # ---------- Preprocessing ----------
    def preprocess_image(self, img):
        # Step 0: Grayscale + scale-aware denoising
        gray = color.rgb2gray(img)

        # Define blur radius in mm (tunable)
        blur_radius_mm = 0.5

        if self.mm_per_px is not None:
            # convert to pixels, ensure at least 1
            blur_radius_px = max(1, int(round(blur_radius_mm / self.mm_per_px)))
        else:
            # fallback if not calibrated
            blur_radius_px = 5

        gray_denoised = filters.median(gray, morphology.disk(blur_radius_px))
        gray_uint8 = util.img_as_ubyte(gray_denoised)


        # Mask out ArUco markers if found
        aruco_mask = np.ones_like(gray_uint8, dtype=np.uint8) * 255
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

        # Step 1: YOLO coarse mask
        bean_mask = np.zeros_like(gray_uint8, dtype=np.uint8)
        predictions = []
        results = self.model(img, conf=0.6)
        for result in results:
            # Print confidence level of each result in results
            print(f"Result: {result.boxes.conf.tolist()}")
            if result.boxes is not None:
              for box in result.boxes:
                  x1, y1, x2, y2 = map(int, box.xyxy[0])
                  confidence = float(box.conf[0])
                  class_id = int(box.cls[0])

                  predictions.append({
                      "bbox": (x1, y1, x2, y2),
                      "confidence": confidence,
                      "class_id": class_id
                  })
                  bean_mask[y1:y2, x1:x2] = 255
        # Apply ArUco mask
        bean_mask = cv2.bitwise_and(bean_mask, aruco_mask)

        # Step 2: Refine each YOLO box individually
        refined_mask = np.zeros_like(bean_mask)
        labeled_boxes = measure.label(bean_mask)
        for region in measure.regionprops(labeled_boxes):
            minr, minc, maxr, maxc = region.bbox
            roi_gray = gray_uint8[minr:maxr, minc:maxc]

            # Pixel-level thresholding inside bounding box
            from skimage.filters import threshold_otsu
            try:
                thresh_val = threshold_otsu(roi_gray)
            except:
                thresh_val = np.mean(roi_gray)
            roi_mask = (roi_gray < thresh_val).astype(np.uint8) * 255

            # Morphology cleanup
            roi_mask = morphology.opening(roi_mask, morphology.square(3))
            roi_mask = morphology.closing(roi_mask, morphology.square(5))

            refined_mask[minr:maxr, minc:maxc] = roi_mask

        # Step 3: Watershed segmentation
        segmented_mask, markers = self.apply_watershed(img, refined_mask)

        # Step 4: Compute bean bboxes from refined mask
        bean_bboxes = []
        labeled = measure.label(segmented_mask)
        props = measure.regionprops(labeled)
        for prop in props:
            if prop.area > 100:
                minr, minc, maxr, maxc = prop.bbox
                bean_bboxes.append((minc, minr, maxc - minc, maxr - minr))

        # Step 5: Visualization mask
        black_bg = np.zeros_like(img)
        black_bg[segmented_mask == 255] = img[segmented_mask == 255]

        return black_bg, segmented_mask, gray_denoised, bean_bboxes, predictions

    # ---------- Visualization ----------
    def draw_bbox(self, img, bboxes):
        debug_img = img.copy()
        for i, bbox in enumerate(bboxes):
            x, y, w, h = bbox
            cv2.rectangle(debug_img, (x, y), (x+w, y+h), (0, 255, 0), 2)
            if self.mm_per_px is not None:
                cv2.putText(debug_img, f"{w*self.mm_per_px:.1f}x{h*self.mm_per_px:.1f}mm",
                           (x, y-10), cv2.FONT_HERSHEY_COMPLEX, 2, (0, 0, 0), 3)
            cv2.putText(debug_img, f"Bean {i+1}", (x, y-60),
                       cv2.FONT_HERSHEY_COMPLEX, 2, (0, 0, 0), 3)
        return debug_img

    # ---------- Feature extraction ----------
    def extract_features_for_all_beans(self, mask, gray, bean_bboxes):
        all_beans = []
        labeled = label(mask)
        props = regionprops(labeled, intensity_image=gray)

        for i, bean in enumerate(props):
            if bean.area > 100:
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