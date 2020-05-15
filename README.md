# JSInstallGuard

JSInstallGuard is a small security wrapper around the package manager which intercepts any `preinstall` and `postinstall` scripts.

These are checked against an allow list, and if they have not been explicitly allowed then the install script will be blocked.

Note: Currently only `yarn` is supported, but `npm` support will be forthcoming!

## Installation (for Yarn)
Because JSInstallGuard needs to be in place before the packages are installed, it needs to be manually copied into your project directory, ideally before your very first `yarn install` or `yarn add`.

### 1. Download the code as a zip

You can get the latest from: https://github.com/ashward/jsinstallguard/archive/master.zip

```bash
curl -LO https://github.com/ashward/jsinstallguard/archive/master.zip
```

> Note: I know this is the master branch, but I will add versioning and proper releases soon!

### 2. Unpack the zip and copy the files into the root of your project.

Unzip the files
```bash
unzip master.zip
```

And copy them into /your/project/root
```bash
cp -r jsinstallguard-master/. /your/project/root/
```

This will add:

* A `.jsig/` directory which contains the JSInstallGuard code (feel free to inspect it and make sure you trust what it's doing.)
* A `.yarnrc` file which will ensure that it's actually JSInstallGuard that runs when you run `yarn`
* A `jsig-allow.json` file which contains an array of the allowed scripts. Add an entry to the `allow` array to allow a trusted script to run.

> If you already have a `.yarnrc` file then you will need to manually merge it.

### 3. Check it's working

From your project root, run

```bash
yarn --version
```

If it's working then you will see somehting like the following at the top of the output:

```
👮‍♀️   JSInstallGuard: Using JSIG version: x.x.x`
```

If you see the above you can start installing packages!

### 4. Install your packages

When you install or add packages, when one tries to run an install script then you will see an error.

You should then do what you need to do to make sure you trust the script it's running.

If you do trust it then add the given line to the `allow: []` array in `jsig-allow.json`.

If you find something potentially dodgy or malicious then please report it to npmjs: https://docs.npmjs.com/reporting-a-vulnerability-in-an-npm-package

### 5. Commit it into your project and share the love

You should commit all the JSInstallGuard files and directory (`.jsig/`, `.yarnrc`, and `jsig-allow.json`) into your project source control so that everyone gets the benefit!

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgments

* Thanks to https://github.com/martin-bucinskas for his invaluable help with testing and debugging!