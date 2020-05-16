var ChildProcess = require("child_process");
var Path = require("path");

var jsigVersion = "0.1.5";

module.exports = {
  version: jsigVersion,

  init: function (isNpm) {
    var rootDir = process.cwd();

    console.info(`👮‍♀️   JSInstallGuard: Using JSIG version: ${jsigVersion}`);

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

        var cmd;

        if (isNpm) {
          cmd = arguments[1][1];
        } else {
          cmd = arguments[0];
        }

        var version = arguments[2].env.npm_package_version;

        if (
          allowed.allow.filter((allow) => {
            return (
              allow.path === path && allow.cmd === cmd && allow.v === version
            );
          }).length === 0
        ) {
          console.error();
          console.error();
          console.error(
            "================================= JSInstallGuard ===================================="
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
              jsig: jsigVersion,
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
            "====================================================================================="
          );
          console.error();

          // We will cause an error rather than just silently not running the script.
          if (isNpm) {
            // If it's npm we will return a failing child process
            return originalSpawn("exit 126");
          } else {
            // Yarn is good with a JS error
            throw new Error(
              `JSInstallGuard: Install script blocked for ${path}`
            );
          }
        }
      }
      return originalSpawn.call(this, command, args, options);
    };
  },
};
