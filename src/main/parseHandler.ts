import fs from 'fs';
const acorn = require("acorn");
const astravel = require('astravel');
import { generate } from 'astring';
import { any } from 'prop-types';

/*
packageJsonHandler.selectPackageJson
directory
listOfConfigs
packageJsonHandler.selectWebpackConfig
packageJsonHandler.readConfig
packageJsonHandler.parseConfig
packageJsonHandler.listPlugins
packageJsonHandler.loadPlugin
packageJsonHandler.parsePlugin

*/

interface ParseHandler {
  directory: string,

  configFile: string, 

  plugins: Array<AvailablePlugin>,

  setWorkingDirectory: (directory: string) => void;

  getWorkingDirectory: () => string;

  parseConfig: (
    entry: string, 
    filepath: string, 
    writeFile?: boolean
  ) => { entryPoints: any, ast: any};

  saveConfig: () => void;

  definePlugins: (
    plugins: Array<AvailablePlugin>
  ) => void;

  showPlugins: () => Array<AvailablePlugin>;

  loadPlugin: () => void;

  parsePlugin: (string) => { entryPoints: any, ast: any };

  mergePlugin: () => void;
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
  pluginsEntries: any, // = entryPoints.pluginsSection.value.elements
}



const listOfConfigs = []

const entryPoints: any = {
  all: {},
  body: {},
  moduleExports: [],
  plugins: [],
  pluginsSection: any,
  pluginsEntries: any, // = entryPoints.pluginsSection.value.elements
}

const pluginEntryPoints: any = {
  all: {},
  body: {},
  moduleExports: [],
  plugins: [],
  pluginsSection: any,
  pluginsEntries: any, // = entryPoints.pluginsSection.value.elements
}

const parseHandler: ParseHandler = {
  directory: "test directory name",  // directory for client files

  configFile: "", // webpack config name

  plugins: [],

  setWorkingDirectory: function (directory: string) {
    this.directory = directory
  },

  getWorkingDirectory: function () {
    return this.directory
  },

  parseConfig: function (entry: string, filepath: string, writeFile: boolean = false) {
    console.log("doing parseConfig converts to AST")
    
    let splitPoint: number = filepath.includes("/") ? 
      filepath.lastIndexOf("/") : 
      filepath.lastIndexOf("\\");

    this.directory = filepath.substring(0,splitPoint + 1);
    console.log("filepath is set to", filepath)
    console.log("this.directory is set to", this.directory)

    this.configFile = filepath.substring(splitPoint + 1);

    // Parse it into an AST and retrieve the list of comments
    const comments: Array<string> = []
    var ast = acorn.parse(entry, {
      ecmaVersion: 6,
      locations: true,
      onComment: comments,
    })
  
    // Attach comments to AST nodes
    astravel.attachComments(ast, comments)
    console.log("AST with comments added in")
    //console.log(JSON.stringify(ast, null, 2))  
    console.log("==============================")
    // writing ast to disk for testing purposes
    if (writeFile) {
      fs.writeFile(this.directory + "config.ast.json", JSON.stringify(ast, null, 2), (err) => {
        console.log("The ast file has been succesfully saved");
      });  
    }
  
    entryPoints.all = ast;
    entryPoints.body = ast.body;
    
    let i = ast.body.length - 1 // checking for module.exports from the end. Should be the last node.
    let configs: any = []
    let moduleExports: any
    while (i) {
      console.log("looping through looking for modules", i)
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

    console.log(moduleExports)
  
    // If the last element is module.exports, which it should be, 
    // if it's an Object we have found the config object. 
    // If it's an array, we need to find the config objects.
    
    if (moduleExports.type === "ObjectExpression") {  // we've found the single config
      console.log("we've found the single config")
      entryPoints.moduleExports.push(moduleExports)
      configs.push(moduleExports)
    } else if (moduleExports.type === "ArrayExpression") {  // there are multiple configs
      console.log("gathering multiple configs")
      let configNames = moduleExports.elements;
    
      for (let i=0; i<configNames.length; i++) {  // find configs matching names in module.exports array 
        //console.log(configNames[i].name);
        let config = entryPoints.body.filter( (d: any) => {
          return (
            d.type === "VariableDeclaration" &&
            d.declarations[0].id.name === configNames[i].name
          )
        })[0]
  //      console.log(config.right)
        configs.push(config.right)
      }
      console.log("number of configs is: ", configs.length)
    }
  
    // need to add all configs plugin sections, currently does first
    entryPoints.pluginsSection = configs[0].properties.filter(element => element.key.name === "plugins")[0]
    entryPoints.pluginsEntries = entryPoints.pluginsSection.value.elements
  
    return { entryPoints, ast}
  },

  saveConfig: function () {
    // Convert back to a JavaScript file
    const formattedCode = generate(entryPoints.all, {
      comments: true,
    })
    console.log("code coverted back into JS file:")
    console.log(formattedCode)

    let archiveName: string = this.configFile.split(".js")[0] + ".123" + ".js"

    fs.rename(this.directory + this.configFile, this.directory + archiveName, (err) => {
      if (err) throw err;
      console.log('Rename complete!');
    });

    fs.writeFile(this.directory + this.configFile, formattedCode, (err) => { 
      if (err) {
        console.log(err);
        return;
      }

      console.log("The new file has been succesfully saved as");
      console.log(this.directory + this.configFile)
      console.log("Old file has been archived as");
      console.log(this.directory + archiveName)
    });  

  }, 

  loadPlugin: function () {
    fs.readFile(__dirname + '/../src/plugins/momentIgnorePluginConfig.js', (err, data) => {
      if (err) return console.log(err);
      console.log( this.parsePlugin(data.toString()) ); 
      console.log("returned to loadPlugin") 
    });
  },

  parsePlugin: function (entry: string) {
    console.log("doing parsePlugin converts to AST")

    // Parse it into an AST and retrieve the list of comments
    // const comments: Array<string> = []
    const ast = acorn.parse(entry, {
      ecmaVersion: 6,
      locations: true,
     // onComment: comments,
    })
  
    // Attach comments to AST nodes
//    astravel.attachComments(ast, comments)

    console.log("AST of plugin")
    console.log(JSON.stringify(ast, null, 2))  
    console.log("==============================")

    pluginEntryPoints.all = ast;
    pluginEntryPoints.body = ast.body;
    
    let i = ast.body.length - 1 // checking for module.exports from the end. Should be the last node.
    let configs: any = []
    let moduleExports: any
    while (i) {
      console.log("looping through looking for modules", i)
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
  
    // If the last element is module.exports, which it should be, 
    // if it's an Object we have found the config object. 
    
    if (moduleExports.type === "ObjectExpression") {  // we've found the single config
      console.log("we've found the single config")
      pluginEntryPoints.moduleExports.push(moduleExports)
      configs.push(moduleExports)
    }
  
    // need to add all configs plugin sections, currently does first
    pluginEntryPoints.pluginsSection = configs[0].properties.filter(element => element.key.name === "plugins")[0]
    pluginEntryPoints.pluginsEntries = pluginEntryPoints.pluginsSection.value.elements
  
    console.log("about to return")

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
    console.log(pluginEntryPoints.body[0])
    entryPoints.body.unshift(pluginEntryPoints.body[0])

    console.log("config plugins is:")
    console.log(entryPoints.pluginsEntries)
    console.log("plugin plugins is:")
    console.log(pluginEntryPoints.pluginsEntries)

    entryPoints.pluginsSection.value.elements
    .push(JSON.parse(JSON.stringify(pluginEntryPoints.pluginsSection.value.elements[0])))
    this.saveConfig()
  },

}




  // load a plugin
  const plugins = [
    {
      description:"Removes includes of Moment Localization files leaving support for English.", 
      name:"Moment Ignore Locales plugin", 
      file:"momentIgnorePluginConfig.js"
    },
    {
      description:"The SplitChunks plugin facilitates breaking modules into separate or combined files.", 
      name:"Split Chunks plugin", 
      file:"splitChunksPluginConfig.js"
    }
  ]
  let plugin = plugins[0]




export default parseHandler

