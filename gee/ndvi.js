// ROI
var roi = ee.Geometry.Rectangle([
  127.14, 36.81,
  127.16, 36.83
]);

Map.setCenter(127.15, 36.82, 13);

// Sentinel-2
var s2 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
  .filterBounds(roi)
  .filterDate('2022-01-01','2023-12-31');

// NDVI
var ndvi = s2.map(function(img){
  return img.normalizedDifference(['B8','B4'])
            .rename('NDVI')
            .copyProperties(img,['system:time_start']);
});

// 그래프
print(
  ui.Chart.image.series(
    ndvi,
    roi,
    ee.Reducer.mean(),
    10
  )
);

// 지도
Map.addLayer(ndvi.mean(), {min:0,max:1,palette:['white','green']});
