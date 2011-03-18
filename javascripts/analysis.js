jQuery(function() {

  var sliderValue = 10;
  
  var $ = function(id) {
    return document.getElementById(id);
  };

  var image = $("image");
  var canvas = $("canvas");
  var ctx = canvas.getContext("2d");

  var src = image.src;
  image.src = "";
  image.onload = function() {
    
    canvas.width = image.width;
    canvas.height = image.height;
    $("image_clone").src = this.src;

    ctx.drawImage(image, 0, 0);
  
    var round_number = function(number, digits) {
      var multiple = Math.pow(10, digits);
      var roundedNum = Math.round(number * multiple) / multiple;
      return roundedNum;
    };
  
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
  
    var colors_left = [];
    var colors_right = [];
    var colors_top = [];
    var colors_bottom = [];
  
    for (var y=0; y < canvas.height; y++) {
      
      var percent = (y*100/canvas.height);
      var color_left = get_colour(0, y);
      var color_right = get_colour(canvas.width-1, y);
      
      colors_left.push({ coordinates: {x:0,y:y, percent: percent}, color: color_left });
      colors_right.push({ coordinates: {x:canvas.width-1,y:y, percent: percent}, color: color_right });
      
    };
  
    for (var x=0; x < canvas.width; x++) {
      
      var percent = (x*100/canvas.width);
      var color_top = get_colour(x, 0);
      var color_bottom = get_colour(x, canvas.height-1);
      
      colors_top.push({ coordinates: {x:x,y:0, percent:percent}, color: color_top });
      colors_bottom.push({ coordinates: {x:x,y:canvas.height-1, percent:percent}, color: color_bottom });
      
    };
  

    var gradient_vertical = true;
    var points_match = 0;
    
    for (var i=0; i < colors_left.length; i++) {
      if (colors_left[i].color != colors_right[i].color) {
        gradient_vertical = false;
        break;
      };
    };

    var gradient_stops = {};
    if (gradient_vertical) {
      for (var i=0; i < colors_left.length; i++) {
        gradient_stops[round_number(colors_left[i].coordinates.percent, 0)] = colors_left[i];
      };
    } else {
      for (var i=0; i < colors_top.length; i++) {
        gradient_stops[round_number(colors_top[i].coordinates.percent, 0)] = colors_top[i];
      };
    };
    
    var simplify_points = function(stops, mod) {
      var tmp = {};
      var first = {};
      var last = {};
      
      for (var prop in stops) {
        if (!first.key) {
          first.key = prop;
          first.data = stops[prop];
        };
        
        last.key = prop;
        last.data = stops[prop];

        if (prop % mod == 0) {
          tmp[prop] = stops[prop];
        };
        
      };
      
      var out = {};
      out[first.key] = first.data;
      for (var prop in tmp) {
        out[prop] = tmp[prop];
      };
      out[last.key] = last.data;
 
      
      return out;
    };

    var count_object = function(obj) {
      var i = 0;
      for (var prop in obj) {
        i++;
      };
      return i;
    };

    var target = $("target");

    var slider_change = function() {
      var _points = simplify_points(gradient_stops, slider_value);
      var output = (new generate({
        gradient_stops: _points, 
        canvas: canvas,
        gradient_vertical: gradient_vertical,
        image: image
      })).generate();
    
      jQuery(target).attr('style', output);
      
      jQuery("#export_dialog textarea")[0].value = output;
      $("count").innerHTML = slider_value + " | " + count_object(_points);
      
    };

    jQuery(this).unbind("slider_change", slider_change).bind("slider_change", slider_change);

    var _slider = jQuery("#slider");
    _slider.slider("value", 50);
    _slider.slider("option", 'slide')(_slider, {value:50});
    
  };
  
  image.src = src;

  
  var droparea = $("droparea");
  
  setInterval(function() {
    if (droparea.value.length) {
      var value = droparea.value;
      image.src = "";
      droparea.value = "";
      image.src = 'file://'+value;
    };
  });
  
  jQuery("#slider").slider({
    min: 1,
    max: 100,
    slide: function(ui, slider) {
      slider_value = slider.value;
      jQuery(image).trigger("slider_change");
    }
  });
  
  jQuery("#export").click(function() {

    jQuery("#export_dialog").dialog({
      height: 400,
      width: "89%",
    });
    
    return false;
  });

});