(function(d3){

  // since v3.4.9 https://github.com/mbostock/d3/pull/1922
  var d3_Color = d3.color || d3.rgb(0,0,0).constructor/*.prototype.constructor*/;

  d3.color = d3.color || {};

  if (typeof module === 'object' && module.exports){
    module.exports = d3.color;
  }

  d3.color.xyz = xyz;
  d3.color.luv = luv;
  d3.color.interpolateXYZ = interpolateXYZ;
  d3.color.interpolateLuv = interpolateLuv;


  function xyz(x, y, z){
    if (arguments.length !== 1) return new XYZ(+x, +y, +z);
    else if (x instanceof XYZ) return new XYZ(x.X, x.Y, x.Z);
    else return rgb_XYZ((x = d3.rgb(x)).r, x.g, x.b);
  }

  function luv(l, u, v){
    if (arguments.length !== 1) return new Luv(+l, +u, +v);
    else if (l instanceof Luv) return new Luv(l.l, l.u, l.v);
    else return rgb_XYZ((l = d3.rgb(l)).r, l.g, l.b).luv();
  }

  // Corresponds roughly to RGB brighter/darker
  var d3_lab_K = 18;

  // tristimulus values
  function XYZ(X, Y, Z){ this.X = X; this.Y = Y; this.Z = Z; }
  (XYZ.prototype = new d3_Color).constructor = XYZ;

  // D65 standard referent   // d3_lab_X d3_lab_Y d3_lab_Z
  var D65 = new XYZ(0.950470, 1, 1.088830);

  // CIE 1976 uniform chromaticity scale
  XYZ.prototype.ucs_u = function(){
    return (this.X == 0) ? 0 : 4 * this.X / (this.X + 15 * this.Y + 3 * this.Z);
  };
  XYZ.prototype.ucs_v = function(){
    return (this.Y == 0) ? 0 : 9 * this.Y / (this.X + 15 * this.Y + 3 * this.Z);
  };

  XYZ.prototype.luv = function(){
    var l = 116 * d3_xyz_lab(this.Y) - 16;
    return new Luv(l,
                   13 * l * (this.ucs_u() - D65.ucs_u()),
                   13 * l * (this.ucs_v() - D65.ucs_v()));
  };

  XYZ.prototype.rgb = function(){
    return d3.rgb(
      d3_xyz_rgb( 3.2404542 * this.X - 1.5371385 * this.Y - 0.4985314 * this.Z),
      d3_xyz_rgb(-0.9692660 * this.X + 1.8760108 * this.Y + 0.0415560 * this.Z),
      d3_xyz_rgb( 0.0556434 * this.X - 0.2040259 * this.Y + 1.0572252 * this.Z)
    );
  };


  function Luv(l, u, v){ this.l = l; this.u = u; this.v = v; }
  (Luv.prototype = new d3_Color).constructor = Luv;

  Luv.prototype.brighter = function(k){
    return new Luv(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.u, this.v);
  };

  Luv.prototype.darker = function(k){
    return new Luv(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.u, this.v);
  };

  Luv.prototype.rgb = function(){
    return this.XYZ().rgb();
  };

  Luv.prototype.XYZ = function(){
    var Y = d3_lab_xyz((this.l + 16) / 116) * D65.Y,
        ucs_u = this.u / (13 * this.l) + D65.ucs_u(),
        ucs_v = this.v / (13 * this.l) + D65.ucs_v(),
        s = 9 * Y / ucs_v,
        X = ucs_u / 4 * s,
        Z = (s - X - 15 * Y) / 3;
    return new XYZ(X, Y, Z);
  };


  function rgb_XYZ(r, g, b){
    r = d3_rgb_xyz(r);
    g = d3_rgb_xyz(g);
    b = d3_rgb_xyz(b);
    return new XYZ(0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
                   0.2126729 * r + 0.7151522 * g + 0.0721750 * b,
                   0.0193339 * r + 0.1191920 * g + 0.9503041 * b);
  }


  function interpolateLuv(a, b) {
    a = luv(a);
    b = luv(b);
    var ul = a.l,
        uu = a.u,
        uv = a.v,
        dl = b.l - ul,
        du = b.u - uu,
        dv = b.v - uv;
    return function(t) {
      a.l = ul + dl * t;
      a.u = uu + du * t;
      a.v = uv + dv * t;
      return a;
    };
  }

  function interpolateXYZ(a, b){
    a = xyz(a);
    b = xyz(b);
    var aX = a.X,
        aY = a.Y,
        aZ = a.Z,
        dX = b.X - aX,
        dY = b.Y - aY,
        dZ = b.Z - aZ;
    return function(t) {
      a.X = aX + dX * t;
      a.Y = aY + dY * t;
      a.Z = aZ + dZ * t;
      return a;
    };
  }


  function d3_xyz_lab(x) {        // L* companding
    return x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
  }

  function d3_lab_xyz(x) {        // inverse L* companding
    return x > 0.206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
  }

  function d3_xyz_rgb(r) {      // sRGB companding
    return Math.round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055));
  }

  function d3_rgb_xyz(r) {      // inverse sRGB companding
    return (r /= 255) <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  }


})((typeof module === 'object' && module.exports) ? require('d3') : d3);
