import { observable, action } from 'mobx';
import { initializeInstance } from 'mobx/lib/internal';

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
	totalAssets: number,
	totalChunks: number,
	setIsLoadingTrue(): void,
	setRootSelected(): void,
	initialBuildSize: number,
	setInitialBuildSize(input: number): void,
	isSunburstDisplayed: boolean,
	isSunburstZoomDisplayed: boolean,
	isTreemapDisplayed: boolean,
	isTreemapZoomDisplayed: boolean,
	isChartNavDisplayed: boolean,
	isPackageSelected: boolean,
	isHomeSelected: boolean,
	isTabTwoSelected: boolean,
	isTabThreeSelected: boolean,
	listOfConfigs: Array<string>,
	setChartNavClassOn(): void,
	setChartNavClassOff(): void,
	setUpdateCards(a: any, b: any, c: any, d: any): void,
	setNewTotalSize(newSize: number): void,
	newTotalSize: number,
	setDisplaySunburst(): void,
	setDisplaySunburstZoom(): void,
	setDisplayTreemap(): void,
	setDisplayTreemapZoom(): void,
	isConfigSelectionDisplayed: boolean,
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
	setDisplayPluginsTabTrue(): void,
	setDisplayStatsFileGeneratedTrue(): void,
	setWereChartsEverDrawn(): void,
	setIsNewConfigGenerated(): void,
	isSunburstSelected: boolean,
	isSunburstZoomSelected: boolean,
	isTreemapSelected: boolean,
	isTreemapZoomSelected: boolean,
	isChartCardDisplayed: boolean,
	isWelcomeCardDisplayed: boolean,
	isWelcomeCardBottomDisplayed: boolean,
	beforeTotalSize: number,
	afterTotalSize: number,
	totalSize: number,
	chunks: number,
	modules: number,
	assets: number,
	isSelectJsonDisplayed: boolean,
	isLoadStatsDisplayed: boolean,
	isPluginsTabDisplayed: boolean,
	isStatsFileGenerated: boolean,
	isOptimizationSelected: boolean,
	wereChartsEverDrawn: boolean,
	isRootSelected: boolean,
	isPreviewSelected: boolean,
	isCustomConfigSaved: boolean,
	isNewConfigGenerated: boolean,
	setCustomConfigSavedTrue(): void,
	setIsBuildOptimized(): void,
	isBuildOptimized: boolean,
	setIsNewBuildSizeCalculated(): void,
	isNewBuildSizeCalculated: boolean,
	setNewConfigDisplayCode(data: string): void,
	newConfigDisplayCode: string,
	setOriginalStatsIsGenerated(): void,
	isOriginalStatsGenerated: boolean,
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
	isSunburstDisplayed = true;

	@observable
	isSunburstZoomDisplayed = false;

	@observable
	isTreemapDisplayed = false;

	@observable
	isTreemapZoomDisplayed = false;

	@observable
	isConfigSelectionDisplayed = false;

	@observable
	data_array = [['']];

	@observable
	beforeRoot = {};

	@observable
	isPackageSelected = false;

	@observable
	isChartNavDisplayed = true;

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
	isChartCardDisplayed = false;

	@observable
	isWelcomeCardDisplayed = true;

	@observable
	isWelcomeCardBottomDisplayed = true;

	@observable
	beforeTotalSize = 1334337;

	@observable
	afterTotalSize = 999999;

	@observable
	initialBuildSize = 0;

	@observable
	totalSize = 1334337;

	@observable
	chunks = 1;

	@observable
	modules = 161;

	@observable
	assets = 2;

	@observable
	isSelectJsonDisplayed = false;

	@observable
	isLoadStatsDisplayed = true;

	@observable
	isPluginsTabDisplayed = false;

	@observable
	isStatsFileGenerated = false;

	@observable
	isOptimizationSelected = false;

	@observable
	wereChartsEverDrawn = false;

	@observable
	isRootSelected = false;

	@observable
	isPreviewSelected = false;

	@observable
	isCustomConfigSaved = false;

	@observable
	isNewConfigGenerated = false;

	@observable
	totalSizeTemp = '';

	@observable
	totalNodeCount = 0;

	@observable
	totalAssets = 0;

	@observable
	totalChunks = 0;

	@observable
	isBuildOptimized = false;

	@observable
	isNewBuildSizeCalculated = false;

	@observable
	newTotalSize = 0;

	@observable
	newConfigDisplayCode = '';

	@observable
	isOriginalStatsGenerated = false;

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
		this.isSelectJsonDisplayed = false;
	}

	@action.bound
	setInitialBuildSize(input: number) {
		this.initialBuildSize = input;
	}

	@action.bound
	setBeforeRoot(root: any) {
		this.beforeRoot = root;
	}

	@action.bound
	setChartNavClassOn() {
		this.isChartNavDisplayed = true;
	}

	@action.bound
	setChartNavClassOff() {
		this.isChartNavDisplayed = false;
	}

	@action.bound
	setWereChartsEverDrawn() {
		this.wereChartsEverDrawn = true;
	}

	@action.bound
	setIsNewConfigGenerated() {
		this.isNewConfigGenerated = true;
	}

	@action.bound
	setDisplaySunburst() {
		this.isSunburstDisplayed = true;
		this.isSunburstZoomDisplayed = false;
		this.isTreemapDisplayed = false;
		this.isTreemapZoomDisplayed = false;

		this.isChartCardDisplayed = true;
		this.isWelcomeCardDisplayed = false;
		this.isWelcomeCardBottomDisplayed = false;
		this.isSunburstSelected = true;
		this.isSunburstZoomSelected = false;
		this.isTreemapSelected = false;
		this.isTreemapZoomSelected = false;
	}

	@action.bound
	setDisplaySunburstZoom() {
		this.isSunburstDisplayed = false;
		this.isSunburstZoomDisplayed = true;
		this.isTreemapDisplayed = false;
		this.isTreemapZoomDisplayed = false;
		this.isChartCardDisplayed = true;

		this.isSunburstSelected = false;
		this.isSunburstZoomSelected = true;
		this.isTreemapSelected = false;
		this.isTreemapZoomSelected = false;
	}

	@action.bound
	setDisplayTreemap() {
		this.isSunburstDisplayed = false;
		this.isSunburstZoomDisplayed = false;
		this.isTreemapDisplayed = true;
		this.isTreemapZoomDisplayed = false;
		this.isChartCardDisplayed = true;

		this.isSunburstSelected = false;
		this.isSunburstZoomSelected = false;
		this.isTreemapSelected = true;
		this.isTreemapZoomSelected = false;
	}

	@action.bound
	setDisplayTreemapZoom() {
		this.isSunburstDisplayed = false;
		this.isSunburstZoomDisplayed = false;
		this.isTreemapDisplayed = false;
		this.isTreemapZoomDisplayed = true;
		this.isChartCardDisplayed = true;

		this.isSunburstSelected = false;
		this.isSunburstZoomSelected = false;
		this.isTreemapSelected = false;
		this.isTreemapZoomSelected = true;
	}

	@action.bound
	setDisplayConfigSelectionTrue() {
		this.isConfigSelectionDisplayed = true;
	}

	@action.bound
	setDisplayConfigSelectionFalse() {
		this.isConfigSelectionDisplayed = false;
	}

	@action.bound
	setListOfConfigs(listOfConfigs) {
		this.listOfConfigs = listOfConfigs;
	}

	@action.bound
	setLoadStatsFalse() {
		this.isLoadStatsDisplayed = false;
	}

	@action.bound
	setDisplayPluginsTabTrue() {
		this.isPluginsTabDisplayed = true;
	}

	@action.bound
	setDisplayStatsFileGeneratedTrue() {
		this.isStatsFileGenerated = true;
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
	setRootSelected() {
		this.isRootSelected = true;
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
		this.isCustomConfigSaved = true;
	}

	@action.bound
	setUpdateCards(a: string, b: number, c: number, d: number) {
		this.totalSizeTemp = a;
		this.totalNodeCount = b;
		this.totalAssets = c;
		this.totalChunks = d;
	}

	@action.bound
	setIsBuildOptimized() {
		this.isBuildOptimized = true;
	}

	@action.bound
	setIsNewBuildSizeCalculated() {
		this.isNewBuildSizeCalculated = true;
	}

	@action.bound
	setNewTotalSize(newSize: number) {
		this.newTotalSize = newSize;
	}

	@action.bound
	setNewConfigDisplayCode(data: string) {
		this.newConfigDisplayCode = data;
	}

	@action.bound
	setOriginalStatsIsGenerated() {
		this.isOriginalStatsGenerated = true;
	}
}
