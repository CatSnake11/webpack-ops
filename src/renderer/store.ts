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
    isChartSelected: boolean,
    setIsChartSelectedTrue(): void,
    setIsChartSelectedFalse(): void,
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
    isChartSelected = true;

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
    setIsChartSelectedTrue() {
        this.isChartSelected = true;
    }

    @action.bound
    setIsChartSelectedFalse() {
        this.isChartSelected = false;
    }
}


