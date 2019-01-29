import { observable, action } from 'mobx'

export type StoreType = {
	name: string,
	age: number,
	addAge(): void,
	resetAge(): void,
	decrementAge(): void,
	path: string,
	setPath(input: string): void,
	isLoading: boolean,
	totalSizeTemp: string,
	totalNodeCount: number,
	setIsLoadingTrue(): void,
	displaySunburst: boolean,
	displaySunburstZoom: boolean,
	displayTreemap: boolean,
	displayTreemapZoom: boolean,
	displayChartNav: boolean,
	isPackageSelected: boolean,
	isHomeSelected: boolean,
	isTabTwoSelected: boolean,
	isTabThreeSelected: boolean,
	listOfConfigs: Array<string>,
	setChartNavClassOn(): void,
	setChartNavClassOff(): void,
	setUpdateCards(a: any, b: any): void,
	setDisplaySunburst(): void,
	setDisplaySunburstZoom(): void,
	setDisplayTreemap(): void,
	setDisplayTreemapZoom(): void,
	displayConfigSelection: boolean,
	setListOfConfigs(Array): void,
	setDisplayConfigSelectionTrue(): void,
	setDisplayConfigSelectionFalse(): void,
	data_array: string[][],
	storeDataArray(data: string[][]): void,
	beforeRoot: any,
	setBeforeRoot(root: any): void,
	setIsPackageSelectedTrue(): void,
	setHomeSelected(): void,
	setTabTwoSelected(): void,
	setTabThreeSelected(): void,
	setLoadStatsFalse(): void,
	setWereChartsEverDrawn(): void,
	isSunburstSelected: boolean,
	isSunburstZoomSelected: boolean,
	isTreemapSelected: boolean,
	isTreemapZoomSelected: boolean,
	displayChartCard: boolean,
	displayWelcomeCard: boolean,
	displayWelcomeCardBottom: boolean,
	beforeTotalSize: number,
	afterTotalSize: number,
	totalSize: number,
	chunks: number,
	modules: number,
	assets: number,
	displaySelectJson: boolean,
	displayLoadStats: boolean,
	isOptimizationSelected: boolean,
	wereChartsEverDrawn: boolean,
	isRootSelected: boolean,
	isPreviewSelected: boolean,
	customConfigSaved: boolean,
	setCustomConfigSavedTrue(): void

};

export default class Store {
	@observable
	name = "ken";

	@observable
	age = 21;

	@observable
	path = "";

	@observable
	listOfConfigs = [];

	@observable
	isLoading = false;

	@observable
	displaySunburst = true;

	@observable
	displaySunburstZoom = false;

	@observable
	displayTreemap = false;

	@observable
	displayTreemapZoom = false;

	@observable
	displayConfigSelection = false;

	@observable
	data_array = [['']];

	@observable
	beforeRoot = {};

	@observable
	isPackageSelected = false;

	@observable
	displayChartNav = true;

	@observable
	isHomeSelected = true;

	@observable
	isTabTwoSelected = false;

	@observable
	isTabThreeSelected = false;

	@observable
	isSunburstSelected = false;

	@observable
	isSunburstZoomSelected = false;

	@observable
	isTreemapSelected = false;

	@observable
	isTreemapZoomSelected = false;

	@observable
	displayChartCard = false;

	@observable
	displayWelcomeCard = true;

	@observable
	displayWelcomeCardBottom = true;

	@observable
	beforeTotalSize = 1334337;

	@observable
	afterTotalSize = 999999;

	@observable
	totalSize = 1334337;

	@observable
	chunks = 1;

	@observable
	modules = 161;

	@observable
	assets = 2;

	@observable
	displaySelectJson = false;

	@observable
	displayLoadStats = true;

	@observable
	isOptimizationSelected = false;

	@observable
	wereChartsEverDrawn = false;

	@observable
	isRootSelected = false;

	@observable
	isPreviewSelected = false;

	@observable
	customConfigSaved = false;

	@observable
	totalSizeTemp = '';

	@observable
	totalNodeCount = 0;

	// ACTIONS //

	@action.bound
	addAge() {
		this.age++;
	}

	@action.bound
	decrementAge() {
		this.age--;
	}

	@action.bound
	resetAge() {
		this.age = 21;
	}

	@action.bound
	setPath(input: string) {
		this.path = input;
	}

	@action.bound
	setIsLoadingTrue() {
		this.isLoading = true;
		this.displaySelectJson = false;
	}

	@action.bound
	setBeforeRoot(root: any) {
		this.beforeRoot = root;
	}

	@action.bound
	setChartNavClassOn() {
		this.displayChartNav = true;
	}

	@action.bound
	setChartNavClassOff() {
		this.displayChartNav = false;
	}

	@action.bound
	setWereChartsEverDrawn() {
		this.wereChartsEverDrawn = true;
	}

	@action.bound
	setDisplaySunburst() {
		this.displaySunburst = true;
		this.displaySunburstZoom = false;
		this.displayTreemap = false;
		this.displayTreemapZoom = false;

		this.displayChartCard = true;
		this.displayWelcomeCard = false;
		this.displayWelcomeCardBottom = false;
		this.isSunburstSelected = true;
		this.isSunburstZoomSelected = false;
		this.isTreemapSelected = false;
		this.isTreemapZoomSelected = false;
	}

	@action.bound
	setDisplaySunburstZoom() {
		this.displaySunburst = false;
		this.displaySunburstZoom = true;
		this.displayTreemap = false;
		this.displayTreemapZoom = false;
		this.displayChartCard = true;

		this.isSunburstSelected = false;
		this.isSunburstZoomSelected = true;
		this.isTreemapSelected = false;
		this.isTreemapZoomSelected = false;
	}

	@action.bound
	setDisplayTreemap() {
		this.displaySunburst = false;
		this.displaySunburstZoom = false;
		this.displayTreemap = true;
		this.displayTreemapZoom = false;
		this.displayChartCard = true;

		this.isSunburstSelected = false;
		this.isSunburstZoomSelected = false;
		this.isTreemapSelected = true;
		this.isTreemapZoomSelected = false;
	}

	@action.bound
	setDisplayTreemapZoom() {
		this.displaySunburst = false;
		this.displaySunburstZoom = false;
		this.displayTreemap = false;
		this.displayTreemapZoom = true;
		this.displayChartCard = true;

		this.isSunburstSelected = false;
		this.isSunburstZoomSelected = false;
		this.isTreemapSelected = false;
		this.isTreemapZoomSelected = true;
	}

	@action.bound
	setListOfConfigs(listOfConfigs) {
		// console.log('listOfConfigs: ', listOfConfigs);

		this.listOfConfigs = listOfConfigs;
	}

	@action.bound
	setDisplayConfigSelectionTrue() {
		this.displayConfigSelection = true;
	}

	@action.bound
	setDisplayConfigSelectionFalse() {
		this.displayConfigSelection = false;
	}

	@action.bound
	setLoadStatsFalse() {
		this.displayLoadStats = false;
	}

	@action.bound
	storeDataArray(data: string[][]) {
		this.data_array = data;
	}

	@action.bound
	setIsPackageSelectedTrue() {
		this.isPackageSelected = true;
	}

	@action.bound
	setHomeSelected() {
		this.isHomeSelected = true;
		this.isTabTwoSelected = false;
		this.isTabThreeSelected = false;
	}

	@action.bound
	setTabTwoSelected() {
		this.isTabTwoSelected = true;
		this.isHomeSelected = false;
		this.isTabThreeSelected = false;
	}

	@action.bound
	setTabThreeSelected() {
		this.isTabThreeSelected = true;
		this.isHomeSelected = false;
		this.isTabTwoSelected = false;
	}

	@action.bound
	setCustomConfigSavedTrue() {
		this.customConfigSaved = true;
	}

	@action.bound
	setUpdateCards(a: string, b: number) {
		this.totalSizeTemp = a;
		this.totalNodeCount = b;
	}
}

