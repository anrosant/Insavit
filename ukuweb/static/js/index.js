import React from 'react'
import ReactDOM from 'react-dom'
import Form from './src/form'


function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

const element = <Welcome name="world" />;
ReactDOM.render(
  <Form />,
  document.getElementById('form-container')
);
