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
	setIsLoadingTrue(): void,
	displaySunburst: boolean,
	displaySunburstZoom: boolean,
	displayTreemap: boolean,
	displayTreemapZoom: boolean,
	displayChartNav: boolean,
	isPackageSelected: boolean,
	setChartNavClassOn(): void,
	setChartNavClassOff(): void,
	setDisplaySunburst(): void,
	setDisplaySunburstZoom(): void,
	setDisplayTreemap(): void,
	setDisplayTreemapZoom(): void,
	displayConfigSelection: boolean,
	setDisplayConfigSelectionTrue(): void,
	setDisplayConfigSelectionFalse(): void,
	data_array: string[][],
	storeDataArray(data: string[][]): void,
	beforeRoot: any,
	setBeforeRoot(root: any): void,
	setIsPackageSelectedTrue(): void,
};

export default class Store {
	@observable
	name = "ken";

	@observable
	age = 21;

	@observable
	path = "";

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
	setDisplaySunburst() {
		this.displaySunburst = true;
		console.log('this.displaySunburst: ', this.displaySunburst);
		this.displaySunburstZoom = false;
		console.log('this.displaySunburstZoom: ', this.displaySunburstZoom);
		this.displayTreemap = false;
		console.log('this.displayTreemap: ', this.displayTreemap);
		this.displayTreemapZoom = false;
		console.log('this.displayTreemapZoom: ', this.displayTreemapZoom);
		console.log('------------------------')
	}

	@action.bound
	setDisplaySunburstZoom() {
		this.displaySunburst = false;
		this.displaySunburstZoom = true;
		this.displayTreemap = false;
		this.displayTreemapZoom = false;
		console.log('this.displaySunburst: ', this.displaySunburst);
		console.log('this.displaySunburstZoom: ', this.displaySunburstZoom);
		console.log('this.displayTreemap: ', this.displayTreemap);
		console.log('this.displayTreemapZoom: ', this.displayTreemapZoom);
		console.log('------------------------')
	}

	@action.bound
	setDisplayTreemap() {
		this.displaySunburst = false;
		this.displaySunburstZoom = false;
		this.displayTreemap = true;
		this.displayTreemapZoom = false;
		console.log('this.displaySunburst: ', this.displaySunburst);
		console.log('this.displaySunburstZoom: ', this.displaySunburstZoom);
		console.log('this.displayTreemap: ', this.displayTreemap);
		console.log('this.displayTreemapZoom: ', this.displayTreemapZoom);
		console.log('------------------------')
	}

	@action.bound
	setDisplayTreemapZoom() {
		this.displaySunburst = false;
		this.displaySunburstZoom = false;
		this.displayTreemap = false;
		this.displayTreemapZoom = true;
		console.log('this.displaySunburst: ', this.displaySunburst);
		console.log('this.displaySunburstZoom: ', this.displaySunburstZoom);
		console.log('this.displayTreemap: ', this.displayTreemap);
		console.log('this.displayTreemapZoom: ', this.displayTreemapZoom);
		console.log('------------------------')
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
	storeDataArray(data: string[][]) {
		this.data_array = data
	}

	@action.bound
	setIsPackageSelectedTrue() {
		this.isPackageSelected = true;
	}
}


