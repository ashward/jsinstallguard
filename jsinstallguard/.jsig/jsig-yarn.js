#!/usr/bin/env node

/* eslint-disable no-var */
"use strict";

var ChildProcess = require("child_process");
var Path = require("path");
var FS = require("fs");
var jsig = require(".");

console.info(`👮‍♀️   JSInstallGuard: Using JSIG version: ${jsig.version}`);

var rootDir = process.cwd();

// Work out where the actual yarn installation is
var yarnDir;

try {
  var yarnFile = ChildProcess.execSync("which yarn").toString().trim();

  yarnDir = Path.dirname(FS.realpathSync(yarnFile));

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
} catch (e) {
  //  TODO: Add a way of specifying the yarn executable
  console.error(
    "🛑   JSInstallGuard: Could not find yarn executable using 'which yarn'"
  );
  console.error("🛑   JSInstallGuard:", e.message);
  process.exit(1);
}

// Get the list of allowed scripts
var allowed;

try {
  allowed = require(Path.resolve(rootDir, "jsig-allow.json"));
} catch (e) {
  console.warn(
    "❗   JSInstallGuard: Could not parse 'jsig-allow.json'. All install scripts will be blocked."
  );
  console.warn("❗   JSInstallGuard: ", e.message);
  allowed = { allow: [] };
}

(function () {
  // Keep a handle to the original spawn method
  var originalSpawn = ChildProcess.spawn;

  // We intercept the 'child_process.spawn()' function call so we can check
  // whether it's in the allow list. If not we throw an error.
  ChildProcess.spawn = function (command, args, options) {
    if (
      arguments[2] &&
      arguments[2].env &&
      (arguments[2].env.npm_lifecycle_event === "postinstall" ||
        arguments[2].env.npm_lifecycle_event === "preinstall")
    ) {
      let path = arguments[2].cwd;

      if (path.startsWith(rootDir)) {
        path = path.substring(rootDir.length + 1);
      }
      var cmd = arguments[0];
      var version = arguments[2].env.npm_package_version;

      if (
        allowed.allow.filter((allow) => {
          return allow.path == path && allow.cmd == cmd && allow.v == version;
        }).length == 0
      ) {
        console.error();
        console.error();
        console.error(
          "============================== JSInstallGuard ===================================="
        );
        console.error(
          "🚨   A Node module is attempting to execute a shell command which has been blocked:"
        );
        console.error(`🚨   Module: ${path}`);
        console.error(`🚨   Version: ${version}`);
        console.error(`🚨   Command:`);
        console.error();
        console.error(cmd);
        console.error();
        console.error(
          "🚨   If you trust it (and make sure you actually understand and trust what it's doing)"
        );
        console.error(
          "🚨   then add the following to the 'allow' array in jsig-allow.json to allow:"
        );
        console.error();
        console.error(
          JSON.stringify({
            jsig: jsig.version,
            path: path,
            v: version,
            cmd: cmd,
          })
        );
        console.error();
        console.error(
          "🚨   If you suspect this to be malicious activity then please report it."
        );
        console.error(
          "🚨   https://docs.npmjs.com/reporting-a-vulnerability-in-an-npm-package"
        );
        console.error(
          "=================================================================================="
        );
        console.error();

        // We will throw an error rather than just silently not running the script.
        throw new Error(`JSInstallGuard: Install script blocked for ${path}`);
      }
    }
    return originalSpawn.call(this, command, args, options);
  };
})();

require(Path.resolve(yarnDir, "yarn.js"));
