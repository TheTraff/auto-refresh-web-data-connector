/*
 *  Countdown 360 - v0.1.9
 *  https://github.com/johnschult/jquery.countdown360
 *  Original countdown plugin made by John Schult, under MIT License
 *  
 *  https://github.com/nledenyi/tableau-auto-refresh
 *  Improvements and minor modifications to make the plugin work with Tableau made by Norbert Ledenyi, under MIT License
 */
;(function ($, window, document, undefined) {
  var pluginName = "countdown360",
    defaults = {
      radius: 30,                      // radius of arc
      strokeStyle: "#477050",          // the color of the stroke
      strokeWidth: undefined,          // the stroke width, dynamically calulated if omitted in options
      fillStyle: "#8ac575",            // the fill color
      fontColor: "#ffffff",            // the font color
      fontFamily: "sans-serif",        // the font family
      fontSize: undefined,             // the font size, dynamically calulated if omitted in options
      fontWeight: 700,                 // the font weight
      autostart: false,                // start the countdown automatically
      seconds: 10,                     // the number of seconds to count down
      label: ["second", "seconds"],    // the label to use or false if none
      smooth: true,                    // should the timer be smooth or stepping
      direction: "cw",                 // Clockwise (cw) or counter-clockwise (ccw)
      onComplete: function () {}
    };

  function Plugin(element, options) {
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    if (!this.settings.fontSize) { this.settings.fontSize = this.settings.radius/1.2; }
    if (!this.settings.strokeWidth) { this.settings.strokeWidth = this.settings.radius/4; }
    this._defaults = defaults;
    this._name = pluginName;
    this._init();
  }

  Plugin.prototype = {
    getStatus: function() {
      return this.interval != undefined;
    },

    start: function () {
      this.startedAt = new Date();
      this._drawCountdownShape(Math.PI*3.5, true);
      this._drawCountdownLabel(0);
      var timerInterval = 1000;
      if (this.settings.smooth) {
        timerInterval = 16;
      }
      this.interval = clearInterval(this.interval);
      this.interval = setInterval(jQuery.proxy(this._draw, this), timerInterval);
    },

    stop: function (cb) {
      this.interval = clearInterval(this.interval);
      if (cb) { cb(); }
    },
    
    pause: function () {
      if (this.getStatus()) {
        this.msElasped = (new Date().getTime() - this.startedAt.getTime());
        this.stop();
        this._draw();
      }
    },
    
    cont: function () {
      if (!this.getStatus() && this.msElasped != undefined) {
        this.startedAt = new Date(new Date().getTime() - this.msElasped);
        var timerInterval = 1000;
        if (this.settings.smooth) {
          timerInterval = 16;
        }
        this.interval = clearInterval(this.interval);
        this.interval = setInterval(jQuery.proxy(this._draw, this), timerInterval);
        this.msElasped = undefined;
      }
    },
    
    showControls: function (controlsFlag) {
      this.controls = controlsFlag;
      if (!this.getStatus() || !this.settings.smooth) {
        this._draw();
      }
    },

    _init: function () {
      this.settings.width = (this.settings.radius * 2) + (this.settings.strokeWidth * 2);
      this.settings.height = this.settings.width;
      this.settings.arcX = this.settings.radius + this.settings.strokeWidth;
      this.settings.arcY = this.settings.arcX;
      this._initPen(this._getCanvas());
      if (this.settings.autostart) { this.start(); }
    },

    _getCanvas: function () {
      var $canvas = $("<canvas id=\"countdown360_" + $(this.element).attr("id") + 
                      "\" onmouseover=\"countdown.showControls(true);\" onmouseout=\"countdown.showControls(false);\" width=\"" +
                      this.settings.width + "\" height=\"" +
                      this.settings.height + "\">" +
                      "<span id=\"countdown-text\" role=\"status\" aria-live=\"assertive\"></span>" +
                      "</canvas>");
      $(this.element).prepend($canvas[0]);
      return $canvas[0];
    },

    _initPen: function (canvas) {
      this.pen              = canvas.getContext("2d");
      this.pen.lineWidth    = this.settings.strokeWidth;
      this.pen.strokeStyle  = this.settings.strokeStyle;
      this.pen.fillStyle    = this.settings.fillStyle;
      this.pen.textAlign    = "center";
      this.pen.textBaseline = "middle";
      this.ariaText = $(canvas).children("#countdown-text");
      this._clearRect();
    },

    _clearRect: function () {
      this.pen.clearRect(0, 0, this.settings.width, this.settings.height);
    },

    _secondsLeft: function(secondsElapsed) {
      return this.settings.seconds - secondsElapsed;
    },

    _drawCountdownLabel: function (secondsElapsed) {
      this.ariaText.text(secondsLeft);
      console.log("now in the draw countdown label function");
      console.log(this.settings.fontWeight);
      this.pen.font = this.settings.fontWeight + " " + this.settings.fontSize + "px " + this.settings.fontFamily;
      var secondsLeft = this._secondsLeft(secondsElapsed),
          label = secondsLeft === 1 ? this.settings.label[0] : this.settings.label[1],
          drawLabel = this.settings.label && this.settings.label.length === 2 && !this.controls,
          x = this.settings.width/2;
      if (drawLabel) {
        y = this.settings.height/2 - (this.settings.fontSize/6.2);
      } else {
        y = this.settings.height/2;
      }
      if (this.controls) {
        this.pen.fillStyle  = this.settings.fontColor;
        if (this.getStatus()) {
          this.pen.fillText("❚❚",x,y);   // media control character for pause
        } else {
          this.pen.fillText("▶",x,y);   // media control character for play
        }
      } else {
        this.pen.fillStyle = this.settings.fillStyle;
        this.pen.fillText(secondsLeft + 1, x, y);
        this.pen.fillStyle  = this.settings.fontColor;
        this.pen.fillText(secondsLeft, x, y);
      }
      if (drawLabel) {
        this.pen.font = "normal small-caps " + (this.settings.fontSize/3) + "px " + this.settings.fontFamily;
        this.pen.fillText(label, this.settings.width/2, this.settings.height/2 + (this.settings.fontSize/2.2));
      }
    },

    _drawCountdownShape: function (endAngle, drawStroke) {
      this.pen.fillStyle = this.settings.fillStyle;
      this.pen.beginPath();
      this.pen.arc(this.settings.arcX, this.settings.arcY, this.settings.radius, Math.PI*1.5, endAngle, false);
      this.pen.fill();
      if (drawStroke) { this.pen.stroke(); }
    },

    _draw: function () {
      var millisElapsed, secondsElapsed;
      millisElapsed = new Date().getTime() - this.startedAt.getTime();
      if (!this.getStatus() && this.msElasped != undefined) {
        millisElapsed = this.msElasped;
      }
      secondsElapsed = Math.floor((millisElapsed)/1000);
      if (this.settings.smooth) {
        endAngle = (Math.PI*3.5) - (((Math.PI*2)/(this.settings.seconds * 1000)) * millisElapsed);
      } else {
        endAngle = (Math.PI*3.5) - (((Math.PI*2)/(this.settings.seconds)) * secondsElapsed);
      }
      if (this.settings.direction == "cw") {
          endAngle = (Math.PI) - endAngle
      }
      this._clearRect();
      this._drawCountdownShape(Math.PI*3.5, false);
      if (secondsElapsed < this.settings.seconds) {
        this._drawCountdownShape(endAngle, true);
        this._drawCountdownLabel(secondsElapsed);
      } else {
        if (this.settings.direction == "cw") {
          endAngle = Math.PI*3.5;   // angle for a full circle
        } else {
          endAngle = Math.PI*1.5;   // angle for no circle
        }
        this._drawCountdownShape(endAngle, true);
        this._drawCountdownLabel(this.settings.seconds);
        if (this.getStatus()) {
          this.stop();
          this.settings.onComplete();
        }
      }
    }
  };

  $.fn[pluginName] = function (options) {
    var plugin;
    this.each(function() {
      plugin = $.data(this, "plugin_" + pluginName);
      if (!plugin) {
        plugin = new Plugin(this, options);
        $.data(this, "plugin_" + pluginName, plugin);
      }
    });
    return plugin;
  };

})(jQuery, window, document);


getTableau = function() {
  return tableau;
};

getCurrentViz = function() {
  return getTableau().VizManager.getVizs()[0];
};

getCurrentWorkbook = function() {
  return getCurrentViz().getWorkbook();
};

onParamChange = function(parameterEvent) {
  return parameterEvent.getParameterAsync().then(getParameter);
};    

getParameter = function(parameter) {
  if (parameter.getName().lastIndexOf("autoRefresh_",0) === 0) {
    processParam(parameter.getName(),parameter.getCurrentValue().value);
  }
};

getParameters = function(parameters) {
  for(i=0;i<parameters.length;i++){
    if (parameters[i].getName().lastIndexOf("autoRefresh_",0) === 0) {
      processParam(parameters[i].getName(),parameters[i].getCurrentValue().value);
    }
  }
  countdown.start();
};

processParam = function(parameter, value) {
  console.log("AutoRefresh parameter received: " + parameter + " with the value of " + value + ", type: "+ typeof(value))
  parameter = parameter.substr(12);   // Trim 'autoRefresh_' from the beginning
  switch (parameter) {
    case "seconds" : countdown.settings.seconds = parseInt(value);
      break;
    case "fontWeight" : countdown.settings.fontWeight = parseInt(value);
      break;
    case "radius" : 
      countdown.pause();
      $("#countdown360_countdown").remove();
      countdown.settings.radius = parseFloat(value);
      countdown._init();
      countdown.cont();
      break;
    case "strokeWidth" : 
      countdown.pause();
      $("#countdown360_countdown").remove();
      countdown.settings.strokeWidth = parseFloat(value);
      countdown._init();
      countdown.cont();
      break;
    case "fontSize" : countdown.settings.fontSize = parseFloat(value);
      break;
    case "direction" : countdown.settings.direction = (String(value) == "cw" ? "cw" : "ccw");
      break;
    case "strokeStyle" : countdown.pen.strokeStyle = String(value);
      break;
    case "fillStyle" : countdown.settings.fillStyle = String(value);
      break;
    case "fontColor" : countdown.settings.fontColor = String(value);
      break;
    case "fontFamily" : countdown.settings.fontFamily = String(value);
      break;
    case "label" : countdown.settings.label = String(value).split(",");
      break;
    case "smooth" :
      countdown.pause();
      countdown.settings.smooth = (String(value).toLowerCase() == "true");
      countdown.cont();
      break;
    default: 
      console.log("AutoRefersh parameter received but could not be processed (" + parameter + "). Check if the parameter name is among the accepted ones.");
  }
  return true;
}

initAutoRefresh = function() {
  console.log("AutoRefresh init");
  countdown._drawCountdownShape(Math.PI*3.5, false);
  countdown._drawCountdownLabel(0);
  tableau = getTableau();
  workbook = getCurrentWorkbook();
  viz = getCurrentViz();
  viz.addEventListener(tableau.TableauEventName.PARAMETER_VALUE_CHANGE, onParamChange);
  workbook.getParametersAsync().then(getParameters);
};

this.appApi = {
  initAutoRefresh: initAutoRefresh
};
