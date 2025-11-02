import cv2, os
import numpy as np
from skimage.measure import label, regionprops
from skimage import color, filters, morphology, measure, segmentation, util
from scipy import ndimage as ndi
from skimage.feature import peak_local_max


class NMBeanFeatureExtractor:
    def __init__(self, marker_length=20):
        """
        marker_length: physical side length of the ArUco marker in mm.
        """
        self.mm_per_px = None
        self.marker_length = marker_length

    # ---------- Calibration ----------
    def extract_mm_per_px(self, img):
        """
        Detect ArUco marker and compute mm per pixel calibration.
        """
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

    # ---------- Watershed Segmentation ----------
    def apply_watershed(self, img, mask):
        """
        Apply watershed algorithm using scikit-image to separate touching beans.
        """
        mask_bool = mask > 0
        distance = ndi.distance_transform_edt(mask_bool)
        coords = peak_local_max(distance, footprint=np.ones((3, 3)), labels=mask_bool)
        markers = np.zeros_like(distance, dtype=int)
        for i, (r, c) in enumerate(coords, start=1):
            markers[r, c] = i
        labels_ws = segmentation.watershed(-distance, markers, mask=mask_bool)
        segmented_mask = np.zeros_like(mask, dtype=np.uint8)
        segmented_mask[labels_ws > 0] = 255
        return segmented_mask, labels_ws

    # ---------- Preprocessing ----------
    def preprocess_image(self, img):
        """
        Perform preprocessing, thresholding, ArUco masking, and watershed segmentation (no YOLO).
        """
        # Step 0: Grayscale + scale-aware denoising
        gray = color.rgb2gray(img)
        blur_radius_mm = 0.5

        if self.mm_per_px is not None:
            blur_radius_px = max(1, int(round(blur_radius_mm / self.mm_per_px)))
        else:
            blur_radius_px = 5

        gray_denoised = filters.median(gray, morphology.disk(blur_radius_px))
        gray_uint8 = util.img_as_ubyte(gray_denoised)

        # Mask out ArUco markers if found (adaptive masking area)
        aruco_mask = np.ones_like(gray_uint8, dtype=np.uint8) * 255
        try:
            aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
            parameters = cv2.aruco.DetectorParameters()
            detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)
            corners, ids, _ = detector.detectMarkers(img)
            if ids is not None and len(corners) > 0:
                for corner in corners:
                    cv2.fillPoly(aruco_mask, [np.int32(corner[0])], 0)

                # Dynamically compute kernel size based on image dimensions
                h, w = gray_uint8.shape[:2]
                base_size = int(round(min(h, w) * 0.004))  # 0.4% of smaller dimension
                base_size = max(3, base_size | 1)  # ensure odd and minimum of 3
                kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (base_size, base_size))

                # Slightly expand masked area by eroding white region (enlarges black)
                aruco_mask = cv2.erode(aruco_mask, kernel, iterations=1)
        except Exception:
            pass

        # Step 1: Global thresholding to create initial mask (instead of YOLO)
        from skimage.filters import threshold_otsu
        try:
            thresh_val = threshold_otsu(gray_uint8)
        except Exception:
            thresh_val = np.mean(gray_uint8)
        bean_mask = (gray_uint8 < thresh_val).astype(np.uint8) * 255

        # Apply ArUco mask
        bean_mask = cv2.bitwise_and(bean_mask, aruco_mask)

        # Step 2: Morphological cleanup
        bean_mask = morphology.opening(bean_mask, morphology.square(3))
        bean_mask = morphology.closing(bean_mask, morphology.square(5))

        # Step 3: Watershed segmentation
        segmented_mask, markers = self.apply_watershed(img, bean_mask)

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

        # Since there’s no YOLO, return empty predictions list for compatibility
        predictions = []

        return black_bg, segmented_mask, gray_denoised, bean_bboxes, predictions

    # ---------- Visualization ----------
    def draw_bbox(self, img, bboxes):
        """
        Draw bounding boxes on image.
        """
        debug_img = img.copy()
        for i, bbox in enumerate(bboxes):
            x, y, w, h = bbox
            cv2.rectangle(debug_img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            if self.mm_per_px is not None:
                cv2.putText(debug_img, f"{w * self.mm_per_px:.1f}x{h * self.mm_per_px:.1f}mm",
                            (x, y - 10), cv2.FONT_HERSHEY_COMPLEX, 2, (0, 0, 0), 3)
            cv2.putText(debug_img, f"Bean {i + 1}", (x, y - 60),
                        cv2.FONT_HERSHEY_COMPLEX, 2, (0, 0, 0), 3)
        return debug_img

    # ---------- Feature Extraction ----------
    def extract_features_for_all_beans(self, mask, gray):
        """
        Extract morphological features for all segmented beans.
        """
        all_beans = []
        labeled = label(mask)
        props = regionprops(labeled, intensity_image=gray)

        for i, bean in enumerate(props):
            if bean.area > 100:
                features = self._calculate_bean_features(bean)
                minr, minc, maxr, maxc = bean.bbox
                bbox = (minc, minr, maxc - minc, maxr - minr)
                all_beans.append({
                    "bean_id": i + 1,
                    "length_mm": features["major_axis_length_mm"],
                    "width_mm": features["minor_axis_length_mm"],
                    "bbox": bbox,
                    "features": features
                })

        all_beans = sorted(all_beans, key=lambda x: x["features"]["area_mm2"], reverse=True)
        return all_beans

    def _calculate_bean_features(self, bean_props):
        """
        Compute morphological features with mm-based scaling.
        """
        return {
            "area_mm2": bean_props.area * (self.mm_per_px ** 2),
            "perimeter_mm": bean_props.perimeter * self.mm_per_px,
            "major_axis_length_mm": bean_props.major_axis_length * self.mm_per_px,
            "minor_axis_length_mm": bean_props.minor_axis_length * self.mm_per_px,
            "eccentricity": bean_props.eccentricity,
            "extent": bean_props.extent,
            "equivalent_diameter_mm": bean_props.equivalent_diameter * self.mm_per_px,
            "solidity": bean_props.solidity,
            "mean_intensity": bean_props.mean_intensity,
            "aspect_ratio": (
                bean_props.major_axis_length / bean_props.minor_axis_length
                if bean_props.minor_axis_length > 0 else 0
            )
        }

    def save_temporary_image(self, img, folder, prefix="temp"):
        """
        Save temporary debug image in a specified folder.
        """
        import uuid
        filename = f"{prefix}_{uuid.uuid4()}.png"
        filepath = os.path.join(folder, filename)
        cv2.imwrite(filepath, img)
        return filename