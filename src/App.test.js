import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import App from './App';
import loadJS from './loadJS.js';

jest.mock('loadJS', () => jest.fn());

describe('App', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<App />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
