const FS = require("fs");
const Path = require("path");
const OS = require("os");

const npmrc = "onload-script=${PWD}/.jsig/jsig-npm.js";
const yarnrc = 'yarn-path "./.jsig/jsig-yarn.js"';

// First add (or replace) the .jsig directory
try {
  let existingJsig = require("../../.jsig");

  console.info("Found existing JSInstallGuard, version", existingJsig.version);
} catch (e) {
  // Ignore - likely none found
}

function getNpmVersion() {
  var matches = /npm\/((\d+)\.(\d+)\.(\d+)\S*)/.exec(process.env.npm_config_user_agent);

  if(matches) {
    return {
      full: matches[1],
      major: parseInt(matches[2]),
      minor: parseInt(matches[3]),
      patch: parseInt(matches[4])
    }
  }
}

var npmVersion = getNpmVersion();

if(npmVersion && npmVersion.major >= 7) {
  console.error(
    "================================= JSInstallGuard ===================================="
  );
  console.error(
    "🚨   You are currently using npm version " + npmVersion.full
  );
  console.error(
    "🚨   Due to breaking changes in npm version 7, JSInstallGuard can't support this version."
  );
  console.error(
    "🚨   Please use npm 6 or below to benefit from JSInstallGuard."
  );
  console.error(
    "====================================================================================="
  );
}

const rootFiles = [
  {
    dir: ".",
    name: "jsig-allow.json",
    force: false,
  },
  {
    dir: ".jsig",
    name: "index.js",
    force: true,
  },
  {
    dir: ".jsig",
    name: "jsig-npm.js",
    force: true,
  },
  {
    dir: ".jsig",
    name: "jsig-yarn.js",
    force: true,
  },
];

const path1 = Path.parse(__dirname);
const path2 = Path.parse(path1.dir);

if (path2.base === "node_modules") {
  // Looks like we're being installed as a project dependency

  const rootDir = path2.dir;

  // Remove the existing .jsig directory if there is one
  const jsigDirectory = Path.join(rootDir, ".jsig");

  if (FS.existsSync(jsigDirectory)) {
    FS.readdirSync(jsigDirectory).forEach((file) =>
      FS.unlinkSync(Path.resolve(jsigDirectory, file))
    );
  } else {
    FS.mkdirSync(jsigDirectory);
  }

  // Copy the files
  rootFiles.forEach((file) => {
    const srcFile = Path.join("files", file.dir, file.name);
    const destFile = Path.join(rootDir, file.dir, file.name);

    if (!file.force && FS.existsSync(destFile)) {
      console.warn(`${file.name} exists - won't overwrite`);
      return;
    }

    FS.copyFileSync(srcFile, destFile);
  });

  // Manually create the .yarnrc and .npmrc files

  // This can merge .yarnrc files
  const yarnMerger = (content) => {
    return mergeRcFile(content, /^yarn-path\s.*$/gm, yarnrc);
  };

  // This can merge .npmrc files
  const npmMerger = (content) => {
    return mergeRcFile(content, /^onload-script=.*$/gm, npmrc);
  };

  // This function will update an .xxxrc file on disk
  function writeRcFile(file, merger) {
    const destFile = Path.join(rootDir, file);

    let newContent = "";

    if (FS.existsSync(destFile)) {
      newContent = FS.readFileSync(destFile, { encoding: "utf8" }).toString();
    }

    newContent = merger(newContent);

    FS.writeFileSync(destFile, newContent, { encoding: "utf8" });
  }

  // This function will update the .xxxrc file content
  function mergeRcFile(currentContent, pattern, newLine) {
    let newContent = currentContent;

    if (newContent.match(pattern)) {
      newContent = newContent.replace(pattern, newLine);
    } else {
      if (!newContent.endsWith(OS.EOL)) {
        newContent += OS.EOL;
      }

      newContent += newLine + OS.EOL;
    }

    return newContent;
  }

  // And these lines invoke the above functions to update the .xxxrc files
  writeRcFile(".yarnrc", yarnMerger);
  writeRcFile(".npmrc", npmMerger);
}
