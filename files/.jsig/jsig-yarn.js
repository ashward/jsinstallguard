#!/usr/bin/env node

/* eslint-disable no-var */
"use strict";

var ChildProcess = require("child_process");
var Path = require("path");
var FS = require("fs");
var jsig = require("./index");

// Work out where the actual yarn installation is
var actualYarn;

if(process.env.jsig_yarn_file) {
  // We're in a sub-process yarn, so use the original (top-level) one.
  actualYarn = process.env.jsig_yarn_file;
} else {
  try {
    var yarnFile = ChildProcess.execSync("which yarn").toString().trim();

    var yarnDir = Path.dirname(FS.realpathSync(yarnFile));

    // If 'yarn.js' isn't in the same dir as the yarn' script
    // then we will try and parse its location from the script.
    // This seems to happen in some Hmoebrew installations
    if (!FS.existsSync(Path.resolve(yarnDir, "yarn.js"))) {
      var yarnScript = FS.readFileSync(yarnFile).toString();

      var match = yarnScript.match(/([^'"]+)\/yarn\.js/);

      if (match) {
        yarnDir = match[1];
      } else {
        throw new Error(
          `Could not determine yarn.js path from yarn script ${yarnScript}`
        );
      }
    }

    actualYarn = Path.resolve(yarnDir, "yarn.js");

    // Store the actual Yarn dir in an env var so that child processes can pick it up
    process.env.jsig_yarn_file = actualYarn;
  } catch (e) {
    //  TODO: Add a way of specifying the yarn executable
    console.error(
      "🛑   JSInstallGuard: Could not find yarn executable using 'which yarn'"
    );
    console.error("🛑   JSInstallGuard:", e.message);
    process.exit(1);
  }
}

jsig.init(false);

require(actualYarn);
