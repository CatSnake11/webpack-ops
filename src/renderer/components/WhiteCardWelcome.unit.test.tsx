import * as React from 'react';
import { shallow, mount } from 'enzyme';
import WhiteCardWelcome from './WhiteCardWelcome';


// displayWelcomeCard: boolean;
// isPackageSelected: boolean;
describe('<WhiteCardWelcome />', () => {
  it('allows us to set props', () => {
    const wrapper = mount(<WhiteCardWelcome isWelcomeCardDisplayed={true} isPackageSelected={false} />);
    expect(wrapper.props().isWelcomeCardDisplayed).toEqual(true);
    wrapper.setProps({ isWelcomeCardDisplayed: false });
    expect(wrapper.props().isWelcomeCardDisplayed).toEqual(false);
  });
});