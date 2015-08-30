/**

srange version 2

element: DOM element to wrape svg figures
spec: options for srange
addFn: function to call when add event occurs
moveFn: function to call when move event occurs
removeFn: function to call when remove event occurs
*/
function SRange(element, spec, addFn, moveFn, removeFn){

	var instance = {
		//ref to parent DOM element
		parent: element,

		//ref to specification, default to {w: 300, h: 100}
		spec:{
			//svg width
			w: 500,
			//svg height
			h: 100,
			//axis ticks
			ticks: 10,
			//default margin
			margin: 25,
			//srane width
			srangeW: 500 - 2 * 25,
			//srane range
			range: [0, 100],
			//tip distance to axis
			tipD: -10,
			//tip unit like '%'
			tipUnit: '%'
			
		},		

		createContainer: function(){
			var svg = d3.select(element).append('svg')
				.attr('width', instance.spec.w)
				.attr('height', instance.spec.h);

			var container = svg.append('g');
			container.attr('class', 'srange');

			var x = instance.spec.margin;
			var y = instance.spec.h * 0.4;

			container.attr('transform', 'translate({0},{1})'.format(x, y));
			instance.container = container;
		},

		createAxis: function(){
			var axisContainer = instance.container.append('g')
				.attr('class', 'srange-axis');

			instance.axisContainer = axisContainer;

			instance.createAxisBottomLine();

			instance.createAxisTicks();

			instance.createAxisTips();
		},

		createAxisBottomLine: function(){
			
		},

		createAxisTicks: function(){
			var tickCount = instance.spec.ticks + 1;//include 0 tick
			var tickDistance = instance.spec.srangeW / instance.spec.ticks;

			var axisC = instance.axisContainer;

			//ref to ticks
			instance.ticks = [];
			
			for(var tickIndex = 0; tickIndex < tickCount; tickIndex++){

				var x = tickDistance * tickIndex;
				var y = 0;
				
				var tick = axisC.append('g')
					.attr('class', 'srange-tick')
					.attr('transform', 'translate({0},{1})'.format(x, y));

				tick.append('line')
					.attr('class', 'srange-tick-line')
					.attr('x1', 0)
					.attr('y1', 0)
					.attr('x2', 0)
					.attr('y2', 10);

				instance.ticks.push(tick);
			}
			
		},

		createAxisTips: function(){
			var firstTick = instance.ticks[0];

			firstTick.append('text')
				.attr('class', 'srange-tick-tip')
				.attr('transform', 'translate({0},{1})'.format(-10, instance.spec.tipD))
				.text(instance.spec.range[0] + instance.spec.tipUnit);

			var lastTick = instance.ticks[instance.ticks.length - 1];

			lastTick.append('text')
				.attr('class', 'srange-tick-tip')
				.attr('transform', 'translate({0},{1})'.format(-10, instance.spec.tipD))
				.text(instance.spec.range[1] + instance.spec.tipUnit);
			
		},

		createBar: function(){

			var barContainer = instance.container.append('g')
				.attr('class', 'srange-bar')
				.attr('transform', 'translate({0}, {1})'.format(0, 15));

			instance.barContainer = barContainer;

			instance.createBarRect();

			instance.createBarCursorContainer();
		},

		createBarRect: function(){
			var rect = instance.barContainer.append('rect')
				.attr('class', 'srange-bar-rect');

			var rectH = instance.spec.h * 0.2;

			instance.spec.barH = rectH;
			rect.attr('width', instance.spec.srangeW)
			rect.attr('height', rectH);

			rect.on('click', function(){
				var barX = d3.mouse(this)[0];
				var x = Math.round(barX / instance.spec.srangeW * 100);

				instance.addCursor(x);
			});
		},

		createBarCursorContainer: function(){
			var cursorContainer = instance.barContainer.append('g')
				.attr('class', 'srange-cursor-container');

			instance.cursorContainer = cursorContainer;

			instance.cursors= {};
		},

		cursorId: function(){
			var id = Math.random() + '';
			id = id.replace(/\./g,'');
			return id;
		},

		//x is range value between [0, 100]
		addCursor: function(x){
			if(x < instance.spec.range[0] || x > instance.spec.range[1]){
				return;
			}
			
			var cursorId = instance.cursorId();

			var cursorX = x / instance.spec.range[1] * instance.spec.srangeW;
			
			var cursor = instance.cursorContainer.append('g')
				.attr('class', 'srange-cursor')
				.attr('transform', 'translate({0},{1})'.format(cursorX, instance.spec.barH))
				.attr('id', cursorId);

			var path = [
				[0, 0],
				[-10, 10],
				[-10, 20],
				[10, 20],
				[10, 10],
				[0, 0],
				[0, 0 - instance.spec.barH - 15]
			];

			//cursor graph
			var cursorG = cursor.append('polygon')
				.attr('class', 'srange-cursor-g')
				.attr('points', path);

			//cursor tip with values like '50%'
			var cursorT = cursor.append('text')
				.attr('class', 'srange-cursor-t')
				.attr('transform', 'translate({0},{1})'.format(-15, 0 - instance.spec.barH - 15 + instance.spec.tipD))
				.text(x + instance.spec.tipUnit);

			instance.cursors[cursorId] = cursor;

			var drag = d3.behavior.drag()
				.on('drag', function(){

					var barX = d3.mouse(instance.barContainer.node())[0];
					var x = Math.round(barX / instance.spec.srangeW * 100);

					var cursorId = d3.select(this).attr('id');

					instance.moveCursor(cursorId, x);
										
				});

			cursor.call(drag);

			cursor.on('dblclick', function(){
				var id = d3.select(this).attr('id');

				instance.removeCursor(id);
			});

			if(addFn){
				addFn(cursorId, x);
			}
			
			return cursorId;
		},

		//id: cursor id return from addCursor
		removeCursor: function(id){
			var cursor = instance.cursors[id];

			if(cursor){
				cursor.remove();

				instance.cursors[id] = null;

				if(removeFn){
					removeFn(id);
				}
			}
		},

		//id: cursor id, x: cursor new value
		moveCursor: function(id, x){
			if(x < 0 || x > 100){
				return;
			}

			var cursor = instance.cursors[id];

			var cursorX = x / instance.spec.range[1] * instance.spec.srangeW;
			
			if(cursor){
				cursor.attr('transform', 'translate({0},{1})'.format(cursorX, instance.spec.barH));

				cursor.select('text.srange-cursor-t')
					.text(x + instance.spec.tipUnit);

				if(moveFn){
					moveFn(id, x);
				}
			}
		},

		build: function(){
			instance.createContainer();

			instance.createAxis();

			instance.createBar();

			return instance;
		}
	};
	
	return instance;
}

(function(){
	//add format method to String prototype
	if (!String.prototype.format) {
		String.prototype.format = function() {
			var args = arguments;
			return this.replace(/{(\d+)}/g, function(match, number) {
				return typeof args[number] != 'undefined'
				    ? args[number]
				    : match
				;
			});
		};
	}

})();
