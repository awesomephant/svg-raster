import React from 'react';
import SVGCanvas from './SVGCanvas.js'
import Settings from './Settings.js'
import './css/App.css';

export default class App extends React.Component {

  constructor() {
    super()
    this.state = {
      width: 0,
      height: 0,
      settings: {
        resX: 22,
        resY: 12,
        enableGrid: true,
        globalScale: 10,
        angle: 0
      }
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    this.updateSetting = this.updateSetting.bind(this)
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  updateSetting(setting, value) {
    this.setState((prevState) => {
      if (prevState.settings[setting] !== null) {
        prevState.settings[setting] = value;
      } else {
        console.error(`Attempted to update non-existing setting ${setting}`)
      }
      return prevState;
    })
  }
  render() {
    return (
      <div className="app">
        <header className="app-header">
          <h1>SVG AM Screening</h1>
        </header>
        <main className='app-wrap'>
          <SVGCanvas width='800' height='600' angle={this.state.settings.angle} enableGrid={this.state.settings.enableGrid} resX={this.state.settings.resX} resY={this.state.settings.resY} globalScale={this.state.settings.globalScale}></SVGCanvas>
          <Settings updateSetting={this.updateSetting} settings={this.state.settings}></Settings>
        </main>
      </div>
    );
  }
}