import { app, BrowserWindow, dialog } from 'electron';
import { ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import fs from 'fs';
//import installExtension, { MOBX_DEVTOOLS } from 'electron-devtools-installer';
const acorn = require("acorn");
const astravel = require('astravel');
import { generate } from 'astring';
import { any } from 'prop-types';
import parseHandler from './parseHandler';



/* test of reducing Moment library size */
import * as moment from 'moment';

let now = moment().format('LLLL');
console.log("This is a momentous time")
console.log(now)

const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

let generate1 = async function generateStats() {
  const stats = await exec("rimraf dist && webpack --watch --config ./webpack.dev.js --progress --colors --profile --json > webpack-stats.json")
  return { stats }
};


/*
installExtension(MOBX_DEVTOOLS)
  .then((name: any) => console.log(`Added Extension: ${name}`))
  .catch((err: any) => console.log(`An error occurred: `, err));
*/

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 900,
    width: 1150,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

/*********************************************
 * Event listeners from Renderer to Main
 *********************************************/

ipcMain.on('selectCustomWebConfig', (event: any, arg: any) => {
  let customDirectory: string = dialog.showOpenDialog({ properties: ['openDirectory'] })[0]
  mainWindow.webContents.send('customRootDirectrySet', customDirectory) 
})


let customAST: any = {};
let ReactAST: any = {};
let CSSAST: any = {};
let SassAST: any = {};

ipcMain.on('CustomAST', (event: any, arg: any) => {
  fs.readFile(__dirname + '/../src/src_custom_config/webpack.config.js', (err, data) => {
    if (err) return console.log(err);
    const astCustomConfig = acorn.parse(data.toString(), {
      ecmaVersion: 6,
      locations: true,
      // onComment: comments,
    });
    customAST = astCustomConfig;
    mainWindow.webContents.send('transferCustomAST', astCustomConfig) 
  });
})

ipcMain.on('addReactToAST', (event:any, arg: any) => {
  fs.readFile(__dirname + '/../src/src_custom_config/React.config.js', (err, data) => {
    if (err) return console.log(err);
    ReactAST = acorn.parse(data.toString(), {
      ecmaVersion: 6,
      locations: true,
      // onComment: comments,
    });
    console.log('react')
    console.log('read' + JSON.stringify(ReactAST.body[0].expression.right.properties))
    console.log('AST')
    let customASTPropertyKey: string[] = []
    let ReactASTPropertyKey: string[] = ["module", "resolve", "devServer"]
    customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el) =>{
      customASTPropertyKey.push(el.key.name)
 
    })
    console.log(customASTPropertyKey);
    //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))
    customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el) =>{
      if (ReactASTPropertyKey.indexOf(el.key.name) === -1) {
        customAST.body[customAST.body.length - 1].expression.right.properties.push(el)
      } else {
        if (el.key.name === "module") {
          let moduleArr = el.value.properties
            moduleArr.forEach((moduleEl) => {
              if (moduleEl.key.name === "rules") {
                console.log('here')
                console.log(JSON.stringify(moduleEl.value.elements))
                console.log(JSON.stringify(ReactAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0]))
                
                moduleEl.value.elements.push(ReactAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0])
                console.log(JSON.stringify(moduleEl.value.elements))

              }
            })
        }
      }
    })
    console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))
    const formattedCode1 = generate(customAST, {
      comments: true,
    })
    console.log(formattedCode1)
})
})

ipcMain.on('addCSSToAST', (event:any, arg: any) => {
  console.log('hi')

  fs.readFile(__dirname + '/../src/src_custom_config/CSS.config.js', (err, data) => {
    if (err) return console.log(err);
    console.log('hi')
    CSSAST = acorn.parse(data.toString(), {
      ecmaVersion: 6,
      locations: true,
      // onComment: comments,
    });
    console.log('CSS')
    console.log('read' + JSON.stringify(CSSAST.body[0].expression.right.properties[0]))
    console.log('AST')
    let customASTPropertyKey: string[] = []
    customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el) =>{
      customASTPropertyKey.push(el.key.name)
 
    })
    console.log(customASTPropertyKey);
    //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))
    
      if (customASTPropertyKey.indexOf(CSSAST.body[0].expression.right.properties[0].key.name) === -1) {
        console.log('hi2')
        customAST.body[customAST.body.length - 1].expression.right.properties.push(CSSAST.body[0].expression.right.properties[0])
      } else {
        console.log('hi1')
        let customASTModulePropertyKey: string[] = [];
        customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el) => {
          if (el.key.name === "module") {
            let moduleArr = el.value.properties
            moduleArr.forEach((moduleEl) => {
              if (moduleEl.key.name === "rules") {
                console.log('here')
                console.log(JSON.stringify(moduleEl.value.elements))
                console.log(JSON.stringify(CSSAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0]))
                moduleEl.value.elements.push(CSSAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0])
              }
            })
          }
        })
        
      }
 
    console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))
    const formattedCode1 = generate(customAST, {
      comments: true,
    })
    console.log(formattedCode1)
})
})


ipcMain.on('load-package.json', (event: any, arg: any) => {
  // arg unimportant. selectPackage shows file dialog
  console.log(arg) // prints "ping"
  event.sender.send('asynchronous-reply', 'pong')  // sends pong as test

  selectPackageJson()
})

ipcMain.on('read-config', (event: any, configNumber: any) => {
  // after package.json is loaded configs have been sent to renderer and user
  // has now selected one and we need to load
  console.log("on load-config")
  console.log("use configuration: ", configNumber)

  readConfig(configNumber)
})

ipcMain.on('load-stats.json', (event: any, arg: any) => {
  // arg unimportant. User has selected to load a stats file. selectStatsJson() will present file loading dialog
  console.log(arg) // prints "ping"
  event.sender.send('asynchronous-reply', 'pong')

  selectStatsJson()
})

ipcMain.on('install-pluggins', (event: any, arrPluginsChecked: string[]) => {
  //npm install --prefix ./install/here mini-css-extract-plugin
  console.log(arrPluginsChecked)
  var exec = require('child_process').exec;
  var child;
  /*
  if (arrPluginsChecked.indexOf('checkedMini') > -1) {
    child = exec("npm install --prefix /Users/heiyeunglam/Desktop/Project/ProductionProject/Webpack-Optimizer mini-css-extract-plugin",
      function (error: any, stdout: any, stderr: any) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    })
  }

  */

  if (arrPluginsChecked.indexOf('checkedMoment') > -1) {
    parseHandler.loadPluginMoment()
    // parse
    // merge
  }
  if (arrPluginsChecked.indexOf('checkedSplitChunks') > -1) {
    parseHandler.loadPluginSplitChunks()
    // parse
    // merge
  }
  if (arrPluginsChecked.indexOf('checkedSplitChunks') > -1) {
    parseHandler.loadPluginMini()
    // parse
    // merge
  }
});

/**
 * Event handlers - file loading / parsing
 * Loading parsing of package.json file
 * Selection of webpack config
 * Loading parsing of webpack config file
 **/

function selectPackageJson() {
  let file = dialog.showOpenDialog({ properties: ['openFile'] })[0]  // 'openDirectory', 'multiSelections'
  if (file != undefined) {
    loadPackage(file)
  }
}

let directory = ""

function loadPackage(file: string) {
  console.log("loadPackage")
  //  let lastSlash = file.match(//g)

  if (file.includes("/")) {
    directory = file.substring(0, file.lastIndexOf("/"))
  } else {
    directory = file.substring(0, file.lastIndexOf("\\"))
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      //    alert("An error ocurred updating the file" + err.message); //alert doesn't work.
      console.log(err);
      return;
    }
    selectConfig(JSON.parse(data.toString()));
  });
}

// temp store variable. This shouldn't be global, but works for the moment.
const listOfConfigs: Array<string> = [];

let entryPoints: any = {}

let ast: any = {}

function selectConfig(packageFile: any) {
  console.log("selectConfig")

  let output = "webpack configurations in package.json.\n";
  const entries = packageFile.scripts;
  //  const listOfConfigs: Array<string> = [];  // made global for inter function communication
  for (let entry in entries) {
    if (entries[entry].includes('webpack')) {
      output += `${entry} - ${entries[entry]}\n`
      listOfConfigs.push(entries[entry])
    }
  }

  console.log(output + `\n`)

  mainWindow.webContents.send('choose-config', listOfConfigs)   // react should render the list in TabTwo
}

function readConfig(entry: number) {
  console.log("readConfig")
  console.log("listOfConfigs", listOfConfigs)
  console.log("User selected entry", entry)
  console.log(`selecting ${entry ? "1st" : "second"} configuration.\n`);

  let config = "webpack.config.js";
  if (listOfConfigs[entry].includes("--config")) {
    config = listOfConfigs[entry].split("--config")[1].trimLeft().split(" ")[0]
  }

  console.log("loading webpack config", directory + "/" + config)
  fs.readFile(directory + "/" + config, (err, data) => {
    if (err) {
      console.log("An error ocurred loading: " + err.message);
      console.log(err);
      return;
    }
    const configFile: string = data.toString();
    console.log("configuration file:")
    console.log(configFile);

    //parseConfig(configFile, config)

    const tempObj = parseHandler.parseConfig(configFile, directory + "/" + config)  //configFile is the text file contents (.js) and config is the filepath
    entryPoints = tempObj.entryPoints;
    ast = tempObj.ast;

    // present user list of plugins
    // receive selected plugins
    // * load and parse plugins
    // parseHandler.loadPlugin()
    // * merge plugins - itterate
    // write the config 

  });
}
//// using AST

console.log(parseHandler.getWorkingDirectory());

parseHandler.setWorkingDirectory("new directory");



function parseConfig(entry: string, filepath: string) {  //entry is the text file contents (.js) and filepath is the filepath
  console.log("doing parseConfig")



  // Parse it into an AST and retrieve the list of comments
  const comments: Array<string> = []
  var ast = acorn.parse(entry, {
    ecmaVersion: 6,
    locations: true,
    onComment: comments,
  })
  console.log("typeof AST")
  console.log(typeof (ast))
  console.log(ast)
  console.log(JSON.stringify(ast))

  console.log("==============================")
  // writing ast to disk for testing purposes
  fs.writeFile("config.ast.json", JSON.stringify(ast, null, 2), (err) => {
    console.log("The ast file has been succesfully saved");
  });


  // Attach comments to AST nodes
  astravel.attachComments(ast, comments)
  // add back in comments
  console.log("with comments added in")
  console.log(ast.body)

  // console.log(obj.body[obj.body.length-1].expression.left.object.name)
  // console.log(obj.body[obj.body.length-1].expression.left.property.name)
  let body = ast.body;
  console.log(body[body.length - 1].expression.left.object.name)  // should be module
  console.log(body[body.length - 1].expression.left.property.name)  // should be exports

  // todo: if the last element is module.exports, which it should be, if it's an Object
  // we have found the config object. If it's an array, we need to find the config objects.

  // finding the config objects
  // is there one config?
  const moduleExports = body[body.length - 1].expression.right
  let configs = [];
  if (moduleExports.type === "ObjectExpression") {
    // we've found the single config
    configs.push(moduleExports)
  } else if (moduleExports.type === "ArrayExpression") {
    // there are multiple configs
    let configNames = moduleExports.elements;

    for (let i = 0; i < configNames.length; i++) {
      console.log(configNames[i].name);
      let config;
      try {
        config = body.filter((d: any) => {
          return (
            d.type === "VariableDeclaration" &&
            d.declarations[0].id.name === configNames[i].name
          )
        })
        console.log(config[0].right)
        configs.push(config[0].right)
      }
      catch (err) {
        console.log("not that declaration");
      }
    }
    console.log(configs.length)
  }

  // duplicate a plugins entry

  // console.log("plugins ===========================")
  // let pluginsSection = configs[0].properties.filter(element => element.key.name === "plugins")[0]
  // let pluginsEntries = pluginsSection.value.elements
  // console.log("before")
  // console.log(pluginsEntries)
  // pluginsEntries.push( JSON.parse(JSON.stringify(pluginsEntries[0])) )  // duplicating first node
  // console.log("after")
  // console.log(pluginsEntries)




  console.log(configs[0].properties.filter(element => element.key.name === "plugins")[0].value.elements)
  console.log(configs[0].properties.map(element => element.key.name === "plugins"))

  // load a plugin
  const plugins = [
    {
      description: "The SplitChunks plugin facilitates breaking modules into separate or combined files.",
      name: "Split Chunks plugin",
      file: "splitChunksPluginConfig.js"
    }
  ]
  let plugin = plugins[0]

  // Add plugins
  // List of plugins
  // Assume first plugin

  /* Untested code 

fs.readFile(__dirname + "/../src/plugins/" + plugin.file, (err, data) => { 
  if (err) {
    console.log(err);
    return;
  }
  const content: string = data.toString();
  
  // Parse it into an AST and retrieve the list of comments
  const comments: Array<string> = []
  var ast = acorn.parse(entry, {
    ecmaVersion: 6,
    locations: true,
    onComment: comments,
  })

  // Attach comments to AST nodes
  astravel.attachComments(ast, comments)
  // add back in comments

  // console.log(obj.body[obj.body.length-1].expression.left.object.name)
  // console.log(obj.body[obj.body.length-1].expression.left.property.name)
  let body = ast.body;
  console.log(body[body.length-1].expression.left.object.name)  // should be module
  console.log(body[body.length-1].expression.left.property.name)  // should be exports

});

// run plugin config through Acorn parser to make AST
// merge plugin config with selected webpack config

*/

  // Convert back to a JavaScript file
  var formattedCode = generate(ast, {
    comments: true,
  })
  console.log("code coverted back into JS file:")
  //console.log(formattedCode)
  // Check it
  //console.log(entry === formattedCode ? 'It works!' : 'Something went wrong…')

  fs.writeFile(filepath + "v200", formattedCode, (err) => {  //need to do better versioning / archiving
    if (err) {
      //    alert("An error ocurred updating the file" + err.message);
      console.log(err);
      return;
    }

    console.log("The new file has been succesfully saved");
  });

}

/**
 * Event handlers - file loading / parsing
 * Loading parsing of webpack stats file
 **/

function selectStatsJson() {
  let file = dialog.showOpenDialog({ properties: ['openFile'] })[0]
  if (file != undefined) {
    loadStats(file)
  }
}

function loadStats(file: string) {
  fs.readFile(file, (err, data) => {
    if (err) {
      //    alert("An error ocurred updating the file" + err.message); //alert doesn't work.
      console.log(err);
      return;
    }
    // clean and send back JSON stats file
    //let content = data.toString()
    let content: any = data.toString();

    //console.log(content)
    content = content.substr(content.indexOf("{"));

    //splits multiple JSON objects if more than one exists in file
    //content = content.split(/(?<=})[\n\r\s]+(?={)/)[1]  
    // content = "{" + content.split(/}[\n\r\s]+{/)[1]  
    content = content.split(/}[\n\r\s]+{/);
    // repair brackets from split

    console.log("content array length is", content.length)
    if (content.length > 1) {
      for (let i = 0; i < content.length; i++) {
        content[i] = (i > 0) ? "{" : "" + content[i] + (i < content.length - 1) ? "}" : ""
      }
    }
    console.log("Stats File")
    console.log(content[0].substring(0, 40))
    // console.log("Stats 2")
    // console.log(content[1].substring(0,40))
    // content is now an array of one or more stats json
    content = JSON.parse(content[0])
    while (!content.hasOwnProperty("builtAt")) {
      content = content.children[0]
    }
    let returnObj: any = {};
    returnObj.timeStamp = Date.now();
    returnObj.time = content.time;
    returnObj.hash = content.hash;
    returnObj.errors = content.errors
    returnObj.size = content.assets.reduce((size: number, asset: any): void => size + asset.size, 0)
    returnObj.assets = content.assets.map((asset: any) => ({
      name: asset.name,
      chunks: asset.chunks,
      size: asset.size,
    }));

    returnObj.chunks = content.chunks.map((chunk: any) => ({
      size: chunk.size,
      files: chunk.files,
      modules: chunk.modules ?
        chunk.modules.map((module: any) => ({
          name: module.name,
          size: module.size,
          id: module.id,
        }))
        : [],
    }));

    let Pdata: any = []
    Pdata.push(returnObj)
    //loops through assets
    let i = 0; // or the latest build
    let path: string;
    let sizeStr: string;
    let sunBurstData = [];


    for (var k = 0; k < Pdata[i].chunks.length; k++) {
      for (var l = 0; l < Pdata[i].chunks[k].modules.length; l++) {
        sizeStr = Pdata[i].chunks[k].modules[l].size.toString();
        path = Pdata[i].chunks[k].modules[l].name.replace("./", "");
        sunBurstData.push([path, sizeStr])
      }
    }
    const sunBurstDataSum: number = sunBurstData.reduce((sum: number, el: any): number => {
      return sum += parseInt(el[1])
    }, 0)

    console.log(sunBurstDataSum)
    //console.log(co)
    // console.log(content.substring(0, 40))
    mainWindow.webContents.send('display-stats-reply', sunBurstData)

    //mainWindow.webContents.send('display-stats-reply', JSON.parse(content))
  });
}

// function loadStats(file: string) {
//   fs.readFile(file, (err, data) => {
//     if (err) {
//       console.log(err);
//       return;
//     }

//     let content: any = data.toString();
//     content = content.substr(content.indexOf("{"));

//     //splits multiple JSON objects if more than one exists in file
//     content = content.split(/(?<=})[\n\r\s]+(?={)/)[1]
//     content = JSON.parse(content)
//     //let content1 = JSON.parse(content)
//     while (!content.hasOwnProperty("builtAt")) {
//       content = content.children[0]
//     }
//     let returnObj: any = {};
//     returnObj.timeStamp = Date.now();
//     returnObj.time = content.time;
//     returnObj.hash = content.hash;
//     returnObj.errors = content.errors
//     returnObj.size = content.assets.reduce((size: number, asset: any): void => size + asset.size, 0)
//     returnObj.assets = content.assets.map(asset => ({
//       name: asset.name,
//       chunks: asset.chunks,
//       size: asset.size,
//     }));

//     returnObj.chunks = content.chunks.map(chunk => ({
//       size: chunk.size,
//       files: chunk.files,
//       modules: chunk.modules ?
//         chunk.modules.map(module => ({
//           name: module.name,
//           size: module.size,
//           id: module.id,
//         }))
//         : [],
//     }));

//     let Pdata: any = []
//     Pdata.push(returnObj)
//     //loops through assets
//     let i = 0; // or the latest build
//     let path: string;
//     let sizeStr: string;
//     let sunBurstData = [];


//     for (var k = 0; k < Pdata[i].chunks.length; k++) {
//       for (var l = 0; l < Pdata[i].chunks[k].modules.length; l++) {
//         sizeStr = Pdata[i].chunks[k].modules[l].size.toString();
//         path = Pdata[i].chunks[k].modules[l].name.replace("./", "");
//         sunBurstData.push([path, sizeStr])
//       }
//     }
//     const sunBurstDataSum: number = sunBurstData.reduce((sum: number, el: any): number => {
//       return sum += parseInt(el[1])
//     }, 0)



//     console.log(sunBurstDataSum)
//     //console.log(co)
//     // console.log(content.substring(0, 40))
//     mainWindow.webContents.send('display-stats-reply', sunBurstData)

//     //mainWindow.webContents.send('display-stats-reply', JSON.parse(content))
//   });
// }