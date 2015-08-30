function SRulePicker(element, options){
	var instance = {};

	var srangesvg = document.createElement('div');

	instance.options = options;

	
	instance.rs = [{id:'0000',v:0}, {id:'9999', v:100}];

	instance.addRange = function(id, r){
		instance.rs.push({id: id, v: r});

		instance.sortRs();

		instance.reloadLabelsAndOptions();
	};

	instance.sortRs = function(){
		instance.rs = instance.rs.sort(function(a, b){ return a.v - b.v ; });
	};

	instance.removeRange = function(id){
		for(var i = 0; i < instance.rs.length; i++){
			if(instance.rs[i].id == id){
				instance.rs.splice(i, 1);
			}
		}

		instance.sortRs();

		instance.reloadLabelsAndOptions();
	};

	instance.showRs = function(){
		var output = "";

		for(var i = 0; i < instance.rs.length; i++){
			output += " v: {0}, id: {1}".format(instance.rs[i].v, instance.rs[i].id);
		}

		console.info(output);
	};

	instance.moveRange = function(id, r){
		for(var i = 0; i < instance.rs.length; i++){
			if(instance.rs[i].id == id){
				instance.rs[i].v = r;
			}
		}

		instance.sortRs();

		//instance.showRs();
		instance.reloadLabels();
	};

	instance.reloadLabelsAndOptions = function(){

		instance.bodyLabel.selectAll('div').remove();
		
		for(var i = 1; i < instance.rs.length; i++){
			if(!instance.rs[i - 1]){
				break;
			}
			instance.bodyLabel.append('div').text(" {0}%~{1}%".format(instance.rs[i-1].v, instance.rs[i].v));

			var selectId = 'select_' + instance.rs[i].id;

			var exists = false;
			instance.bodyRule.selectAll('div.srulepicker-rule').each(function(){
				var rule = d3.select(this);
				if(selectId == rule.attr('id')){
					exists = true;
				}
			});

			if(!exists){
				instance.buildSelect(instance.bodyRule.append('div').attr('class', 'srulepicker-rule').attr('id', selectId));
			}
		}

		instance.bodyRule.selectAll('div.srulepicker-rule').each(function(){
			var ruleId = d3.select(this).attr('id').replace('select_', '');

			var exists = false;
			for(var i = 0; i < instance.rs.length; i++){
				if(instance.rs[i].id == ruleId){
					exists = true;
				}
			}

			if(!exists){
				d3.select(this).remove();
			}
		});
		
	};
	
	instance.reloadLabels = function(){

		instance.bodyLabel.selectAll('div').remove();
		
		for(var i = 1; i < instance.rs.length; i++){
			if(!instance.rs[i - 1]){
				break;
			}
			instance.bodyLabel.append('div').text(" {0}%~{1}%".format(instance.rs[i-1].v, instance.rs[i].v));
		}
		
	};
		
	instance.buildSelect = function(target){
		
		var select = target.append('select');

		for(var i = 0; i < options.rules.length; i++){
			select.append('option').attr('value', options.rules[i][0]).text(options.rules[i][1]);
		}
	};
	
	var srange = SRange(srangesvg,
						instance.addRange,
						instance.moveRange,
						instance.removeRange);

	srange.build();

	element.appendChild(srangesvg);

	var rulestable = d3.select(element).append('div').attr('class', 'srulepicker');

	var head = rulestable.append('div').attr('class', 'srulepicker-head');
	head.append('div').attr('class', 'srulepicker-head-range').text(options.head[0]);
	head.append('div').attr('class', 'srulepicker-head-rule').text(options.head[1]);

	var body = rulestable.append('div').attr('class', 'srulepicker-body');
	instance.bodyLabel = body.append('div').attr('class', 'srulepicker-body-range');
	instance.bodyRule = body.append('div').attr('class', 'srulepicker-body-rule');

	instance.reloadLabelsAndOptions();
	
	return instance;
}
