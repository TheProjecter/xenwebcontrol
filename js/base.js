$(document).ready(function(){
	$('#mogilink').click(function(){location.href='http://www.mogi.at'});  
	$('#mogilogo').click(function(){location.href='http://www.mogi.at'});
	$('#reload').click(function(){location.href=location.href});

	loadExtensions();
	$('#statusline').jqm();
	$('input.jqmdX')
	.hover(
		function(){ $(this).addClass('jqmdXFocus'); }, 
		function(){ $(this).removeClass('jqmdXFocus'); })
	.focus( 
		function(){ this.hideFocus=true; $(this).addClass('jqmdXFocus'); })
	.blur( 
		function(){ $(this).removeClass('jqmdXFocus'); });
		
});
function loadExtensions(){
	loadRunnings();
	loadConfigs();
}
function clearStatusbox(){
	$('#statusline').jqmHide();
}
function Statusbox(TextMessage){
	$('#statustext').text(TextMessage);
	$('#statusline').jqmShow();
	window.setTimeout("clearStatusbox()", 5000);
	loadConfigs()
}
var globalXenConfig;
var globalXenRunnings;
var searchingMachine;
var detailAttributes=new Array("name","boot","sdl","vnc","serial","acpi","apic","vnclisten","vfb","keymap","memory","vcpu");
function loadRunnings(){
	$.get('/runnings.xml',function (xmlData){
		globalXenRunnings=$(xmlData).clone();
		$('#runningcontainer').html('').append($("<table/>").attr('id','running'));
		$("#running").append(
			$("<thead/>")
				.append($("<tr/>")
					.append($("<th/>").text("Id"))
					.append($("<th/>").text("Name"))
					.append($("<th/>").text("Mem"))
					.append($("<th/>").text("Cpus"))
					.append($("<th/>").text("Status"))
					.append($("<th/>").text("CpuTime"))
			)
		);
		
		$('item',xmlData).each(function(){
		
				var newNode=$("<tr/>")
				.append($("<td/>").text($(this).find("id").text() ))
				.append($("<td/>").text($(this).find("machine").text()))
				.append($("<td/>").text($(this).find("mem").text() ))
				.append($("<td/>").text($(this).find("vcpus").text() ))
				.append($("<td/>").text($(this).find("state").text() ))
				.append($("<td/>").text($(this).find("time").text() ))
				newNode.attr('id',$(this).find("name").text());
			$("#running").append(newNode)
		});
		/*$('#running').flexigrid({
			height:'auto',
			striped:false,
			title:'currently running XEN Machines',
			showTableToggleBtn:true
		});  `*/
	});
	window.setTimeout("loadRunnings()", 4000);
}
function showLoading(){
	$('#loading').show();
}
function hideLoading(){
  $('#loading').hide();
}
function loadConfigs(){
	$.get('/config.xml',function (xmlData){
		globalXenConfig=$(xmlData).clone();
		$('#configscontainer').html('').append($("<table/>").attr('id','configs'));
		$("#configs").append(
			$("<thead/>")
				.append($("<tr/>")
					.append($("<th/>").text("Name"))
					.append($("<th/>").text("Mem"))
					.append($("<th/>").text("Config"))
					.append($("<th/>").text("Start"))
					.append($("<th/>").text("Restart"))
					.append($("<th/>").text("Shutdown"))
					.append($("<th/>").text("Destroy"))
			)
		);
		$('item',xmlData).each(function(){
				var nodeName=$(this).find("name").text();
				var newNode=$("<tr/>")
				.append($("<td/>").text($(this).find("name").text() ))
				.append($("<td/>").text($(this).find("memory").text()))
				.append($("<td/>").text($(this).find("filename").text() ).attr('class','configfile'));
				
				if( $('item[name='+nodeName+']',globalXenRunnings).length==0){
					tdStart= $("<td/>")
						.addClass('actionButton')
						.click(function(event){
							showLoading();
							$.get('/exec.xml',
								{
									newStatus:'start',
									machine:$(this).parent().attr('id'),
									configfile:$('item[name='+$(this).parent().attr('id')+']',globalXenConfig).find('absolutefilename').text()
								},
								function (xmlData){
									if($('returncode',xmlData).text()==0){
										Statusbox('Machine started');
									}
									else{
										Statusbox("Error - could not start");
									}
									hideLoading();
								});
						});
					newNode.append(
						tdStart.append($("<img/>")
								.attr("src","/images/start.gif")
								.attr('width','20')
								.attr('height','20')
							).attr('title','Start')
						);
					newNode.append($("<td/>").text(""));
					newNode.append($("<td/>").text(""));
					newNode.append($("<td/>").text(""));
				}
				else{
					newNode.append($("<td/>").text(""));
					tdStop= $("<td/>")
						.addClass('actionButton')
						.click(function(event){
							showLoading();
							$.get('/exec.xml',
								{newStatus:'shutdown',machine:$(this).parent().attr('id')},
								function (xmlData){
									if($('returncode',xmlData).text()==0){
										Statusbox('Machine shutting down');
									}
									else{
										Statusbox("Error - could not shut down");
									}
									hideLoading();
								});
						});
					newNode.append(tdStop
							.append($("<img/>")
								.attr("src","/images/shutdown.gif")
								.attr('width','20')
								.attr('height','20')
								)
					);
					tdRestart= $("<td/>")
						.addClass('actionButton')
						.click(function(event){
							showLoading();
							$.get('/exec.xml',
								{newStatus:'restart',machine:$(this).parent().attr('id')},
								function (xmlData){
									if($('returncode',xmlData).text()==0){
										Statusbox('Machine restarting');
									}
									else{
										Statusbox("Error - could not restart");
									}
									hideLoading();
								});
						});
					newNode.append(tdRestart
							.append($("<img/>")
								.attr("src","/images/restart.gif")
								.attr('width','20')
								.attr('height','20')
							).attr('title','Restart')
					);
					tdDestroy= $("<td/>")
						.addClass('actionButton')
						.click(function(event){
							showLoading();
							$.get('/exec.xml',
								{newStatus:'destroy',machine:$(this).parent().attr('id')},
								function (xmlData){
									if($('returncode',xmlData).text()==0){
										Statusbox('Machine destroyed');
									}
									else{
										Statusbox("Error - could not destroy");
									}
									hideLoading();
								});
						});
					newNode.append(tdDestroy
							.append($("<img/>")
								.attr("src","/images/destroy.gif")
								.attr('width','20')
								.attr('height','20')
							).attr('title','Destroy')
					);
				}
				newNode.attr('id',$(this).find("name").text());
				newNode.mouseover(function(event){
					searchingMachine=$(this).attr("id");
					loadConfigDetails();
					$(this).addClass('hoverLine');
				});
				newNode.mouseout(function(event){
					$(this).removeClass('hoverLine');
					
				});
			$("#configs").append(newNode)
		});
		/*$('#configs').flexigrid({
			height:'auto',
			striped:false,
			title:'available XEN Machines',
			showTableToggleBtn:true,
		}); */
	});  
	window.setTimeout("loadConfigs()", 15000);
}

function loadConfigDetails(){
	$('item',globalXenConfig).each(function(){
			if($(this).find("name").text()==searchingMachine){
				$('#machineDetailcontainer').html('').append($("<table/>").attr('id','machineDetail'));
				$("#machineDetail").append(
					$("<thead/>").append(
						$("<tr/>")
							.append($("<th/>").text("Key"))
							.append($("<th/>").text("Value"))
					)
				);
				//fill in machine details
				for(var i = 0; i<detailAttributes.length;i++){
					if($(this).find(detailAttributes[i]).text()!=""){
						$("#machineDetail")
							.append($("<tr/>")
								.append($("<td/>").text(detailAttributes[i]))
								.append($("<td/>").text($(this).find(detailAttributes[i]).text() )))
					}
				}
				$('disk',this).each(function(){
					$("#machineDetail")
						.append($("<tr/>")
							.append($("<td/>").text("disk"))
							.append($("<td/>").text($(this).text() )))
				});
				//make flexigrid
			}
	});
	/*$('#machineDetail').flexigrid({
		height:'auto',
		striped:false,
		width:500,
		title:'XEN Machine Details',
		showTableToggleBtn:true
	});   */
}