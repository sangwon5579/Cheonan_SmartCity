// ROI 설정
var roi = ee.Geometry.Rectangle([
  127.14, 36.81,
  127.16, 36.83
]);

Map.setCenter(127.15, 36.82, 14);

// Sentinel-2 불러오기
var s2 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
  .filterBounds(roi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

// 기간 분리
var before = s2.filterDate('2020-01-01', '2020-12-31').median();
var after  = s2.filterDate('2023-01-01', '2023-12-31').median();

// NDVI 계산
var ndviBefore = before.normalizedDifference(['B8','B4']);
var ndviAfter  = after.normalizedDifference(['B8','B4']);

var ndviChange = ndviAfter.subtract(ndviBefore);

// 태양광 의심 조건
// 조건 1: NDVI 감소
var ndviDrop = ndviChange.lt(-0.15);

// 조건 2: NIR 반사 낮음
var lowNIR = after.select('B8').lt(1500);

// 조건 결합
var solarSuspect = ndviDrop.and(lowNIR);

// 지도 시각화

// NDVI 변화
Map.addLayer(ndviChange.clip(roi), {
  min: -0.5,
  max: 0.5,
  palette: ['red','white','green']
}, 'NDVI Change');

// 태양광 의심 지역
Map.addLayer(solarSuspect.selfMask().clip(roi), {
  palette: ['yellow']
}, 'Solar Suspected Area');
