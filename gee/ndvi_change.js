// ROI
var roi = ee.Geometry.Rectangle([
  127.14, 36.81,
  127.16, 36.83
]);

Map.setCenter(127.15, 36.82, 13);

// Sentinel-2 불러오기
var s2 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
  .filterBounds(roi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20));

// 설치 전
var before = s2
  .filterDate('2020-01-01','2021-12-31')
  .median();

// 설치 후
var after = s2
  .filterDate('2023-01-01','2023-12-31')
  .median();


// NDVI 계산
var ndviBefore = before.normalizedDifference(['B8','B4']);
var ndviAfter = after.normalizedDifference(['B8','B4']);

// 변화량 계산
var diff = ndviAfter.subtract(ndviBefore);

// 시각화

// 설치 전 NDVI
Map.addLayer(
  ndviBefore,
  {min:0, max:1, palette:['white','green']},
  'NDVI Before'
);

// 설치 후 NDVI
Map.addLayer(
  ndviAfter,
  {min:0, max:1, palette:['white','green']},
  'NDVI After'
);

// 변화량
Map.addLayer(
  diff,
  {
    min:-0.5,
    max:0.5,
    palette:['red','white','blue']
  },
  'NDVI Change'
);



// 전후 NDVI 평균값 계산
var beforeMean = ndviBefore.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: roi,
  scale: 10
});

var afterMean = ndviAfter.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: roi,
  scale: 10
});

// 그래프로 출력
print(ui.Chart.array.values(
  ee.Array([
    beforeMean.get('nd'),
    afterMean.get('nd')
  ]),
  0,
  ['Before','After']
));

