// ROI
var roi = ee.Geometry.Rectangle([
  127.14, 36.81,
  127.16, 36.83
]);

Map.setCenter(127.15, 36.82, 13);

// Sentinel-2 정의
var s2 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
  .filterBounds(roi)
  .filterDate('2022-01-01','2023-12-31');

// NDVI + EVI 함수
var addIndices = function(img){

  var ndvi = img.normalizedDifference(['B8','B4'])
                .rename('NDVI');

  var evi = img.expression(
    '2.5*((NIR-RED)/(NIR+6*RED-7.5*BLUE+1))',{
      NIR: img.select('B8'),
      RED: img.select('B4'),
      BLUE: img.select('B2')
  }).rename('EVI');

  return img.addBands([ndvi,evi]);
};

// 적용
var withIdx = s2.map(addIndices);

// EVI 그래프
print(
  ui.Chart.image.series(
    withIdx.select('EVI'),
    roi,
    ee.Reducer.mean(),
    10
  )
);

// 지도 시각화
Map.addLayer(
  withIdx.select('EVI').mean(),
  {min:0, max:1, palette:['white','green']},
  'Mean EVI'
);
