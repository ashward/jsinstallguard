# JSInstallGuard

JSInstallGuard is a small security wrapper around the package manager which intercepts any `preinstall` and `postinstall` scripts.

These are checked against an allow list, and if they have not been explicitly allowed then the install script will be blocked.

It supports both `yarn` and `npm` package managers.

## Getting Started

### Manual Installation
Because JSInstallGuard needs to be in place before the packages are installed, it needs to be manually copied into your project directory, ideally before your very first `yarn install` or `yarn add`.

#### 1. Download the code as a zip

You can get the latest from: https://github.com/ashward/jsinstallguard/archive/master.zip

```bash
curl -LO https://github.com/ashward/jsinstallguard/archive/master.zip
```

> Note: I know this is the master branch, but I will add versioning and proper releases soon!

#### 2. Unpack the zip and copy the files from the `jsinstallguard/` directory into the root of your project.

Unzip the files
```bash
unzip master.zip
```

And copy them into /your/project/root
```bash
cp -r jsinstallguard-master/files/. /your/project/root/
```

This will add:

* A `.jsig/` directory which contains the JSInstallGuard code (feel free to inspect it and make sure you trust what it's doing.)
* A `.yarnrc` file which will ensure that it's actually JSInstallGuard that runs when you run `yarn`
* A `.npmrc` file which will ensure that it's actually JSInstallGuard that runs when you run `npm`
* A `jsig-allow.json` file which contains an array of the allowed scripts. Add an entry to the `allow` array to allow a trusted script to run.

> If you already have a `.yarnrc` or `.npmrc` file then you will need to manually merge it.

### Installation via the package manager (experimental)

How you install it via the package manager will depend on what stage your project is at. This is because running `yarn add ...` or `npm install ...` will also trigger an install of all the other project dependencies, and this would occur before JsInstallGuard is running.

Therefore, if you have a new project without any dependencies, follow option (a). If you are installing this into an existing project which doesn't currently have JSInstallGuard installed, use option (b).

#### a) For a newly initialised project

If your project is newly initialised and doesn't have any dependencies then you can simply install it (after running `yarn init` or `npm init`) using your package manager:

**yarn**

```bash
yarn add --dev jsinstallguard
```

**npm**

```bash
npm install --save-dev jsinstallguard
```

#### b) For an existing project

##### 1. It is recommended to remove your node_modules directory if you have one

```bash
rm -rf node_modules
```

##### 2. Re-create a blank node_modules directory.

This isn't strictly necessary, but can save some confusion in some circumstances due to the way package managers decide which directory to install into.

```bash
mkdir node_modules
```

##### 3. Rename your existing `package.json` file

This is so that no other dependencies are installed at the same time

```bash
mv package.json package.json.bak
```

##### 4. Install the module

**yarn** 

```bash
yarn add jsinstallguard
```

**npm**

```bash
npm install jsinstallguard
```

##### 5. Put your `package.json` back again

```bash
mv package.json.bak package.json
```

### Check it's working

From your project root, run

```bash
yarn --version
```
will check it's working with `yarn`

and

```bash
npm
```
will check it's working with `npm`

If it's working then you will see something like the following at the top of both the outputs:

```
👮‍♀️   JSInstallGuard: Using JSIG version: x.x.x`
```

If you see the above you can start installing packages!

### Install your packages

When you install or add packages, when one tries to run an install script then you will see an error.

You should then do what you need to do to make sure you trust the script it's running.

If you do trust it then add the given line to the `allow: []` array in `jsig-allow.json`.

If you find something potentially dodgy or malicious then please report it to npmjs: https://docs.npmjs.com/reporting-a-vulnerability-in-an-npm-package

### Commit it into your project and share the love

You should commit all the JSInstallGuard files and directory (`.jsig/`, `.yarnrc`, `.npmrc`, and `jsig-allow.json`) into your project source control so that everyone gets the benefit!

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgments

* Thanks to https://github.com/martin-bucinskas for his invaluable help with testing and debugging!