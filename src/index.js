import React from 'react';
import ReactDOM from 'react-dom';
import makeChart from './chart';

// data would be available globally
//
ReactDOM.render(
  React.createElement(makeChart(data)),
  document.getElementById('root')
);
