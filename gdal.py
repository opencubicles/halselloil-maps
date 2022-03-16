import json

from osgeo import ogr

format = "GTiff"

driver = ogr.GetDriverByName("GTiff")
print(driver)
