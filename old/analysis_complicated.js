(function(){
  
  var image = document.getElementById("image");
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  
  image.onload = function() {
  
    ctx.drawImage(image, 0, 0);
  
  
    var round_number = function(number, digits) {
      var multiple = Math.pow(10, digits);
      var rndedNum = Math.round(number * multiple) / multiple;
      return rndedNum;
    }
  
    var get_colour = function(x, y) {
      var data = ctx.getImageData(x,y,1,1).data;
      
      if (!data.join) {
        var tmp = [];
        for (var i=0; i < 3; i++) {
          tmp.push(data[i]);
        };
        data = tmp;
      };

      return data.join(",");
    };
  
    var get_angle = function(p1, p2) {

      var distance_x = p2.x - p1.x,
          distance_y = p2.y - p1.y,

          slope = distance_y / distance_x,

          atan = Math.atan(slope) * (180 / Math.PI),

          length = Math.sqrt(Math.pow(distance_x,2) + Math.pow(distance_y, 2));
    
      var distance_x_half = distance_x / 2,
          distance_y_half = distance_y / 2;
    
      var length_middle_x = p1.x + distance_x_half,
          length_middle_y = p1.y + distance_y_half;
    
      return {
        atan: (atan ? atan : 0), 
        length: length, 
        length_middle: {
          x: length_middle_x, 
          y: length_middle_y 
        } 
      };

    };
  
    var colors_left = [];
    var colors_right = [];
    var colors_top = [];
    var colors_bottom = [];
  
    for (var y=0; y < canvas.height; y++) {
      colors_left.push({ coordinates: {x:0,y:y}, color: get_colour(0, y) });
      colors_right.push({ coordinates: {x:0,y:y}, color: get_colour(canvas.width-1, y) });
    };
  
    for (var x=0; x < canvas.width; x++) {
      colors_top.push({ coordinates: {x:x,y:0}, color: get_colour(x, 0) });
      colors_bottom.push({ coordinates: {x:x,y:canvas.height-1}, color: get_colour(x, canvas.height-1) });
    };
  
    var colors_left_bottom = [].concat(colors_left).concat(colors_bottom);
    var colors_right_top = [].concat(colors_right.reverse()).concat(colors_top.reverse());
  
    var colors_opposite = [];
  
    var j = 0;
  
    for (var i=0; i < colors_left_bottom.length; i++) {
      var color_1 = colors_left_bottom[i];
      var color_2 = null;

      for (var j=0; j < colors_right_top.length; j++) {

        if (color_1.color == colors_right_top[j].color) {
          color_2 = colors_right_top[j];
          break;
        };
      };

      if (color_2) {
        colors_opposite.push([color_1, color_2]);
      };
    
    };

    var colors_path = [];
  
    for (var i=0; i < colors_opposite.length; i++) {
    
      var angle_distance = get_angle(colors_opposite[i][0].coordinates, colors_opposite[i][1].coordinates);
      colors_path.push({
        color: colors_opposite[i][0].color, 
        length_middle: angle_distance.length_middle, 
        coordinates: colors_opposite[i][0].coordinates 
      });
    
    };

    var colors_path_length = get_angle(colors_path[0].length_middle, colors_path[colors_path.length-1].length_middle).length;

    var gradient_stops = {};
    var last_colour = null;
    var prev_colour = null;
    for (var i=0; i < colors_path.length; i++) {
    
      if (!prev_colour) {
        gradient_stops["0%"] = {
          color: colors_path[i].color,
          coordinates: colors_path[i].coordinates
        };
        colors_path[i].distance = 0;
      };
    
      if (prev_colour) {
        var distance = get_angle(prev_colour.length_middle, colors_path[i].length_middle).length;
        distance = round_number((distance * 100 / colors_path_length) + prev_colour.distance, 4);
      
        gradient_stops[distance +"%"] = {
          color: colors_path[i].color,
          coordinates: colors_path[i].coordinates
        };
              
        colors_path[i].distance = distance;
        
        if (distance > 100) {
          break;
        };
      };
    
      prev_colour = colors_path[i];
    
      ctx.rect(prev_colour.length_middle.x, prev_colour.length_middle.y, 1,1);
      ctx.fill()
  
    };
  
    var target = document.getElementById("target");
    target.style.width = canvas.width + "px";
    target.style.height = canvas.height + "px";
    
    var first = null;
    var last = null;
    var stops = [];
    for (var percent in gradient_stops) {
      if (!first) {
        first = gradient_stops[percent];
      };
      stops.push('color-stop(' + percent + ', rgb(' + gradient_stops[percent].color + '))');
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
    
    target.style.background = css;
    console.log(css);
  }
  
})();