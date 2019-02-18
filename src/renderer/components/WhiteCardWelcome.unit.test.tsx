import * as React from 'react';
import { shallow , mount} from 'enzyme';
import WhiteCardWelcome from './WhiteCardWelcome';


// displayWelcomeCard: boolean;
// isPackageSelected: boolean;
describe('<WhiteCardWelcome />', () => {
  it('allows us to set props', () => {
    const wrapper = mount(<WhiteCardWelcome displayWelcomeCard={true} isPackageSelected={false} />);
    expect(wrapper.props().displayWelcomeCard).toEqual(true);
    wrapper.setProps({ displayWelcomeCard: false });
    expect(wrapper.props().displayWelcomeCard).toEqual(false);
  });
});