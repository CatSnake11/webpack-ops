# WebpackOps


WebpackOps is a Webpack bundle visualization, optimization and customization tool that helps developers streamline the size of their webpack bundle through customized plugin selection and webpack config file generation. Webpack Ops also allows developers to visualize their bundle assets through interactive analysis charts. 

![](https://github.com/davemarquess/Webpack-Ops/blob/read-me/wpo-charts.gif)

## Installation

**1.** Clone or Download the repository.
```
git clone https://github.com/CatSnake11/Webpack-Ops.git
```

**2.** Open the repository, go to your terminal and run the following commands to download all required libraries:
```
npm install
npm run webpackops
npm start
```

Download and install WebpackOps for Mac or Windows, and launch the application

## Usage
WebpackOps has three tabs - *Home*, *Plugins*, and *Webpack Config*. Below, please find instructions on how to use each tab:

**Home**
- Select your `package.json` file by clicking the "Find Package.JSON" button and selecting your `package.json` file.
- Choose your desired build configuration and click "Select Config" button.
- If you already have an existing `stats.json` file, click "Load Stats File" button and select the `stats.json` file that was previously generated in your local repository. To generate a new `stats.json` file using your selected config, click the "Generate Stats File" button, and then load your new `stats.json` file.
- Enjoy! You can now analyze your Webpack bundle in the four charts that are provided - Sunburst, Zoomable Sunburst, Treemap, and Zoomable Treemap.

**Plugins**
- Once you have loaded your `package.json` and `stats.json` files on the *Home* tab, select the plugins you would like to install in your Webpack bundle.
- Click the "Generate Webpack Config" button, and then click the "Continue" button on the modal to generate a new "WebpackOpsAssets" folder in your project's root directory containing your new `webpack.config` and `stats.json` files. Additionally, a preview of your new `webpack.config` file with selected plugins will be displayed in the code window.
- Click the "Show Size Change" button to display a visual representation of your bundle size change.

![](https://github.com/davemarquess/Webpack-Ops/blob/read-me/wpo-optimization-plugins.gif)

**Webpack Config**
- This tab will guide you in generating a custom `webpack.config` file for your project.  First, click the "*Select*" button to select your root directory where you would like to generate your `webpack.config` file.
- Next, select the languages, libraries, and frameworks you would like to add to your new `webpack.config`. You can preview what your config will look like in the code window on the right. 
- Once you have selected all desired features, click "Create Webpack Config File" to generate a new `webpack.config` file in your root directory.

![](https://github.com/davemarquess/Webpack-Ops/blob/read-me/wpo-custom-config.gif)

## Built With
- [React](https://github.com/facebook/react)
- [Acorn](https://github.com/acornjs/acorn)
- [MobX](https://github.com/mobxjs/mobx)
- [TypeScript](https://github.com/Microsoft/TypeScript)
- [D3](https://github.com/d3/d3)
- [Jest](https://github.com/facebook/jest)

## Authors
- Hei Yeung Lam (https://github.com/heiyeunl)
- Dave Marquess (https://github.com/davemarquess)
- Tony Hudgins (https://github.com/Tonyhudgins)

## License
This project is licensed under the MIT License - see the LICENSE.md file for details