---
title: d3-color-cie-luv-xyz
...

CIE [L\*u\*v\*](http://en.wikipedia.org/wiki/CIELUV) and [XYZ](https://en.wikipedia.org/wiki/CIE_XYZ_color_space) color spaces in [d3.js](http://d3js.org).

This plugin defines constructors and interpolating functions analogous to the [native ones](https://github.com/mbostock/d3/wiki/Colors):

- `d3.color.luv(l,u,v)`
- `d3.color.xyz(x,y,z)`
- `d3.color.interpolateLuv(a,b)`
- `d3.color.interpolateXYZ(a,b)`

Both L\*a\*b\* and L\*u\*v\* are intended as *uniform color spaces* -- matching perceptual color difference with euclidean distance.

See [this example](http://bl.ocks.org/dgerber/6697473).
