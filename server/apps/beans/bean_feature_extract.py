import cv2
import numpy as np
from skimage.measure import label, regionprops

PIXELS_PER_CM = 62.9
CM_PER_PIXEL = 1.0 / PIXELS_PER_CM

class BeanFeatureExtractor:
    def __init__(self, cm_per_px=CM_PER_PIXEL):
        self.cm_per_px = cm_per_px

    def preprocess_image(self, img):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        if np.mean(gray[mask == 255]) > np.mean(gray[mask == 0]):
            mask = cv2.bitwise_not(mask)
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
            "area_cm2": bean.area * (self.cm_per_px**2),
            "perimeter_cm": bean.perimeter * self.cm_per_px,
            "major_axis_length_cm": bean.major_axis_length * self.cm_per_px,
            "minor_axis_length_cm": bean.minor_axis_length * self.cm_per_px,
            "eccentricity": bean.eccentricity,
            "extent": bean.extent,
            "equivalent_diameter_cm": bean.equivalent_diameter * self.cm_per_px,
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
        cv2.putText(debug_img, f"{w*self.cm_per_px:.2f} cm", (x, y-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,0,0), 2)
        cv2.putText(debug_img, f"{h*self.cm_per_px:.2f} cm", (x+w+5, y+h//2),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,0,0), 2)
        return debug_img
