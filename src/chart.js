import React, { Component } from 'react';
import {VictoryLabel, VictoryScatter, VictoryChart, VictoryAxis} from 'victory'
import R from 'ramda'


class Label extends Component {
  render(){
    return <VictoryLabel
              {...this.props}
              x={this.props.x+10}
              y={this.props.y+5}
            >
              {this.props.datum.label}
          </VictoryLabel>
  }
}

const quad = Math.PI/2
const bias = prog=>-1*(prog/5)*0.5 //cap movement to 0.5, scale from 5, and always towards center (*-1)
const mutate = (fn) => ()=> {
                  return [
                    {
                      mutation: fn
                    }
                  ]
                }

const stageProps = {
 ' ':{
 },
 'adopt':{
    color: 'green'
 },
 'trial':{
    color: 'orange'
 },
 'assess':{
    color: 'blue'
 },
 'hold':{
    color:'red'
 }
}

const stages = Object.keys(stageProps)


module.exports = (data, opts)=>{
  const tkey = Object.keys(data)[0]
  const topic = data[tkey]
  const byStage = (d)=>topic.filter(i=>i.stage === d.stage)
  const datumIndex = (d)=>(byStage(d).findIndex(i=>i === d ) )
  const fill = d=>stageProps[stages[d.stage]].color
  const project = trig=> d=> Math.max(bias(d.progression||0) + (d.stage * trig((quad/byStage(d).length) * datumIndex(d))),0)

  class Chart extends Component {
    constructor(props){
      super(props)
      this.state = {}
    }
    render() {
      const selected = this.state.selected || {}
      return (
        <div className="app">
          <div className="chart">
            <h2 style={{textAlign: 'center', textTransform: 'capitalize'}}>{tkey}</h2>
            <VictoryChart
                domainPadding={{x: 0, y: 0}}
            >
              <VictoryAxis
                dependentAxis
                tickValues={R.range(0, stages.length)}
                tickFormat={(x)=>stages[x]}
              />
              <VictoryAxis
                tickValues={R.range(0, stages.length)}
                tickFormat={(x) => stages[x]}
              />
            <VictoryScatter
              style={{
                data: {
                  fill,
                },
                labels:{
                  fontSize: 7
                }
              }}
              data={topic}
              x={project(Math.cos)}
              y={project(Math.sin)}
              labelComponent={
                <Label/>
              }
              events={[{
                target: "data",
                eventHandlers: {
                  onMouseOver: mutate((props) => {
                    return Object.assign({}, props, {size:10})
                  }),
                  onMouseOut: mutate((props) => {
                    return { style:
                      Object.assign({}, props.style)
                    };
                  }),
                  onClick: mutate((props) => {
                    this.setState({selected: props.datum})
                  })
                }
              }]}
            >
            </VictoryScatter>
          </VictoryChart>
        </div>
        { this.state.selected && <div>
          <h3>{selected.label} <div className={`stage stage-${stages[selected.stage]}`}>{stages[selected.stage]}</div></h3>
            <div dangerouslySetInnerHTML={{__html: this.state.selected.desc || ''}} />
          </div>
        }
        </div>
      );
    }
  }
  return Chart
}

