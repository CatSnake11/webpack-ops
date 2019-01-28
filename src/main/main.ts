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
// import { observe } from 'mobx';
import Store from '../renderer/store';
// import * as store from '../renderer/store';

//isPackageSelected 1015

/* test of reducing Moment library size */
import * as moment from 'moment';

// type Props = {
//   store?: StoreType
// }


let now = moment().format('LLLL');
console.log("This is a momentous time")
console.log(now)

const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

let generate1 = async function generateStats() {
  const stats = await exec("rimraf dist && webpack --watch --config ./webpack.dev.js --progress --colors --profile --json > webpack-stats.json")
  return { stats }
};

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 920,
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
  // mainWindow.webContents.openDevTools();

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
ipcMain.on('saveCustomConfig', (event: any, rootDirectoryCustomConfig: string) => {


  fs.writeFile(rootDirectoryCustomConfig + '/webpack.config.js', formattedCode1ToSave, (err) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log("The new file has been succesfully saved as");

  });
})


ipcMain.on('selectCustomWebConfig', (event: any, arg: any) => {
  let customDirectory: string = dialog.showOpenDialog({ properties: ['openDirectory'] })[0]
  mainWindow.webContents.send('customRootDirectrySet', customDirectory)
});

let customAST: any = {};
let ReactAST: any = {};
let CSSAST: any = {};
let SassAST: any = {};
let LessAST: any = {};
let stylusAST: any = {};
let svgAST: any = {};
let pngAST: any = {};
let moduleExist: boolean = false;
let numberOfRules: number = 0;
let typescriptSelected: boolean = false;
let formattedCode1ToSave = '';


ipcMain.on('CustomAST', (event: any, arg: any) => {
  fs.readFile(__dirname + '/../src/src_custom_config/webpack.config.js', (err, data) => {
    if (err) return console.log(err);
    const astCustomConfig = acorn.parse(data.toString(), {
      ecmaVersion: 6,
      locations: true,
      // onComment: comments,
    });
    customAST = astCustomConfig;
    const formattedCode1 = generate(customAST, {
      comments: true,
    })
    console.log(formattedCode1)
    console.log(typeof formattedCode1)
    formattedCode1ToSave = formattedCode1


    mainWindow.webContents.send('transferCustomAST', formattedCode1)
  });
})

ipcMain.on('addReactToAST', (event: any, arg: any) => {
  fs.readFile(__dirname + '/../src/src_custom_config/React.config.js', (err, data) => {
    if (err) return console.log(err);
    ReactAST = acorn.parse(data.toString(), {
      ecmaVersion: 6,
      locations: true,
      // onComment: comments,
    });
    console.log('react')
    console.log('read' + JSON.stringify(ReactAST.body[0].expression.right.properties))
    // module: ReactAST.body[0].expression.right.properties[0]
    // resolve: ReactAST.body[0].expression.right.properties[0]
    // devServer: ReactAST.body[0].expression.right.properties[0]
    console.log('AST')
    let customASTPropertyKey: string[] = []
    let ReactASTPropertyKey: string[] = ["module", "resolve", "devServer"]
    //customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el) =>{
    //  customASTPropertyKey.push(el.key.name)

    //})
    //console.log(customASTPropertyKey);

    if (numberOfRules === 0) {
      customAST.body[customAST.body.length - 1].expression.right.properties.push(ReactAST.body[0].expression.right.properties[0])
      moduleExist = true;
      numberOfRules += 1;
    } else {
      console.log('hi1')
      customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el, i) => {
        if (el.key.name === "module") {
          console.log('hi2')
          let moduleArr = el.value.properties
          console.log('hi3')

          moduleArr.forEach((moduleEl) => {
            if (moduleEl.key.name === "rules") {
              console.log('here')
              console.log(JSON.stringify(moduleEl.value.elements))
              console.log(JSON.stringify(ReactAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0]))

              moduleEl.value.elements.unshift(ReactAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0])
              console.log(JSON.stringify(moduleEl.value.elements))
            }
          })
        }
      })
      moduleExist = true;
      numberOfRules += 1;
    }

    if (customASTPropertyKey.indexOf("resolve") === -1) {
      customAST.body[customAST.body.length - 1].expression.right.properties.push(ReactAST.body[0].expression.right.properties[1])
    }

    if (customASTPropertyKey.indexOf("devServer") === -1) {
      customAST.body[customAST.body.length - 1].expression.right.properties.push(ReactAST.body[0].expression.right.properties[2])
    }

    console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))
    const formattedCode1 = generate(customAST, {
      comments: true,
    })
    console.log(formattedCode1)
    formattedCode1ToSave = formattedCode1
    mainWindow.webContents.send('transferCustomAST', formattedCode1)
  })
})

ipcMain.on('removeReactToAST', (event: any, arg: any) => {
  console.log(moduleExist)
  console.log(numberOfRules)

  let module_index = 0;
  let resolve_index = 0;
  let devServer_index = 0;
  for (let i = 0; i < customAST.body[customAST.body.length - 1].expression.right.properties.length; i += 1) {
    if (customAST.body[customAST.body.length - 1].expression.right.properties[i].key.name === "module") module_index = i
  }
  console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

  if (numberOfRules === 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('just than 1')

    customAST.body[customAST.body.length - 1].expression.right.properties.splice(module_index, 1)
    numberOfRules -= 1;
  } else if (numberOfRules > 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('more than 1')
    for (let j = 0; j < customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.length; j += 1) {
      console.log(typeof customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw)
      if (customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw.includes("js|jsx")) {
        //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0]))
        customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.splice(j, 1)
        numberOfRules -= 1;
      }
    }
  }

  for (let i = 0; i < customAST.body[customAST.body.length - 1].expression.right.properties.length; i += 1) {
    if (customAST.body[customAST.body.length - 1].expression.right.properties[i].key.name === "resolve") { console.log('hi'); resolve_index = i }
  }
  if (!typescriptSelected) {
    customAST.body[customAST.body.length - 1].expression.right.properties.splice(resolve_index, 1)
  } //insert logic to remove typescript

  for (let i = 0; i < customAST.body[customAST.body.length - 1].expression.right.properties.length; i += 1) {
    if (customAST.body[customAST.body.length - 1].expression.right.properties[i].key.name === "devServer") devServer_index = i
  }

  customAST.body[customAST.body.length - 1].expression.right.properties.splice(devServer_index, 1)
  const formattedCode1 = generate(customAST, {
    comments: true,
  })
  formattedCode1ToSave = formattedCode1

  console.log(formattedCode1)
  mainWindow.webContents.send('transferCustomAST', formattedCode1)

})

ipcMain.on('addCSSToAST', (event: any, arg: any) => {
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
    customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el) => {
      customASTPropertyKey.push(el.key.name)

    })
    console.log(customASTPropertyKey);
    //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

    if (customASTPropertyKey.indexOf(CSSAST.body[0].expression.right.properties[0].key.name) === -1) {
      console.log('hi2')
      customAST.body[customAST.body.length - 1].expression.right.properties.push(CSSAST.body[0].expression.right.properties[0])
      moduleExist = true;
      numberOfRules += 1;
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
      moduleExist = true;
      numberOfRules += 1;
    }

    console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))
    const formattedCode1 = generate(customAST, {
      comments: true,
    })
    formattedCode1ToSave = formattedCode1
    console.log(formattedCode1)
    mainWindow.webContents.send('transferCustomAST', formattedCode1)
  })
})

ipcMain.on('removeCSSToAST', (event: any, arg: any) => {
  console.log(moduleExist)
  console.log(numberOfRules)

  let module_index = 0;
  for (let i = 0; i < customAST.body[customAST.body.length - 1].expression.right.properties.length; i += 1) {
    if (customAST.body[customAST.body.length - 1].expression.right.properties[i].key.name === "module") module_index = i
  }
  console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

  if (numberOfRules === 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('just than 1')

    customAST.body[customAST.body.length - 1].expression.right.properties.splice(module_index, 1)
    numberOfRules -= 1;
  } else if (numberOfRules > 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('more than 1')
    for (let j = 0; j < customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.length; j += 1) {
      console.log(typeof customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw)
      if (customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw.includes(".css")) {
        //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0]))
        customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.splice(j, 1)
        numberOfRules -= 1;
      }
    }
  }
  const formattedCode1 = generate(customAST, {
    comments: true,
  })
  formattedCode1ToSave = formattedCode1
  console.log(formattedCode1)
  mainWindow.webContents.send('transferCustomAST', formattedCode1)

})

ipcMain.on('addSassToAST', (event: any, arg: any) => {
  console.log('hi')

  fs.readFile(__dirname + '/../src/src_custom_config/Sass.config.js', (err, data) => {
    if (err) return console.log(err);
    console.log('hi')
    SassAST = acorn.parse(data.toString(), {
      ecmaVersion: 6,
      locations: true,
      // onComment: comments,
    });
    console.log('Sass')
    console.log('read' + JSON.stringify(SassAST.body[0].expression.right.properties[0]))
    console.log('AST')
    let customASTPropertyKey: string[] = []
    customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el) => {
      customASTPropertyKey.push(el.key.name)
    })
    console.log(customASTPropertyKey);
    //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

    if (customASTPropertyKey.indexOf(SassAST.body[0].expression.right.properties[0].key.name) === -1) {
      moduleExist = true;
      numberOfRules += 1;
      console.log('hi2')
      customAST.body[customAST.body.length - 1].expression.right.properties.push(SassAST.body[0].expression.right.properties[0])
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
              console.log(JSON.stringify(SassAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0]))
              moduleEl.value.elements.push(SassAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0])
            }
          })
        }
      })
      moduleExist = true;
      numberOfRules += 1;
    }

    console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))
    const formattedCode1 = generate(customAST, {
      comments: true,
    })
    formattedCode1ToSave = formattedCode1
    console.log(formattedCode1)
    mainWindow.webContents.send('transferCustomAST', formattedCode1)
  })
})

ipcMain.on('removeSassToAST', (event: any, arg: any) => {
  let module_index = 0;
  for (let i = 0; i < customAST.body[customAST.body.length - 1].expression.right.properties.length; i += 1) {
    if (customAST.body[customAST.body.length - 1].expression.right.properties[i].key.name === "module") module_index = i
  }
  console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

  if (numberOfRules === 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('just than 1')

    customAST.body[customAST.body.length - 1].expression.right.properties.splice(module_index, 1)
    numberOfRules -= 1;
  } else if (numberOfRules > 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('more than 1')
    for (let j = 0; j < customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.length; j += 1) {
      console.log(typeof customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw)
      if (customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw.includes(".scss")) {
        //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0]))
        customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.splice(j, 1)
        numberOfRules -= 1;
      }
    }
  }
  const formattedCode1 = generate(customAST, {
    comments: true,
  })
  formattedCode1ToSave = formattedCode1
  console.log(formattedCode1)
  mainWindow.webContents.send('transferCustomAST', formattedCode1)
})



ipcMain.on('addLessToAST', (event: any, arg: any) => {
  console.log('hi')

  fs.readFile(__dirname + '/../src/src_custom_config/Less.config.js', (err, data) => {
    if (err) return console.log(err);
    console.log('hi')
    LessAST = acorn.parse(data.toString(), {
      ecmaVersion: 6,
      locations: true,
      // onComment: comments,
    });
    console.log('Less')
    console.log('read' + JSON.stringify(LessAST.body[0].expression.right.properties[0]))
    console.log('AST')
    let customASTPropertyKey: string[] = []
    customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el) => {
      customASTPropertyKey.push(el.key.name)
    })
    console.log(customASTPropertyKey);
    //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

    if (customASTPropertyKey.indexOf(LessAST.body[0].expression.right.properties[0].key.name) === -1) {
      moduleExist = true;
      numberOfRules += 1;
      console.log('hi2')
      customAST.body[customAST.body.length - 1].expression.right.properties.push(LessAST.body[0].expression.right.properties[0])
    } else {
      console.log('hi1')
      let customASTModulePropertyKey: string[] = [];
      customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el) => {
        if (el.key.name === "module") {
          let moduleArr = el.value.properties;
          moduleArr.forEach((moduleEl) => {
            if (moduleEl.key.name === "rules") {
              console.log('here')
              console.log(JSON.stringify(moduleEl.value.elements))
              console.log(JSON.stringify(LessAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0]))
              moduleEl.value.elements.push(LessAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0])
            }
          })
        }
      })
      moduleExist = true;
      numberOfRules += 1;
    }

    console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))
    const formattedCode1 = generate(customAST, {
      comments: true,
    })
    formattedCode1ToSave = formattedCode1
    console.log(formattedCode1)
    mainWindow.webContents.send('transferCustomAST', formattedCode1)
  })
})

ipcMain.on('removeLessToAST', (event: any, arg: any) => {
  let module_index = 0;
  for (let i = 0; i < customAST.body[customAST.body.length - 1].expression.right.properties.length; i += 1) {
    if (customAST.body[customAST.body.length - 1].expression.right.properties[i].key.name === "module") module_index = i
  }
  console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

  if (numberOfRules === 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('just than 1')

    customAST.body[customAST.body.length - 1].expression.right.properties.splice(module_index, 1)
    numberOfRules -= 1;
  } else if (numberOfRules > 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('more than 1')
    for (let j = 0; j < customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.length; j += 1) {
      console.log(typeof customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw)
      if (customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw.includes(".less")) {
        //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0]))
        customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.splice(j, 1)
        numberOfRules -= 1;
      }
    }
  }

  const formattedCode1 = generate(customAST, {
    comments: true,
  })
  formattedCode1ToSave = formattedCode1

  console.log(formattedCode1)
  mainWindow.webContents.send('transferCustomAST', formattedCode1)
})

ipcMain.on('addStylusToAST', (event: any, arg: any) => {
  console.log('hi')

  fs.readFile(__dirname + '/../src/src_custom_config/stylus.config.js', (err, data) => {
    if (err) return console.log(err);
    console.log('hi')
    stylusAST = acorn.parse(data.toString(), {
      ecmaVersion: 6,
      locations: true,
      // onComment: comments,
    });
    console.log('Stylus')
    console.log('read' + JSON.stringify(stylusAST.body[0].expression.right.properties[0]))
    console.log('AST')
    let customASTPropertyKey: string[] = []
    customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el) => {
      customASTPropertyKey.push(el.key.name)
    })
    console.log(customASTPropertyKey);
    //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

    if (customASTPropertyKey.indexOf(stylusAST.body[0].expression.right.properties[0].key.name) === -1) {
      moduleExist = true;
      numberOfRules += 1;
      console.log('hi2')
      customAST.body[customAST.body.length - 1].expression.right.properties.push(stylusAST.body[0].expression.right.properties[0])
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
              console.log(JSON.stringify(stylusAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0]))
              moduleEl.value.elements.push(stylusAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0])
            }
          })
        }
      })
      moduleExist = true;
      numberOfRules += 1;
    }

    console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))
    const formattedCode1 = generate(customAST, {
      comments: true,
    })
    formattedCode1ToSave = formattedCode1

    console.log(formattedCode1)
    mainWindow.webContents.send('transferCustomAST', formattedCode1)
  })
})

ipcMain.on('removeStylusToAST', (event: any, arg: any) => {
  let module_index = 0;
  for (let i = 0; i < customAST.body[customAST.body.length - 1].expression.right.properties.length; i += 1) {
    if (customAST.body[customAST.body.length - 1].expression.right.properties[i].key.name === "module") module_index = i
  }
  console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

  if (numberOfRules === 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('just than 1')

    customAST.body[customAST.body.length - 1].expression.right.properties.splice(module_index, 1)
    numberOfRules -= 1;
  } else if (numberOfRules > 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    for (let j = 0; j < customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.length; j += 1) {
      if (customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw.includes(".styl")) {
        //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0]))
        customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.splice(j, 1)
        numberOfRules -= 1;
      }
    }
  }
  const formattedCode1 = generate(customAST, {
    comments: true,
  })
  formattedCode1ToSave = formattedCode1

  console.log(formattedCode1)
  mainWindow.webContents.send('transferCustomAST', formattedCode1)
})

ipcMain.on('addSVGToAST', (event: any, arg: any) => {
  console.log('hi')

  fs.readFile(__dirname + '/../src/src_custom_config/svg.config.js', (err, data) => {
    if (err) return console.log(err);
    console.log('hi')
    svgAST = acorn.parse(data.toString(), {
      ecmaVersion: 6,
      locations: true,
      // onComment: comments,
    });
    console.log('SVG')
    console.log('read' + JSON.stringify(svgAST.body[0].expression.right.properties[0]))
    console.log('AST')
    let customASTPropertyKey: string[] = []
    customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el) => {
      customASTPropertyKey.push(el.key.name)
    })
    console.log(customASTPropertyKey);
    //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

    if (customASTPropertyKey.indexOf(svgAST.body[0].expression.right.properties[0].key.name) === -1) {
      moduleExist = true;
      numberOfRules += 1;
      console.log('hi2')
      customAST.body[customAST.body.length - 1].expression.right.properties.push(svgAST.body[0].expression.right.properties[0])
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
              console.log(JSON.stringify(svgAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0]))
              moduleEl.value.elements.push(svgAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0])
            }
          })
        }
      })
      moduleExist = true;
      numberOfRules += 1;
    }

    console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))
    const formattedCode1 = generate(customAST, {
      comments: true,
    })
    console.log(formattedCode1)
    formattedCode1ToSave = formattedCode1

    mainWindow.webContents.send('transferCustomAST', formattedCode1)
  })
})

ipcMain.on('removeSVGToAST', (event: any, arg: any) => {
  let module_index = 0;
  for (let i = 0; i < customAST.body[customAST.body.length - 1].expression.right.properties.length; i += 1) {
    if (customAST.body[customAST.body.length - 1].expression.right.properties[i].key.name === "module") module_index = i
  }
  console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

  if (numberOfRules === 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('just than 1')

    customAST.body[customAST.body.length - 1].expression.right.properties.splice(module_index, 1)
    numberOfRules -= 1;
  } else if (numberOfRules > 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('more than 1')
    for (let j = 0; j < customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.length; j += 1) {
      console.log(typeof customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw)
      if (customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw.includes(".svg")) {
        //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0]))
        customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.splice(j, 1)
        numberOfRules -= 1;
      }
    }
  }
  const formattedCode1 = generate(customAST, {
    comments: true,
  })
  console.log(formattedCode1)
  formattedCode1ToSave = formattedCode1

  mainWindow.webContents.send('transferCustomAST', formattedCode1)
})

ipcMain.on('addPNGToAST', (event: any, arg: any) => {
  console.log('hi')

  fs.readFile(__dirname + '/../src/src_custom_config/png.config.js', (err, data) => {
    if (err) return console.log(err);
    console.log('hi')
    pngAST = acorn.parse(data.toString(), {
      ecmaVersion: 6,
      locations: true,
      // onComment: comments,
    });
    console.log('PNG')
    console.log('read' + JSON.stringify(pngAST.body[0].expression.right.properties[0]))
    console.log('AST')
    let customASTPropertyKey: string[] = []
    customAST.body[customAST.body.length - 1].expression.right.properties.forEach((el) => {
      customASTPropertyKey.push(el.key.name)
    })
    console.log(customASTPropertyKey);
    //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

    if (customASTPropertyKey.indexOf(pngAST.body[0].expression.right.properties[0].key.name) === -1) {
      moduleExist = true;
      numberOfRules += 1;
      console.log('hi2')
      customAST.body[customAST.body.length - 1].expression.right.properties.push(pngAST.body[0].expression.right.properties[0])
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
              console.log(JSON.stringify(pngAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0]))
              moduleEl.value.elements.push(pngAST.body[0].expression.right.properties[0].value.properties[0].value.elements[0])
            }
          })
        }
      })
      moduleExist = true;
      numberOfRules += 1;
    }

    console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))
    const formattedCode1 = generate(customAST, {
      comments: true,
    })
    console.log(formattedCode1)
    formattedCode1ToSave = formattedCode1

    mainWindow.webContents.send('transferCustomAST', formattedCode1)
  })
})

ipcMain.on('removePNGToAST', (event: any, arg: any) => {
  let module_index = 0;
  for (let i = 0; i < customAST.body[customAST.body.length - 1].expression.right.properties.length; i += 1) {
    if (customAST.body[customAST.body.length - 1].expression.right.properties[i].key.name === "module") module_index = i
  }
  console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties))

  if (numberOfRules === 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('just than 1')

    customAST.body[customAST.body.length - 1].expression.right.properties.splice(module_index, 1)
    numberOfRules -= 1;
  } else if (numberOfRules > 1 && customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties.length === 1) {
    console.log('more than 1')
    for (let j = 0; j < customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.length; j += 1) {
      console.log(typeof customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw)
      if (customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements[j].properties[0].value.raw.includes(".png")) {
        //console.log(JSON.stringify(customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0]))
        customAST.body[customAST.body.length - 1].expression.right.properties[module_index].value.properties[0].value.elements.splice(j, 1)
        numberOfRules -= 1;
      }
    }
  }
  const formattedCode1 = generate(customAST, {
    comments: true,
  })
  formattedCode1ToSave = formattedCode1

  console.log(formattedCode1)
  mainWindow.webContents.send('transferCustomAST', formattedCode1)
})

ipcMain.on('load-package.json', (event: any, arg: any) => {
  // arg unimportant. selectPackage shows file dialog
  console.log(arg) // prints "ping"
  event.sender.send('asynchronous-reply', 'pong')  // sends pong as test
  // const selected = selectPackageJson();
  // console.log('selected: ', selected);
  // if (selected === 'err') {
  //   console.log('this is error')
  //   return '';
  // }
  selectPackageJson();
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

  // if (arrPluginsChecked.indexOf('checkedMoment') > -1) {
  //   parseHandler.loadPluginMoment()
  //   // parse
  //   // merge
  // }
  // if (arrPluginsChecked.indexOf('checkedSplitChunks') > -1) {
  //   parseHandler.loadPluginSplitChunks()
  //   // parse
  //   // merge
  // }
  // if (arrPluginsChecked.indexOf('checkedSplitChunks') > -1) {
  //   parseHandler.loadPluginMini()
  //   // parse
  //   // merge
  // }
  parseHandler.initEntryPoints()

  if (arrPluginsChecked.indexOf('checkedMoment') > -1) {
    parseHandler.loadPlugin("Moment")
  }
  if (arrPluginsChecked.indexOf('checkedSplitChunks') > -1) {
    parseHandler.loadPlugin("SplitChunks")
  }
  if (arrPluginsChecked.indexOf('checkedMini') > -1) {
    parseHandler.loadPlugin("Mini")
  }

  var p1 = Promise.resolve(3);
  var p2 = 1337;
  var p3 = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("foo");
    }, 100);
  });

  Promise.all([p1, p2, p3])
    .then(values => {
      console.log(values); // [3, 1337, "foo"]

      setTimeout(() => {
        mainWindow.webContents.send('display-config', parseHandler.updatedConfig);
      }, 400);
    });

  // promisify above list
  // then run saveConfig() 

});

ipcMain.on('save-config', (event: any, configToSave: string) => {
  console.log("ON SAVE-CONFIG CALLED")
  //parseHandler.updatedConfig = configToSave
  parseHandler.saveConfig()
});


/**
 * Event handlers - file loading / parsing
 * Loading parsing of package.json file
 * Selection of webpack config
 * Loading parsing of webpack config file
 **/

// function selectPackageJson() {
//   let file = dialog.showOpenDialog({ properties: ['openFile'] })[0] || 'error';  // 'openDirectory', 'multiSelections'
//   if (file !== 'error') {
//     loadPackage(file);
//   } else {
//     return file;
//   }
//   // if (file === undefined) return;
// }

function selectPackageJson() {
  console.log("what is a dialog really?")
  let file = dialog.showOpenDialog({ properties: ['openFile'] }) // 'openDirectory', 'multiSelections'
  if (file === undefined) return false;
  // console.log("what is a file really?")
  // console.log(file)
  // console.log(file[0])
  loadPackage(file[0]);
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

// fix cancel errors
process.on('uncaughtException', function (error) {
  // Handle the error
  let err = error;
  return err;
  // console.log(error);
});

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
