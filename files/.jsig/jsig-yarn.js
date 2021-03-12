#!/usr/bin/env node

/*!
 * This file, and the files within this .jsig directory, are part of JSInstallGuard
 * https://github.com/ashward/jsinstallguard
 * 
 * If you have any problems with JSInstallGuard then please raise an issue here:
 * https://github.com/ashward/jsinstallguard/issues
 * 
 * It is provided under the MIT license (see the LICENSE file in the .jsig directory)
 * 
 * Copyright (c) 2020 Ashley Ward <https://github.com/ashward>
 */

/* eslint-disable no-var */
"use strict";

var ChildProcess = require("child_process");
var Path = require("path");
var FS = require("fs");
var jsig = require("./index");

// Work out where the actual yarn installation is
var yarnJsFile;

if (process.env.jsig_yarn_js_file) {
  // We're in a sub-process yarn, so use the original (top-level) one.
  yarnJsFile = process.env.jsig_yarn_js_file;
} else {
  try {
    var yarnFile = ChildProcess.execSync("which yarn").toString().trim();

    var yarnDir = Path.dirname(FS.realpathSync(yarnFile));

    // If 'yarn.js' isn't in the same dir as the yarn' script
    // then we will try and parse its location from the script.
    // This seems to happen in some Homebrew installations
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

    yarnJsFile = Path.resolve(yarnDir, "yarn.js");

    // Store the actual Yarn dir in an env var so that child processes can pick it up
    process.env.jsig_yarn_js_file = yarnJsFile;
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

require(yarnJsFile);
