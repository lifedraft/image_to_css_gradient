var generate = function(options) {
  this.options = options;
};

generate.prototype = {
  variants: {},
  generate: function() {
    var output = [];
    
    for (var variant in this.variants) {
      output.push(this.variants[variant](this.options));
    };
    
    return output.join("\n");
  }
};

generate.prototype.variants.base64 = function(options) {
  
  var data_url = options.canvas.toDataURL("image/png");

  var color = options.gradient_stops[0].color.split(",").slice(0,3).join(",");

  if (data_url) {
    return 'background: rgb(' + color + ') url(' + data_url + ") no-repeat;";
  };

  return '';
  
};

generate.prototype.variants.webkit = function(options) {

  var gradient_stops = options.gradient_stops;
  var canvas = options.canvas;
  var first = null;
  var last = null;
  var stops = [];
  for (var percent in gradient_stops) {
    if (!first) {
      first = gradient_stops[percent];
    };
    stops.push('color-stop(' + percent + '%, rgb(' + gradient_stops[percent].color + '))');
    last = gradient_stops[percent];
  };

  stops = stops.join(", ");

  var css ='-webkit-gradient(linear,';

  css += (first.coordinates.x * 100 / canvas.width) +"% ";
  css += (first.coordinates.y * 100 / canvas.height) +"%, ";

  css += (last.coordinates.x * 100 / canvas.width) +"% ";
  css += (last.coordinates.y * 100 / canvas.height) +"%, ";

  css += stops;

  css += ")";
  
  return 'background: ' + css + ";";

};

generate.prototype.variants.firefox = function(options) {

  var gradient_stops = options.gradient_stops;
  var first = null;
  var last = null;
  var stops = [];
  for (var percent in gradient_stops) {
    if (!first) {
      first = gradient_stops[percent];
    };
    stops.push('rgba(' + gradient_stops[percent].color + ') ' + percent + '%');
    last = gradient_stops[percent];
  };

  stops = stops.join(", ");

  var css ='-moz-linear-gradient(';

  if (options.gradient_vertical) {
    css += "270deg,";
  } else {
    css += "0deg,";
  };
  
  css += stops;

  css += ")";
  
  return 'background: ' + css + ";";
  
};

generate.prototype.variants.ie = function(options) {
  
  var to_hex = function(N) {
   if (N==null) {
     return "00";
   }
   
   N = parseInt(N); 
   
   if (N==0 || isNaN(N)) {
     return "00";
   }
   N=Math.max(0,N); 
   N=Math.min(N,255); 
   N=Math.round(N);
   
   return "0123456789ABCDEF".charAt((N-N%16)/16)
        + "0123456789ABCDEF".charAt(N%16);
  };
  
  var rgba_to_hex = function(rgb_color) {
    var parts = rgb_color.split(",");
    var hex = "";

    for (var i=0; i < 3; i++) {
      hex += to_hex(parts[i]);
    };
    
    return '#' + hex;
  };
 
  var gradient_stops = options.gradient_stops;
  
  var first = rgba_to_hex(gradient_stops["0"].color);
  var last = rgba_to_hex(gradient_stops["100"].color);
  var type = (options.gradient_vertical == 0) ? 0 : 1;
 
  return "filter: progid:DXImageTransform.Microsoft.gradient(enabled='true',startColorstr=" + first + ",endColorstr=" + last + ",GradientType="+type+"); zoom: 1;";
  
};

generate.prototype.variants.diverse = function(options) {
    
  return ["-o-background-size: 100% 100%;",
  "-webkit-background-size: 100% 100%;",
  "-khtml-background-size: 100% 100%;",
  "background-size: 100% 100%;",
  "background-clip: border-box;",
  "",
  "-moz-background-clip: border;",
  "-webkit-background-clip: border-box;",
  "background-origin: border-box;",
  "-moz-background-origin: border;",
  "-webkit-background-origin: border-box;"].join("\n");
  
};