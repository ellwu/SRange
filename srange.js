/**
* element: 'div#demo' (d3 selector)
* spec: {width: 500, height; 100}
*/

var srange = {};

srange.build = function(element, spec){
	var instance = {};

	if(!element){
		return instanc;
	}

	if(!spec){
		spec = {
			width: 500,
			height: 100
		};
	}

	var container = d3.select(element);

	if(!container){
		return instance;
	}

	var svg = container.append('svg')
		.attr('class', 'srange-svg')
		.attr('width', spec.width)
		.attr('height', spec.height);

	this.createAxis(svg);
	
	this.createBar(svg);

	this.bindEvent(svg);

	this.createSpliterContainer(svg);

	

	return instance;
};

srange.createAxis = function(svg){
	this.debug('create axis');

	var svgH = svg.attr('height');
	var svgW = svg.attr('width');

	var margin = 25;
	var axisX = margin;
	var axisY = svgH * 0.4 - 3;
	var axisW = svgW - 2 * margin;

	var axis = svg.append('g')
		.attr('class', 'srange-axis')
		.attr('transform', function(){
			return 'translate(' + axisX + ',' + axisY + ')';
		});

	var baseLine = axis.append('line')
		.attr('class', 'srange-axis-line')
		.attr('x1', 0)
		.attr('y1', 0)
		.attr('x2', axisW)
		.attr('y2', 0);

	var tickW = axisW / 10;
	for(var i = 0; i < 11; i++){
		axis.append('line')
			.attr('class', 'srange-axis-tick')
			.attr('x1', tickW * i)
			.attr('y1', -5)
			.attr('x2', tickW * i)
			.attr('y2', 0);
	}

	this.createAxisTip(axis);
};

srange.createBar = function(svg){
	this.debug('create bar');

	var svgH = svg.attr('height');
	var svgW = svg.attr('width');

	var margin = 25;
	var barX = margin;
	var barY = svgH * 0.4;
	var barH = svgH * 0.2;
	var barW = svgW - 2 * margin;

	svg.append('rect')
		.attr('class', 'srange-bar')
		.attr('x', barX)
		.attr('y', barY)
		.attr('width', barW)
		.attr('height', barH);
};

srange.createAxisTip = function(axis){
	this.debug('create bar tip');

	var axisW = axis.select('line.srange-axis-line').attr('x2');

	axis.append('text')
		.attr('class','srange-axis-tip')
		.attr('x', -14)
		.attr('y', -12)
		.text('0%');
	
	axis.append('text')
		.attr('class','srange-axis-tip')
		.attr('x', axisW - 20)
		.attr('y', -12)
		.text('100%');

};

srange.bindEvent = function(svg){

	svg.select('.srange-bar')
		.on('click', function(){
			var position = d3.mouse(this);

			var spliterX = position[0];
			var randomId = 'spilter_' + (Math.random() * 100);
			randomId = randomId.replace(/\./g, '');
			
			var axisW = svg.select('line.srange-axis-line').attr('x2');
			var percent = srange.percent(spliterX - 25, axisW); // Math.round((spliterX - 25) / axisW * 10000) / 100;
				
			var newSpliter = {
				id: randomId,
				x: spliterX - 25,
				percent: percent,
				axisW: axisW
			};

			srange.createSpliter(svg, newSpliter);
		});
};

srange.createSpliter = function(svg, newSpliter){
	var container =	svg.select('.srange-spliter-group');
	
	var spliter = container.append('polygon')
		.attr('class', 'srange-spliter-polygon')
		.attr('id', newSpliter.id)
		.attr('points', srange.buildPath(newSpliter))
		.attr('s_info', JSON.stringify(newSpliter));

	container.append('text')
		.attr('class', 'srange-spliter-tip')
		.attr('id', 'tip_' + newSpliter.id)
		.text(newSpliter.percent + '%')
		.attr('x', newSpliter.x - 20)
		.attr('y', -35);

	var drag = d3.behavior.drag()
		.on('drag', srange.moveSpliter);

	spliter.call(drag);

	spliter.on('dblclick', function(){
		var id = d3.select(this).attr('id');
		d3.select(this).remove();

		d3.select('text#tip_' + id).remove();
	});
};


srange.moveSpliter = function(){
	var id = d3.select(this).attr('id');
	var newX = d3.mouse(this)[0];

	
	var spliter = d3.select('polygon#' + id);
	var spliterInfo = JSON.parse(spliter.attr('s_info'));

	if(newX > spliterInfo.axisW || newX < 0){
		return;
	}

	spliterInfo.x = newX;
	spliterInfo.percent = srange.percent(newX, spliterInfo.axisW); //Math.round((newX) / spliterInfo.axisW * 10000) / 100;

	spliter.attr('s_info', JSON.stringify(spliterInfo));
	spliter.attr('points', srange.buildPath(spliterInfo));

	var tip = d3.select('text#tip_' + id);
	tip.attr('x', newX - 20);

	tip.text(spliterInfo.percent + '%');
};

srange.buildPath = function(newSpliter){
	var x = newSpliter.x;
	var spliterPinLen = -35;
	
	var path = [
		[x, spliterPinLen],
		[x, 0],
		[x - 10, 10],
		[x - 10, 20],
		[x + 10, 20],
		[x + 10, 10],
		[x, 0]
	];

	return path;
};

srange.percent = function(x, w){
	return Math.round(x / w * 100);
};

srange.createSpliterContainer = function(svg){
	var svgH = svg.attr('height');
	var svgW = svg.attr('width');

	var margin = 25;
	var sgX = margin;
	var sgY = svgH * 0.6;
	var sgW = svgW - 2 * margin;

	var splitergroup = svg.append('g')
		.attr('class', 'srange-spliter-group')
		.attr('transform', function(){
			return 'translate(' + sgX + ',' + sgY + ')';
		});
};

srange.debug = function(msg){
	console.info(msg);
};
