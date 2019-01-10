import fs from 'fs';
const acorn = require("acorn");
const astravel = require('astravel');
import { generate } from 'astring';
const prettier = require("prettier");
import { any, string } from 'prop-types';
import { exec } from 'child_process';

interface ParseHandler {
  directory: string,

  configFile: string,

  originalConfig: string,

  updatedConfig: string,

  plugins: Array<AvailablePlugin>,

  setWorkingDirectory: (directory: string) => void;

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

//  loadPluginSplitChunks: () => void;

//  loadPluginMini: () => void;

  parsePlugin: (entry: string) => { entryPoints: any, ast: any };

//  parsePluginSplitChunks: (entry: string) => { entryPoints: any, ast: any };

  mergePlugin: () => void;

  addOptimizationSection: (ast: any) => void;

  addPluginsSection: (ast: any) => void;

  loadStats2: () => void;

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
  moduleExports: Array<any>,
  plugins: Array<any>,
  pluginsSection: any,
  optimizationSection: any,  
}

const listOfConfigs = []

const entryPoints: EntryPoints = {
  all: {},
  body: {},
  moduleExports: [],
  plugins: [],
  pluginsSection: any,
  optimizationSection: any,  
}

const pluginEntryPoints: EntryPoints = {
  all: {},
  body: {},
  moduleExports: [],
  plugins: [],
  pluginsSection: any,
  optimizationSection: any,  
}

const parseHandler: ParseHandler = {
  directory: "test directory name", // directory for client files

  configFile: "", // webpack config name

  plugins: [],

  updatedConfig: "",

  originalConfig: "",

  setWorkingDirectory: function (directory: string) {
    this.directory = directory
  },

  getWorkingDirectory: function () {
    return this.directory
  },

  parseConfig: function (entry: string, filepath: string, writeFile: boolean = false) {
    console.log("doing parseConfig converts config to AST")
    
    let splitPoint: number = filepath.includes("/") ? 
      filepath.lastIndexOf("/") : 
      filepath.lastIndexOf("\\");

    this.directory = filepath.substring(0, splitPoint + 1);
    console.log("filepath is set to", filepath)
    console.log("this.directory is set to", this.directory)

    this.configFile = filepath.substring(splitPoint + 1);

    this.originalConfig = entry;

    return this.initEntryPoints(entry, writeFile)
  },

  initEntryPoints: function (entry: string = parseHandler.originalConfig, writeFile: boolean = false){
    console.log("initializing EntryPoints. Resets config to original.")
        // Parse it into an AST and retrieve the list of comments
    const comments: Array<string> = []
    var ast = acorn.parse(entry, {
      ecmaVersion: 6,
      locations: true,
      onComment: comments,
    })

    // Attach comments to AST nodes
    astravel.attachComments(ast, comments)

    // Optionally writing ast to disk for testing purposes
    if (writeFile) {
      fs.writeFile(this.directory + "config.ast.json", JSON.stringify(ast, null, 2), (err) => {
        console.log("The ast file has been succesfully saved");
      });
    }

    entryPoints.all = ast;
    entryPoints.body = ast.body;
    
    let i = ast.body.length - 1 // checking for module.exports starting from the end. Should be the last node.
    let configs: any = []
    let moduleExports: any

    while (i >= 0) {
      let candidate = ast.body[i].expression
      if (
        candidate.left.object && candidate.left.object.name === "module" &&
        candidate.left.property && candidate.left.property.name === "exports"
      ) {
        moduleExports = candidate.right
        break
      }
      i--
    }

    // If the last element is module.exports, which it should be, then check
    // if it's an Object we have found the config object. 
    // If it's an array, we need to find the config objects.

    if (moduleExports.type === "ObjectExpression") { // we've found the single config
      console.log("we've found the single config")
      entryPoints.moduleExports.push(moduleExports)
      configs.push(moduleExports)
    } else if (moduleExports.type === "ArrayExpression") { // there are multiple configs
      console.log("gathering multiple configs")
      let configNames = moduleExports.elements;
    
      for (let i = 0; i < configNames.length; i++) {  // find configs matching names in module.exports array 
        let config = entryPoints.body.filter( (d: any) => {
          return (
            d.type === "VariableDeclaration" &&
            d.declarations[0].id.name === configNames[i].name
          )
        })[0]
        configs.push(config.right)
      }
      console.log("The number of configs is: ", configs.length)
    }
  
    // should support adding multiple config's plugin sections, currently does the first
    entryPoints.pluginsSection = configs[0].properties.filter(element => element.key.name === "plugins")[0]
  
    entryPoints.optimizationSection = configs[0].properties.filter(element => element.key.name === "optimization")[0]

    return { entryPoints, ast}
  },

  updateConfig: function () {

    // Use astring.generate to convert config ast back to a JavaScript file
    // console.log("   Showing entrypoints all")
    // console.log(entryPoints)
    // console.log("====================")
    let formattedCode = generate(entryPoints.all, {
      comments: true,
    })


    // console.log(formattedCode)
    // console.log("====================")

    // pretty up the formatted code
    formattedCode = formattedCode
    .replace("/[{/g", "}\n]")
    .replace(/\nmodule.exports/,"\n\nmodule.exports")
    .replace(/(\nconst.+new)/g, "\n$&")

    formattedCode = prettier.format(formattedCode, { semi: false, parser: "babylon" });

    this.updatedConfig = formattedCode

    console.log("updating config")
    console.log(this.updatedConfig)

    return this.updatedConfig;
  },

  saveConfig: function () {
    console.log("doing save config")
    let archiveName: string = this.configFile.split(".js")[0] + ".123" + ".js"

    fs.rename(this.directory + this.configFile, this.directory + archiveName, (err) => {
      if (err) throw err;
    });

    fs.writeFile(this.directory + this.configFile, this.updatedConfig, (err) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log("The new file has been succesfully saved as");
      console.log(this.directory + this.configFile)
      console.log("Old file has been archived as");
      console.log(this.directory + archiveName)
    });

    this.loadStats2()

  },

  loadStats2: function () {

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

    console.log("calling runWebpack")
    let aPromise = runWebpack2("cd " + this.directory + " &&  webpack --config ./webpack.config.js --profile --json > webpack-stats.tony.json")
    .then((res)=>{
      console.log("there was a response")
      isStatsUpdated()
      // go display webpack stats
    })
    .catch((err) => {
      console.log("there was an error")
      console.log(err)
    })

    function isStatsUpdated () {
      console.log("isStatsUpdated?")
      fs.readFile("c:/sandbox/simple_webpack_boilerplate/webpack-stats.tony.json", (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log((data.toString()));
      });
    }
  },

  loadPlugin: function (name) {

    let pluginFileName = ""
    if (name === "Moment") {
      console.log("doing Moment")
      pluginFileName = "momentIgnorePluginConfig.js"

    } else if (name === "SplitChunks") {
      console.log("doing Split Chunks")
      pluginFileName = "splitChunksPluginConfig.js"

    } else if (name === "mini") {
      console.log("not doing Mini")
      return
    } 
    fs.readFile(__dirname + '/../src/plugins/' + pluginFileName, (err, data) => {
      if (err) return console.log(err)
      this.parsePlugin(data.toString()) 
      // console.dir("^^^^^^^^^^^^^^^console.dir^^^^^^^")
      // console.dir(JSON.stringify (entryPoints.all, null, 2))
      return { entryPoints: pluginEntryPoints}

    });
  },

  parsePlugin: function (entry: string) {
    console.log("Doing parsePlugin. Converts plugin into AST")

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
    let moduleExports: any

    // loop through ast looking for module.exports
    while (i >= 0) {
      let candidate = ast.body[i].expression
      if (
        candidate.left.object && candidate.left.object.name === "module" &&
        candidate.left.property && candidate.left.property.name === "exports"
      ) {
        moduleExports = candidate.right
        break
      }
      i--
    }
  
    if (moduleExports.type === "ObjectExpression") {
      pluginEntryPoints.moduleExports.push(moduleExports)
      configs.push(moduleExports)
    }
  
    pluginEntryPoints.pluginsSection = configs[0].properties.filter(element => element.key.name === "plugins")[0]
  
    pluginEntryPoints.optimizationSection = configs[0].properties.filter(element => element.key.name === "optimization")[0]

    this.mergePlugin()
    
    return { entryPoints: pluginEntryPoints, ast}

  },


  definePlugins: function (plugins: Array<AvailablePlugin>) { // array of plugins
    this.plugins = plugins
  },

  showPlugins: function () {
    return this.plugins
  },

  mergePlugin: function () {
    console.log("going to do the merge %%%%%%%%%%%%%%%%%%%%")

    console.log("add variable declarations - 'require' statements")
    // Add any variable declarations to the top of config
    if (pluginEntryPoints.body[0].type === "VariableDeclaration") {
      entryPoints.body.unshift(pluginEntryPoints.body[0])  // should check to see if already exists 
                                                           // and do all variable definitions. currently doing one.
    }
  
    console.log("add plugins")
    // Add any plugins to the plugins section of the config
    if (pluginEntryPoints.pluginsSection && pluginEntryPoints.pluginsSection.value.elements.length !== 0) {
      // check to see if plugins section of config exists and add if needed
      if( ! entryPoints.pluginsSection ) this.addPluginsSection(entryPoints.all)
      pluginEntryPoints.pluginsSection.value.elements.forEach( element => {
        entryPoints.pluginsSection.value.elements
        .push(JSON.parse(JSON.stringify(element)))
      })
    }

    console.log("add optimizations")
    // Add any optimizations to the optimizations section of the config
    if(pluginEntryPoints.optimizationSection && pluginEntryPoints.optimizationSection.value.properties.length !== 0) {
      // check to see if optimization section of config exists and add if needed
      if( ! entryPoints.optimizationSection ) this.addOptimizationSection(entryPoints.all)
      pluginEntryPoints.optimizationSection.value.properties.forEach( element => {
        entryPoints.optimizationSection.value.properties
        .push(JSON.parse(JSON.stringify(element)))
      })
    }

    this.updateConfig()
  },
  
  addOptimizationSection: function(ast) {
    entryPoints.moduleExports[0].properties.push(
      {
        "type": "Property",
        "method": false,
        "shorthand": false,
        "computed": false,
        "loc": null,
        "key": {
          "type": "Identifier",
          "name": "optimization"
        },
        "value": {
          "type": "ObjectExpression",
          "properties": [
          ]
        },
        "kind": "init"
      }
    ) 

    entryPoints.optimizationSection = entryPoints.moduleExports[0].properties.filter(element => element.key.name === "optimization")[0]
  },
  
  addPluginsSection: function(ast) {
    entryPoints.moduleExports[0].properties.push(
      {
        "type": "Property",
        "method": false,
        "shorthand": false,
        "computed": false,
        "key": {
          "type": "Identifier",
          "name": "plugins"
        },
        "value": {
          "type": "ArrayExpression",
          "elements": []
        },
        "kind": "init"
      }
    ) 

    entryPoints.pluginsSection = entryPoints.moduleExports[0].properties.filter(element => element.key.name === "plugins")[0]
  },
}

export default parseHandler