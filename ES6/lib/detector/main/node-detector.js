"use strict";

var Detector = require("./detector");
var Rules = require("./rules");

var detector = new Detector(Rules);

module.exports = detector;