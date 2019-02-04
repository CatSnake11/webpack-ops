import * as React from "react";
import { configure, shallow } from "enzyme";
import * as Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
import TabThree from "../src/renderer/components/TabThree";
import Hello from "../src/renderer/components/Hello";


describe('Testing Hello', () => {


	it("renders the heading", () => {
    const result = shallow(<Hello />).contains(<h1>Hello!</h1>);
    expect(result).toBeTruthy();
});
})

describe('TabThree Component Testing', () => {
	let wrapper = shallow(<TabThree store={store} />);
	let store = {};
	beforeAll(()=>{
		wrapper = shallow(<TabThree store={store} />);
	});

	it('should be a div with className mainContainerHome', () =>{
	 	console.log(wrapper.find('button'))
		expect(wrapper.find('button').length).toBe(1);
	})
})