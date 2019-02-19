import fs from 'fs';
const fsPromises = require('fs').promises;
const acorn = require("acorn");
const astravel = require('astravel');
import { generate } from 'astring';
const prettier = require("prettier");
import { any, string } from 'prop-types';
import { exec } from 'child_process';
import loadNewStats from './main';

interface ParseHandler {
  directory?: string,

  selectedConfig?: string,

  configFile: string,

  originalConfig: string,

  updatedConfig: string,

  configHasBeenSelected: boolean,

  plugins: Array<AvailablePlugin>,

  setWorkingDirectory: (directory: string, selectedConfig?: string) => void;

  getWorkingDirectory: () => string;

  parseConfig: (
    entry: string,
    filepath: string,
    writeFile?: boolean
  ) => { entryPoints: any, ast: any };

  initEntryPoints: (
    entry?: string,
    writeFile?: boolean
  ) => { entryPoints: any, ast: any };

  updateConfig: () => string;

  saveConfig: () => void;

  definePlugins: (
    plugins: Array<AvailablePlugin>
  ) => void;

  showPlugins: () => Array<AvailablePlugin>;

  loadPlugin: (pluginName: string) => void;

  parsePlugin: (entry: string) => { pluginEntryPoints: any, ast: any };

  mergePlugin: () => void;

  loadStats2: (newConfig?: string, newWebpackConfigFile?: string) => void;

  // FIX
  //mergePluginSplitChunks: () => void;
}

interface AvailablePlugin {
  name: string;
  file: string;
  description: string;
  selected: boolean;
}

interface EntryPoints {
  all: any,
  body: any,
  moduleExports: any,
  oldModuleExports: Array<any>,
  plugins: Array<any>,
  pluginsSection: any,
  optimizationSection: any,
}

const listOfConfigs = [];

const entryPoints: EntryPoints = {
  all: {},
  body: {},
  moduleExports: any,
  oldModuleExports: [],
  plugins: [],
  pluginsSection: any,
  optimizationSection: any,
}

const pluginEntryPoints: EntryPoints = {
  all: {},
  body: {},
  moduleExports: any,
  oldModuleExports: [],
  plugins: [],
  pluginsSection: any,
  optimizationSection: any,
}

const parseHandler: ParseHandler = {
  directory: "test directory name", // directory for client files

  selectedConfig: '',

  configHasBeenSelected: false,

  configFile: "", // webpack config name

  plugins: [],

  updatedConfig: "", // text of new webpack config file

  originalConfig: "", // original text of webpack config file

  setWorkingDirectory: function (directory: string, selectedConfig: string) {
    console.log('directory: ', directory)
    console.log('selectedConfig: ', selectedConfig)

    this.directory = directory;
    if (selectedConfig) this.selectedConfig = selectedConfig;

    this.configHasBeenSelected = true;
  },

  getWorkingDirectory: function () {
    return this.directory
  },

  parseConfig: function (entry: string, filepath: string, writeFile: boolean = false) {

    let splitPoint: number = filepath.includes("/") ?
      filepath.lastIndexOf("/") :
      filepath.lastIndexOf("\\");

    this.directory = filepath.substring(0, splitPoint + 1);

    this.configFile = filepath.substring(splitPoint + 1);

    this.originalConfig = entry;
    // console.log('entry: ', entry);

    return this.initEntryPoints(entry, writeFile)
  },

  initEntryPoints: function (entry: string = parseHandler.originalConfig, writeFile: boolean = false) {
    // Parse it into an AST and retrieve the list of comments
    const comments: Array<string> = [];
    var ast = acorn.parse(entry, {
      ecmaVersion: 6,
      locations: true,
      onComment: comments,
    });
    // Attach comments to AST nodes
    astravel.attachComments(ast, comments);

    // Optionally writing ast to disk for testing purposes
    if (writeFile) {
      fs.writeFile(this.directory + "config.ast.json", JSON.stringify(ast, null, 2), (err) => {
      });
    }

    entryPoints.all = ast;

    entryPoints.body = ast.body;

    let i = ast.body.length - 1; // checking for module.exports starting from the end. Should be the last node.
    let configs: any = [];
    let oldModuleExports: any;

    while (i >= 0) {
      let candidate = ast.body[i].expression;

      if (
        candidate.left.object && candidate.left.object.name === "module" &&
        candidate.left.property && candidate.left.property.name === "exports"
      ) {
        oldModuleExports = candidate.right;
        break;
      }
      i--;
    }
    // If the last element is module.exports, which it should be, then check
    // if it's an Object we have found the config object. 
    // If it's an array, we need to find the config objects.
    // Multi configs not supported right now

    if (oldModuleExports.type === "ObjectExpression") { // we've found the single config

      configs.push(oldModuleExports)
      entryPoints.moduleExports = oldModuleExports
    } else if (oldModuleExports.type === "ArrayExpression") { // there are multiple configs

      // not supported now
      let configNames = oldModuleExports.elements;

      for (let i = 0; i < configNames.length; i++) {  // find configs matching names in module.exports array 

        let config = entryPoints.body.filter((d: any) => {
          return (
            d.type === "VariableDeclaration" &&
            d.declarations[0].id.name === configNames[i].name
          )
        })[0];
        configs.push(config.right);
      }
    }

    // should support adding multiple config's plugin sections, currently does the first
    entryPoints.pluginsSection = entryPoints.moduleExports.properties.filter(element => element.key.name === "plugins")[0];

    entryPoints.optimizationSection = entryPoints.moduleExports.properties.filter(element => element.key.name === "optimization")[0];

    return { entryPoints, ast }
  },

  updateConfig: function () {
    // Use astring.generate to convert config ast back to a JavaScript file
    let formattedCode = generate(entryPoints.all, {
      comments: true,
    })

    // console.log('formattedCode: ', formattedCode)

    // pretty up the formatted code
    formattedCode = formattedCode
      .replace("/[{/g", "}\n]")
      .replace(/\nmodule.exports/, "\n\nmodule.exports")
      .replace(/(\nconst.+new)/g, "\n$&")

    formattedCode = prettier.format(formattedCode, { semi: false, parser: "babylon" });

    this.updatedConfig = formattedCode

    return this.updatedConfig;
  },

  saveConfig: function () {
    let archiveName: string = this.configFile.split(".js")[0] + ".bak" + ".js"
    fs.rename(this.directory + this.configFile, this.directory + archiveName, (err) => {
      if (err) throw err;
    });

    // save new WebpackOpsAssets directory if doesn't already exist
    if (!fs.existsSync(this.directory + '/WebpackOpsAssets')) {
      fs.mkdirSync(this.directory + '/WebpackOpsAssets');
    }


    let newConfig = 'webpack --config ./new' + this.configFile + ' --profile --json > statsNew.json'

    let newWebpackConfigFile = `new${this.configFile}`;
    // creates new webpack.config file, then upon resolve, calls loadStats2 with newConfig
    // to create new stats.json file
    // ????????? //
    // fsPromises.writeFile(this.directory + '/WebpackOpsAssets' + '/' + 'new' + this.configFile, this.updatedConfig)
    fsPromises.writeFile(this.directory + '/' + newWebpackConfigFile, this.updatedConfig)
      .then(() => {
        this.loadStats2(newConfig, `${this.directory}/${newWebpackConfigFile}`);
      })
      .catch(err => {
        if (err) {
          console.log(err);
          return;
        }
      });
  },



  loadStats2: function (newConfig?: string, newWebpackConfigFile?: string) {
    async function runWebpack2(cmd) {
      return new Promise(function (resolve, reject) {
        exec(cmd, (err, stdout, stderr) => {
          if (err) {
            reject(err);
          } else {
            resolve({ stdout, stderr });
          }
        });
      });
    }

    // creates stats.json
    let aPromise = runWebpack2("cd '" + this.directory + "' && " + this.selectedConfig)
      .then((res) => {
        isStatsUpdated();
        // go display webpack stats
      })
      .catch((err) => {
        console.log(err);
      });

    let newStats = this.directory + '/statsNew.json';

    // creates new stats.json if there is a new webpack.config that has been generated
    if (newConfig) {
      runWebpack2("cd '" + this.directory + "' && " + newConfig)
        .then(() => console.log('got it?????', newStats))
        .then(() => loadNewStats(newStats, newWebpackConfigFile))
        .catch((err) => console.log(err));
    }

    function isStatsUpdated() {
      fs.readFile("stats.json", (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
      });
    }

    if (newConfig) console.log('newWebpackConfigFile: ', newWebpackConfigFile)
  },

  loadPlugin: function (name) {

    let pluginFileName = ""
    if (name === "Moment") {
      pluginFileName = "momentIgnorePluginConfig.js";

    } else if (name === "SplitChunks") {
      pluginFileName = "splitChunksPluginConfig.js";

    } else if (name === "mini") {
      return;
    }
    fs.readFile(__dirname + '/../src/plugins/' + pluginFileName, (err, data) => {
      if (err) return console.log(err)
      this.parsePlugin(data.toString())
      return { entryPoints: pluginEntryPoints }
    });
  },

  parsePlugin: function (entry: string) {
    // Parse it into an AST and retrieve the list of comments
    const comments: Array<string> = []
    const ast = acorn.parse(entry, {
      ecmaVersion: 6,
      locations: true,
      onComment: comments,
    })

    // Attach comments to AST nodes
    astravel.attachComments(ast, comments)

    pluginEntryPoints.all = ast;
    pluginEntryPoints.body = ast.body;

    let i = ast.body.length - 1 // Checking for module.exports from the end. Should be the last node.
    let configs: any = []
    let oldModuleExports: any

    // loop through ast looking for module.exports
    while (i >= 0) {
      let candidate = ast.body[i].expression;
      if (
        candidate.left.object && candidate.left.object.name === "module" &&
        candidate.left.property && candidate.left.property.name === "exports"
      ) {
        oldModuleExports = candidate.right;
        break;
      }
      i--;
    }

    if (oldModuleExports.type === "ObjectExpression") {
      configs.push(oldModuleExports)
      pluginEntryPoints.moduleExports = oldModuleExports
    }

    pluginEntryPoints.pluginsSection = pluginEntryPoints.moduleExports.properties.filter(element => element.key.name === "plugins")[0]

    pluginEntryPoints.optimizationSection = pluginEntryPoints.moduleExports.properties.filter(element => element.key.name === "optimization")[0]

    this.mergePlugin()

    return { pluginEntryPoints, ast }
  },


  definePlugins: function (plugins: Array<AvailablePlugin>) { // array of plugins
    this.plugins = plugins;
  },

  showPlugins: function () {
    return this.plugins;
  },

  mergePlugin: function () {
    // Add any variable declarations to the top of config
    // todo: Add multiple variable declarations from plugin 
    if (pluginEntryPoints.body[0].type === "VariableDeclaration") {

      if (entryPoints.body[0].declarations[0].init.arguments[0].value !== 'webpack') {
        // only add const webpack = require('webpack') if doesn't already exist
        entryPoints.body.unshift(pluginEntryPoints.body[0]);
      }
      // entryPoints.body.unshift(pluginEntryPoints.body[0])  // should check to see if already exists 
      // and do all variable definitions. currently doing one.
    }
    // Add any plugins to the plugins section of the config
    if (pluginEntryPoints.pluginsSection && pluginEntryPoints.pluginsSection.value.elements.length !== 0) {
      // check to see if plugins section of config exists and add if needed
      if (!entryPoints.pluginsSection) {
        // check to see if there is a plugins section already in place  
        entryPoints.moduleExports.properties.push(pluginEntryPoints.pluginsSection)
      } else {
        pluginEntryPoints.pluginsSection.value.elements.forEach(element => {
          entryPoints.pluginsSection.value.elements
            .push(JSON.parse(JSON.stringify(element)))
        })
      }
    }
    // Add any optimizations to the optimizations section of the config
    if (pluginEntryPoints.optimizationSection && pluginEntryPoints.optimizationSection.value.properties.length !== 0) {
      // check to see if optimization section of config exists and add if needed
      if (!entryPoints.optimizationSection) {
        // check to see if there is an optimization section already in place  
        entryPoints.moduleExports.properties.push(pluginEntryPoints.optimizationSection)
      } else {
        pluginEntryPoints.optimizationSection.value.properties.forEach(element => {
          if (!entryPoints.optimizationSection.value.properties[0]) {
            entryPoints.optimizationSection.value.properties
              .push(JSON.parse(JSON.stringify(element)))
          }
        });
      }
    }
    this.updateConfig()
  },
}

export default parseHandler;