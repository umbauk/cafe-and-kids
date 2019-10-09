import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import App from './App';
import { loadJS } from './loadJS';

jest.mock('./loadJS', () => jest.fn());
const mapMock = {
  getCenter: () => {
    const lat = () => {};
    const lng = () => {};
    return {
      lat: lat,
      lng: lng,
    };
  },
};

//console.log(wrapper.find('button').first().text());

describe('App', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<App />);
  });
  it('matches initial snapshot', () => {
    const wrapper = shallow(<App />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  it('matches snapshot after user clicks a date for activity', () => {
    const wrapper = mount(<App />);
    const todayButton = wrapper.find('button[children="Today"]');
    todayButton.simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.state('eventDate')).toEqual('today');
    wrapper.unmount();
  });
  it('matches snapshot after user selects a location', () => {
    const wrapper = mount(<App />);
    const todayButton = wrapper.find('button[children="Today"]');
    todayButton.simulate('click');
    wrapper.setState({ location: 1 }); // simulates location has been set
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
  it('matches snapshot after user selects distance and travel method', () => {
    const wrapper = mount(<App />);
    const todayButton = wrapper.find('button[children="Today"]');
    todayButton.simulate('click');
    wrapper.setState({ location: 1 }); // simulates location has been set
    wrapper.setState({ proximityMinutes: 20 });
    wrapper.setState({ map: mapMock });

    const cycleButton = wrapper.find('button[children="Cycle"]');
    cycleButton.simulate('click');

    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});

/*
const useCurrentLocationButton = wrapper.find(
      'button[children="Use current location"]',
    );
    useCurrentLocationButton.simulate('click');
    */
