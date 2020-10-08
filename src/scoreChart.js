import React, {Component} from 'react';
import * as d3 from "d3";

class scoreChart extends Component {

  componentDidMount() {
    this.drawChart();
  }

  drawChart() {
    var margin = {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5
    };

    var width = "300px",
    	height = "10px";

    //SVG container
    var svg = d3.select("chart")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
    	.append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Container for the gradients
    var defs = svg.append("defs");

    var linearGradient = defs.append("linearGradient")
    	.attr("id","animate-gradient")
    	.attr("x1","0%")
    	.attr("y1","0%")
    	.attr("x2","100%")
    	.attr("y2","0")
    	.attr("spreadMethod", "reflect");

    var colours = ["rgb(253,231,37)", "rgb(180,222,44)", "rgb(109,205,89)", "rgb(53,183,121)", "rgb(31,158,137)", "rgb(38,130,142)" ,"rgb(49,104,142)",
                  "rgb(62,74,137)", "rgb(72,40,120)", "rgb(68,1,84)" ];
    linearGradient.selectAll(".stop")
    	.data(colours)
    	.enter().append("stop")
    	.attr("offset", function(d,i) { return i/(colours.length-1); })
    	.attr("stop-color", function(d) { return d; });

    //Create the rectangle

    svg.append("rect")
    	.attr("x", 0)
    	.attr("y", 0)
    	.attr("width", width)
    	.attr("height", height)
    	.style("fill", "url(#animate-gradient)");
  }

  render(){
    return <div id={"#" + this.props.id}></div>
  }
}

export default scoreChart;
