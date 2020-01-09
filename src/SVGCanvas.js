import React from 'react';
import './css/SVGCanvas.css'
import { SVG } from '@svgdotjs/svg.js'
import '@svgdotjs/svg.topoly.js'

const equal = require('fast-deep-equal/es6/react');

export default class SVGCanvas extends React.Component {
    constructor() {
        super()
        this.state = {
            dots: [],
            gridPoints: []
        }

        this.canvasRef = React.createRef()
        this.sourceRef = React.createRef()

        this.inputContext = null;
        this.c = null;
        this.drawResult = this.drawResult.bind(this)
        this.drawInput = this.drawInput.bind(this)
        this.computeGrid = this.computeGrid.bind(this)
        this.handleDrop = this.handleDrop.bind(this)
    }
    componentDidMount() {
        this.inputContext = this.canvasRef.current.getContext('2d')
        this.computeGrid();
        this.drawInput();
    }

    componentDidUpdate(prevProps) {
        if (!equal(this.props, prevProps)) {
            this.computeGrid();
            this.drawResult();
        }
    }

    handleDragOver(e) {
        e.stopPropagation();
        e.preventDefault()
    }

    handleDragEnter(e) {
        e.stopPropagation();
    }
    handleDrop(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        if (ev.dataTransfer.items) {
            if (ev.dataTransfer.items[0].kind === 'file') {
                var file = ev.dataTransfer.items[0].getAsFile();
                if (file.type === 'image/svg+xml') {
                    file.text().then(text => { this.parseSVG(text) })
                }
            }
        }
    }
    drawInput() {
        const image = this.sourceRef.current;
        this.inputContext.drawImage(image, 0, 0, 100, 120, 0, 0, this.props.width, this.props.height)
        this.drawResult();
        
    }

    computeGrid() {
        const stepX = this.props.width / this.props.resX
        const stepY = this.props.height / this.props.resY

        let gridPoints = []
        let _gridPoints = []

        // Add initial points
        for (let x = 0; x < this.props.resX; x++) {
            for (let y = 0; y < this.props.resY; y++) {
                gridPoints.push({ x: x * stepX, y: y * stepY })
            }
        }

        const ox = this.props.width / 2
        const oy = this.props.height / 2

        for (let i = 0; i < gridPoints.length; i++) {
            let p = gridPoints[i];
            let angle = this.props.angle * (Math.PI / 180);

            let px = p.x - ox
            let py = p.y - oy
            let _p = {
                x: (px * Math.cos(angle)) - (py * Math.sin(angle)) + ox,
                y: (px * Math.sin(angle)) + (py * Math.cos(angle)) + oy
            }
            _gridPoints.push(_p)
        }

        this.setState({ gridPoints: _gridPoints })
    }
    drawResult() {
        let dots = [];
        for (let x = 0; x < this.props.resX; x++) {
            for (let y = 0; y < this.props.resY; y++) {
                const data = this.inputContext.getImageData(x, y, 1, 1);
                const r = data.data[0]
                const g = data.data[1]
                const b = data.data[2]
                const scale = (r + b + g) / (255 * 3)
                dots.push({
                    x: x,
                    y: y,
                    scale: scale
                })
            }
        }
        this.setState({ dots: dots })
    }
    render() {
        const stepX = this.props.width / this.props.resX
        const stepY = this.props.height / this.props.resY

        const gridPoints = this.state.gridPoints.map((p, index) => {
            const cx = p.x;
            const cy = p.y;
            return (<circle key={`grid-${index}`} cx={cx} cy={cy} r='1'></circle>)
        })

        const dots = this.state.dots.map((dot, index) => {
            const cx = this.state.gridPoints[index].x;
            const cy = this.state.gridPoints[index].y;
            const scale = dot.scale * this.props.globalScale;
            return (<circle key={`dot-${index}`} cx={cx} cy={cy} r={scale}></circle>)
        })

        const drawingStyle = {
            width: `${this.props.width}px`
        }

        const diagonal = Math.sqrt((this.props.width * this.props.width) + (this.props.height * this.props.height))

        return (
            <div onDrop={this.handleDrop} onDragOver={this.handleDragOver} onDragEnter={this.handleDragEnter} className='drawing' id='drawing' style={drawingStyle}>
                <img onLoad={this.drawInput} className='hidden' id="source" ref={this.sourceRef} src="./rhino.jpg" width="300" height="227"></img>
                <canvas width={this.props.width} height={this.props.height} id='inputImage' className='inputImage' ref={this.canvasRef}></canvas>
                <svg className='outputDrawing' width={this.props.width} height={this.props.height}>
                    {/* {gridPoints} */}
                    {dots}
                </svg>
            </div>
        )
    }
}