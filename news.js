var News = News || function () {
  
	var badgeCt = 0;
	var localProfile = localStorage.getItem('profile');
	var myNewsKey = sessionStorage.getItem('myNewsKey');
	var notifs = sessionStorage.getItem('notifs'); 
    var editor = localStorage.getItem('editor'); 
	var functionCode = '';
	var actualKey = "";
    var hasGeneral = false;
	var hasInstance = false;
	var hasUrgent = false;
    var urgentAhrefs = '';
	var urgentCt = 0;
	var newGritter = true;
	var nws = "";
	var date = new Date();
	var cookieVal = $.cookie('latestNewsKey');
	var midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);	
/*
*	Profile session section: 
*
*/	
 function DtaaraPKey(){
	var data = 'INSTANCE=HTHACKNEY';
	var key = '';
	$.getJSON( "http://portal.hthackney.com/rest/WEB054K?callback=?",data )
	.done(function( json ) {
		$.cookie('latestNewsKey', $.trim(json.LatestNews),{ expires: midnight}); 
		 cookieVal = json.LatestNews;
	})	
	.fail(function( jqXHR, textStatus, error ) {
	var err = textStatus + ", " + error;
	alert('Unable to Connect to Server.\n Try again Later.\n Request Failed: ' + err);
	}); 
 
}
var StorageNotifsLinks = function(){ //load newsfeed into temporary storage
	//load hrefs into sessionStorage notifs
	 var data = 'USER=' + localProfile +
	    				'&INSTANCE=HTHACKNEY';
	$.getJSON( "http://portal.hthackney.com/rest/WEB054A?callback=?",data )
	.done(function( json ) {
		 var jsonString = JSON.stringify(json);
		 sessionStorage.removeItem('notifs');
		 sessionStorage.setItem('notifs', jsonString);	
	     HtmlNotifs();
	});	
} 
var CheckInstances = function(array){
	//checks to see if any unviewed notifications for ul#notifs
	for(var i = 0; i < array.length; i++)
	{
		//console.log(array[i].FUNCTION);
		if(array[i].URGENT === "Y" && (array[i].FUNCTION === '*GENERAL' || array[i].FUNCTION == functionCode))
			hasUrgent = true;
		if(array[i].FUNCTION === '*GENERAL' && array[i].VISITED !== "Y")
			hasGeneral = true;
		if(array[i].FUNCTION == functionCode && array[i].VISITED !== "Y")				
			hasInstance = true;			
	}
}
var SetProfile = function(u){
	localStorage.setItem('profile', u);
	localProfile = localStorage.getItem('profile');
	var data = "USERID=" + u +
	           "&INSTANCE=HTHACKNEY";			   
	$.getJSON( "http://portal.hthackney.com/rest/WEB891?callback=?",data )
	 .done(function( json ) {
	     localStorage.setItem('editor', json.EDITOR);
		 editor = localStorage.getItem('editor');
	 });
}
/* 
*
* HTML Notifications:
*
*/
var HtmlNotifs = function(){
		HtmlNotifsLinks(); 
		HtmlGritter();	 
		HtmlBadgeCount();
}	
var HtmlNotifsLinks = function(){
	//clear on rebuild
	urgentAhrefs = [];
    hasInstance = false;
    hasGeneral = false;
    hasUrgent = false;	
	notifs = sessionStorage.getItem('notifs');
	//console.log(notifs);
	var jArray = {};

		jArray = $.parseJSON(notifs);
		CheckInstances(jArray);
		var tempStr = "";
		var title = "";
        //reset notification ul li every time
	  $("#notifications").html('');		
		$('ul#notifs').html('');
		
	   $("#notifications").append('<li><ul id="notifs" class="dropdown-menu-list scroller"></li>');
		var ul = $('#notifs');
	 
		if(hasGeneral){ //<!-- *GENERAL //-->
			ul.append('<li id="general" class="disabled topic"><span class="mt5l10">New Announcements</span></li>')
		 }
		 
		 if(hasInstance){ //<!-- *FUNCTION //-->
			ul.append('<li id="enhancements" class="disabled topic pages"><span class="mt5l10">New Page Enhancements</span></li>'); 
		 }	
		 
		$.each(jArray, function(k, v) { //ul#notifs li.nws	  
			
			title = v.TITLE;
			
			if(v.FUNCTION === "*GENERAL"){
				//console.log(v.URGENT);
				if(v.URGENT == "Y"){
					tempStr = '<a href="#NewsModal" class="urgent" title="' + title + '" onclick="remote=\'modal_news.php?USER=' + localProfile + '&PKEY=' +
					v.PKEY + '&FUNCTION=' + encodeURIComponent(v.FUNCTION) + '\'; remote_target=\'#NewsModal .noscroll-modal-body\'" role="button" data-toggle="modal"><span class="label label-icon label-danger"><i class="fa fa-bolt"></i></span>'
					+  title.dotdotdot(35) + '</a>';
					hasUrgent = true;
					urgentCt++;
					urgentAhrefs.push(tempStr);
				}
				else{
					tempStr = '<a href="#NewsModal" title="' + title + '" onclick="remote=\'modal_news.php?USER=' + localProfile + '&PKEY=' +
					v.PKEY  + '&FUNCTION=' + encodeURIComponent(v.FUNCTION) + '\'; remote_target=\'#NewsModal .noscroll-modal-body\'" role="button" data-toggle="modal"><span class="label label-icon label-info"><i class="fa fa-bullhorn"></i></span>'
					+  title.dotdotdot(35) + '</a>';
				}						
				$('<li class="nws">' + tempStr + '</li>').insertAfter("#general");
			}
			//console.log(v.FUNCTION + " =  " + functionCode);
			if(v.FUNCTION === functionCode){
				if(v.URGENT == "Y"){
					tempStr = '<a href="#NewsModal" class="urgent" title="' + title + '" onclick="remote=\'modal_news.php?USER=' + localProfile + '&PKEY=' +
					v.PKEY  + '&FUNCTION=' + encodeURIComponent(v.FUNCTION) + '\'; remote_target=\'#NewsModal .noscroll-modal-body\'" role="button" data-toggle="modal"><span class="label label-icon label-danger"><i class="fa fa-bolt"></i></span>'
					+  title.dotdotdot(35) + '</a>';
					hasUrgent = true;
					urgentCt++;
					urgentAhrefs.push(tempStr);
				}
				else{
					tempStr = '<a href="#NewsModal" title="' + title + '" onclick="remote=\'modal_news.php?USER=' + localProfile + '&PKEY=' +
					v.PKEY  + '&FUNCTION=' + encodeURIComponent(v.FUNCTION) + '\'; remote_target=\'#NewsModal .noscroll-modal-body\'" role="button" data-toggle="modal"><span class="label label-icon label-warning"><i class="fa fa-exclamation"></i></span>'
					+  title.dotdotdot(35) + '</a>';	
				}						
				$('<li class="nws">' + tempStr + '</li>').insertAfter("#enhancements");
			}
		}); //eof ul#notifs li.nws	
 
	//external link for all viewed newsfeeds that are active
	  nws = $.trim($(".page-content .page-title:first").text().toUpperCase());
	if(empty(nws))
		nws = functionCode;
	if(nws === "SPLASH PAGE")
		nws = "HOME PAGE";
	var external = '<li class="external" title="View all general announcements and page enhancements from the ' + toTitleCase(nws) + ' newsfeed"><a href="#NewsModal" onclick="remote=\'modal_newsfeed.php?USER=' + localProfile + '&FUNCTION=' +
	encodeURIComponent(functionCode) + '\'; remote_target=\'#NewsModal .noscroll-modal-body\'" role="button" data-toggle="modal">'+ 
	'<i class="fa fa-feed"></i><span class="ml5"><strong>' + toTitleCase(nws) + ' Newsfeed</strong></span></a></li>';
   $('ul#notifications li.external').remove();
   $("ul#notifications").append(external);
setTimeout(HandleScroller(),2000);   
}
var HtmlBadgeCount = function(){
	var header = $('#header_notification_bar');
	
	if(header.hasClass('hidden')){ 
		header.removeClass('hidden');
	}
	badgeCt = $("ul#notifs li.nws").length;		
	if(badgeCt > 0){
		header.find(".badge").text(badgeCt);
		header.find('.fa-bell').removeClass('opaque');
	}
	else{
		header.find('.fa-bell').addClass('opaque');	
		header.find(".badge").addClass("hidden");
	}
   HandleScroller();
}
var HtmlGritter = function(){
	
	if(empty(editor)){
	//pulsate new notifications
	if(hasUrgent || hasGeneral || hasInstance){

	if(hasUrgent && urgentAhrefs.length > 0){
 	
		$.extend($.gritter.options, {
			position: 'top-left'
		});
		
		if(newGritter){
		setTimeout(function () { 
			var urgent_id = $.gritter.add({
				// (string | mandatory) the heading of the notification
				title: '<i class="fa fa-4x fa-bolt"></i>&nbsp;&nbsp;Urgent News!',
				// join '  ' removes commas from array toString()
				text: urgentAhrefs.join(" "),
				// (string | optional) the image to display on the left
				image: '../images/logo.png',
				// (bool | optional) if you want it to fade out on its own or just sit there
				sticky: true,
				// (int | optional) the time you want it to be alive for before fading out
				time: '',
				// (string | optional) the class name you want to apply to that specific message
				class_name: 'clicker'
			});
		}, 2000);	//eof setTimeout
			newGritter = false;
		}
		else{
			$("#gritter-item-1 p").html(urgentAhrefs.join(" "));
		}//eof new gritter
	}//eof if urgent 		
		//pulsate recursively
		if(typeof pulsatingInterval === "undefined"){
			pulsatingInterval = setInterval(function() {
				$('#header_notification_bar').pulsate({
					color: "#ec2e2b",
					repeat: 4
				}); 
				}, 6000);	
		}
	} //eof if has notifs
     else{
		 
			if(typeof pulsatingInterval !== "undefined") 
		      clearInterval(pulsatingInterval);
	  
	 }
	 
	      if(urgentAhrefs.length == 0) 
	       $.gritter.removeAll();
	}//eof editor
}
     
/*
*
* HTML Newsfeed(s):
*
*/
var HtmlModalNewsFeed = function(){
	 //console.log(functionCode);
  if(localProfile && functionCode){
	$("#editorForm #upd").data( "id", { value: "add"} );
	var data = 'USER=' + localProfile + '&INSTANCE=HTHACKNEY' + '&FUNCTION=' + functionCode;
	//foreach notification
	$.getJSON( "http://portal.hthackney.com/rest/WEB054L2?callback=?",data )
	 .done(function( json ) {
   $("#newsFeed").html('');
   if(functionCode === "SPLASH PAGE")
       $('#NewsModal .newsLabel').text("Home Page Newsfeed");		
   else   
       $('#NewsModal .newsLabel').text($(".page-title:first").text() + " Newsfeed");		
	 
	if(json.length > 0){
      
	 if(editor == 'Y'){	 
	
	var icon = '';
	 $.each(json, function(k ,v){//#newsFeed .newsForm
	  //console.log(v.PKEY);
	   if(v.FUNCTION === "*GENERAL")
		    icon = '<span class="label label-icon label-info"><i class="fa fa-bullhorn"></i></span>';
	   else
		    icon = '<span class="label label-icon label-warning"><i class="fa fa-feed"></i></span>';
       if(v.URGENT === 'Y')
			icon = '<span class="label label-icon label-danger"><i class="fa fa-bolt"></i></span>';

		var news = '<div class="row"><div class="msgr hidden"></div><form class="newsForm editorForm"><div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 remove-padding"> <button type="submit" id="del" class="del btn btn-danger btn-sm btn-right" title="Delete?" onclick="return false" data-toggle="confirmation-popout" value="delete">&#10006;</button>'+
				'<button type="submit" id="upd" class="upd edit btn btn-info btn-sm btn-right none disabled" title="Save News Feed" value="edit"><i class="fa fa-save" aria-hidden="true"></i></button>' +
				icon + '<label class="control-label xs-small">PKEY: '+v.PKEY +'</label><input type="hidden" name="PKEY" class="pkey" value="'+v.PKEY+'"/><br>'+
				'<label class="left control-label mr10 xs-small">TITLE:</label></div><div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 remove-padding">' +
				'<input type="text" id="title" title=" Title is required" class="left both form-control-inline" name="TITLE" size="100" maxlength="100" style="max-width: 250px" value="'+toMarkdown(v.TITLE)+'" required></div><div class="mt10 col-lg-12 col-md-12 col-sm-12 col-xs-12 remove-padding">' +
				'<label class="left control-label mr10 xs-small">PAGE: </label></div><div class="col-lg-9 col-md-9 col-sm-6 col-xs-12 remove-padding"><select id="PAGE" name="PAGE" class="page list-shell xs-small" required>';
				if(v.FUNCTION === "*GENERAL")
				   news += '<option value="*GENERAL" selected>*GENERAL</option><option value="'+ functionCode +'">'+functionCode+'</option>'; 			   
                else		
                   news += '<option value="'+ v.FUNCTION +'" selected>'+v.FUNCTION +'</option><option value="*GENERAL">*GENERAL</option>';         					
		news +=	'</select></div><div class="mt10 col-lg-12 col-md-12 col-sm-12 col-xs-12 remove-padding"><label class="control-label mr10 xs-small">MARKDOWN/HTML:</label>' +
				'<div class="html" data-provide="markdown-editable" title="Content is required">' +   toMarkdown(v.HTML) + '</div><br><em>NOTE: Add/delete/edit news feeds using the boostrap toolbar</em><br><a href="https://gist.github.com/jonschlinkert/5854601" target="_blank">See Examples for bs Markdown Editor Here</a><br>eg: # h1 Heading, ## h2 Heading, ### h3 Heading, *Italics text*<br><br>'+
                '<div class="mt10 details col-lg-12 col-md-12 col-sm-12 col-xs-12"><div class="col-lg-4 col-md-4 col-sm-4 col-xs-12"><label class="control-label mr10 xs-small">Start</label>' +
				'<input type="text" class="dp form-control-inline" name="STARTDATE" value ="' + v.STARTDATE + '" title="Start Date is required" required><div class="clearfix"></div><label class="control-label xs-small mr20">End</label><input type="text" class="dp form-control-inline" name="ENDDATE" value ="'+ v.ENDDATE  +'" title="End Date is required" required></div> ' + 	
			    '<div class="col-lg-4 col-md-4 col-sm-4 col-xs-6 mt5"><div class="half-shell margin-auto"> <label class="h4 xs-small">Auth List</label><label class="h5 checkbox pl0 xs-small"><input name="AUTHLST" type="checkbox" value="H" onclick="return false"';
				if(v.AUTHLST.indexOf('H') > -1)
					news += ' checked';
        news += '>&nbsp;Associate</label><label class="h5 checkbox pl0 xs-small"><input name="AUTHLST" type="checkbox" value="U" onclick="return false"';
              	if(v.AUTHLST.indexOf('U') > -1)
					news += ' checked';	
	    news += '>&nbsp;Customer</label><label class="h5 checkbox pl0 xs-small"><input name="AUTHLST" type="checkbox" value="V" onclick="return false"';
				if(v.AUTHLST.indexOf('V') > -1)
					news += ' checked';
		news += '>&nbsp;Vendor</label><label class="h5 checkbox pl0 xs-small"><input name="AUTHLST" type="checkbox" value="S" onclick="return false"';
		        if(v.AUTHLST.indexOf('S') > -1)
					news += ' checked';
		news += '>&nbsp;Security</label></div></div>' +
	            '<div class="col-lg-4 col-md-4 col-sm-4 col-xs-6"><div class="half-shell margin-auto"><label class="h5 checkbox xs-small"><input name="ARCHIVE" type="checkbox" title="Archive is required when Active on Archive is checked" value="Y"';
                if(v.ARCHIVE == 'Y')	
                   news += ' checked';					
		news += '>&nbsp;Archive</label><label class="h5 checkbox xs-small">' +
	            '<input id="active" name="ACTIVE" type="checkbox" value="Y"';
				 if(v.ACTIVE == 'Y')	
                   news += ' checked';
		news += '>&nbsp;Active on Archive?</label><label class="h5 checkbox xs-small"><input name="URGENT" type="checkbox" value="Y"';
		         if(v.URGENT == 'Y')	
                   news += ' checked';
		news += '>&nbsp;Urgent</label><input type="hidden" class="key" name="PKEY" value="'+v.PKEY+'"/></div></div></div></form></div>';
		$("#newsFeed").append(news).fadeIn('slow');
		 DatePicker();
	  }); //eof each

         DelNews();
		 NewsValidator();
      if($(".editorForm").parent(".row").hasClass("hidden"))
		  $(".editorForm").parent(".row").removeClass("hidden"); 
	 }
	 
   $.each(json, function(k ,v){ //user's .feed
	   if(v.FUNCTION === "*GENERAL")
		   icon = '<span class="label label-icon label-info"><i class="fa fa-bullhorn"></i></span>';
	   else
		   icon = '<span class="label label-icon label-warning"><i class="fa fa-feed"></i></span>';
	    
		var	news = '<div class="feed hidden row"><div class="row title"><div class="col-12 col-md-12 col-sm-12">' + icon + '&nbsp;&nbsp;' +
	           '<label id="te" class="control-label xs-small">'+v.TITLE+'</label><br><br></div>' +
			   '<div class="col-12 col-md-12 col-sm-12"><div id="hl" class="xs-small">'+v.HTML+'</div><br><br><div id="posted"><em class="xs-small">Date Posted: '+ v.STARTDATE + '</em></div></div></div></div></div>';   
		$("#newsFeed").fadeIn('slow').append(news);
		//console.log(news);
	  });
	  
	 if(empty(editor))
		$(".feed").removeClass("hidden");	   
	 }
	 
	 else{
		$("#newsFeed").html("<div class='h4 xs-small'>No Newsfeed for " + nws + " at this time...");
      if(editor === 'Y')
         $(".newsForm").removeClass("hidden");		  
	}
	});//eof done get all newsfeeds
	 
  }
}
var HtmlModalNews = function(){
   if(localProfile && functionCode && actualKey){
	$("#editorForm #upd").data( "id", { value: "edit"} );
	$("#newsForm .loading").removeClass("hidden");
	var data = 'USER=' + localProfile +
		'&INSTANCE=' + functionCode +
		'&PKEY=' + actualKey;
  
	$.getJSON( "http://portal.hthackney.com/rest/WEB054L?callback=?",data )
	 .done(function( json ) {
           var title = '';
		 if(/^Y$/i.test(editor)){
			//CRUD capable
			$("#pkey").html("&nbsp;PKEY: " + json.PKEY);
			$("input[name='PKEY']").val(json.PKEY);
			if(json.FUNCTION === "*GENERAL"){  
			    $('select[name="PAGE"] option[value="*GENERAL"]').attr("selected",true);
			}else{
				$('select[name="PAGE"]').find('option[value="'+ json.FUNCTION +'"]').attr("selected",true);
			 }
         
			$('<label class="control-label xs-small" style="margin: 10px 0px 0px 0px">HTML: </label>').insertBefore('#editorForm .btn-group:first').addClass("left");
			$(".editorForm").find('.md-input').val(json.HTML);
			$("#title").val(json.TITLE);
			//handles Authorization List for feed
			var authlistArray = json.AUTHLST.split(','); 
			$.each(authlistArray, function (index, value) {
				  $('input[name="AUTHLST"][value="' + value + '"]').prop("checked", true);
			 });	
			 //dates
			 $('input[name="STARTDATE"]').val(json.STARTDATE);
			 $('input[name="ENDDATE"]').val(json.ENDDATE);
			 //console.log(json.FUNCTION);	
			 if(/^Y$/i.test(json.ARCHIVE))
				$('[name="ARCHIVE"]').prop("checked", true);
			 if(/^Y$/i.test(json.ACTIVE))
				$('[name="ACTIVE"]').prop("checked", true);
			 if(/^Y$/i.test(json.URGENT))
				$('input[name="URGENT"]').prop("checked", true);
			 if($('.newsForm').parent(".row").hasClass('hidden')){
			    $(".newsForm").parent(".row").removeClass("hidden");	
			 $(".feed").addClass('hidden');
		     }
		 else{
			  $(".newsForm").parent(".row").addClass("hidden");	
			 $(".feed").removeClass('hidden');
		}

		    DatePicker();
			DelNews();
		 }  
		 else{	
			if($(".feed").hasClass("hidden"))
		   $(".feed").removeClass("hidden");
		 }
		 
		 //modal-headers				 
		 if(json.FUNCTION === "*GENERAL"){
			if(json.URGENT === "Y"){
				$('.newsLabel').text('General Announcement: Urgent!');
			 $('.title').addClass("alert-bg");
			 title = '<span class="label label-icon label-danger"><i class="fa fa-bolt"></i></span>' +json.TITLE;
			}
			else{	
				$('.newsLabel').text('General Announcement');
		        title = '<span class="label label-icon label-info"><i class="fa fa-bullhorn"></i></span>' +json.TITLE;
		    }
		 }
		 else{
			if(json.URGENT === "Y"){ 
				$('.newsLabel').text('Page Enhancement: Urgent!');
			    $('.title').addClass("alert-bg");
				title = '<span class="label label-icon label-danger"><i class="fa fa-bolt"></i></span>' +json.TITLE;
			}else{	
				$('.newsLabel').text('Page Enhancement');						
			    title = '<span class="label label-icon label-warning"><i class="fa fa-feed"></i></span>' +json.TITLE;		  
		    }
         }			 
			 
		  //general user news
		 $("#hl").html(json.HTML);
		 $("#te").html(title);
		 $("#posted").html("<em class='xs-small'>Date Posted: " + json.STARTDATE + "</em>");					
	});
   }
}
/* 
*
* Editor eventHandlers:
*
*/
var DatePicker = function(){
	// Date Range
	if (jQuery().datepicker) {
		$(".newsForm input[name='STARTDATE']").datepicker({
	  showOn: "button",
	  buttonImage: "/images/calendar.png",
	  buttonImageOnly: true,
	  buttonText: 'Select a start date',
	  changeMonth: true,
	  changeYear: true, 
	  beforeShow: function() {
		  setTimeout(function(){
			  $('.ui-datepicker').css('z-index', 100100);
		  }, 0);
	  },
	   onSelect: function(date){

        var selectedDate = new Date(date);
        var msecsInADay = 86400000;
        var endDate = new Date(selectedDate.getTime() + msecsInADay);

        $(".newsForm input[name='ENDDATE']").datepicker( "option", "minDate", endDate );
        $(".newsForm input[name='ENDDATE']").datepicker( "option", "maxDate", '+4y' );

    },
	  minDate: '-10m', // The min date that can be selected, i.e. 30 days from the 'now'
	  maxDate: '+200m'  // The max date that can be selected, i.e. + 1 month, 1 week, and 1 days from 'now'
	  //                       HR   MIN  SEC  MILLI 
	  //new Date().getTime() + 24 * 60 * 60 * 1000)
	}).datepicker();
	$(".newsForm input[name='ENDDATE']").datepicker({
		  showOn: "button",
		  buttonImage: "/images/calendar.png",
		  buttonImageOnly: true,
		  changeMonth: true,
		  changeYear: true, 
		  beforeShow: function() {
			  setTimeout(function(){
				  $('.ui-datepicker').css('z-index', 100100);
			  }, 0);
		  }//,
		 // minDate: '-10m', // The min date that can be selected, i.e. 30 days from the 'now'
		 // maxDate: '+200m'  // The max date that can be selected, i.e. + 1 month, 1 week, and 1 days from 'now'
	}).datepicker();		
  }
}

var NewsValidator = function(){
	$('.newsForm').not("#editorForm").each(function () {
	  $(this).submit(function(e){e.preventDefault();
	  if($(this).valid()){
	  var key = $(this).find(".pkey").val();
	  EditNews(key);  
	  }
	  }).validate({});
	 //console.log($(this).find(".pkey").val());
	  $(this).find('[name="AUTHLST"]').rules('add',{required:true});
	   $(this).find('[name="ARCHIVE"]').rules('add',{required: {
	   depends: function(){
	   if($(this).find('[name="ACTIVE"]').is(":checked"))
		   return true;
	   else
		   return false;
	   }
	   }
	   });
    });
}
var NewsValidation = function(){
	var form = $('#newsForm');
    var FormError = $('#newsForm .alert-danger',form);
   	var success = $('#newsForm .alert-success',form);
	
		  //Variables created without the keyword var, are always global, even if they are created inside a function.
     $('#editorForm').submit(function(e){e.preventDefault();}).validate({
		focusInvalid: false, // do not focus the last invalid input
		onkeyup: false,	
		//ignore: ".ignore", //required for hidden input validation ie: hiddenRecaptcha
		rules:{
			"TITLE": {
           	 	required: true, 				
   	    	},
   	    	"HTML": {
   	   	    	required: true
   	    	},
       	 	"AUTHLST": {
          	 	 required: true
			},
			"ARCHIVE": {
				 required: {
                depends: function(){
                   if($("#editorForm #active").is(':checked'))
						return true;
				   else
					    return false;
                }
            }
		   },
			"STARTDATE": { 
                required: true, 
                HTH_dateUSA: true,
                HTH_dateRange: ['<=',$('input[name="ENDDATE"]').val()]
        	},
			"ENDDATE": { 
                required: true, 
                HTH_dateUSA: true,
                HTH_dateRange: ['>=',$('input[name="STARTDATE"]').val()]
        	} 			
    	},
    	messages: { // custom messages for form validation input
       		   "TITLE": {
       	   		 	required: "The TITLE will also be displayed in notification area so make sure to be clear and concise. " +
					"eg: Server Maintenance: Fri 5-7pm CT 08/28/2016"
    	   	   },
    	   	   "HTML": {
					required: "The HTML secton is where the actual content is saved" 		 
    	   	   },
    	   	   "ARCHIVE": {
       	   		required: "Archive must be checked if news item is to be active on archive"
    	   	   },
			   "AUTHLST": {
				required: "At least one usertype is required"
			   },
			    "STARTDATE": {
        		required: "Start Date is required.",
        		HTH_dateUSA: "Start Date must be a valid date in mm/dd/yyyy format.",
        		HTH_dateRange: "Start Date cannot be before End Date"			
            },
			 "ENDDATE": {
        		required: "End Date is required.",
        		HTH_dateUSA: "End Date must be a valid date in mm/dd/yyyy format.",
        		HTH_dateRange: "End Date cannot be before Start Date"			
            }
     	},
     	showErrors: function(errorMap, errorList) {
            // Clean up any tooltips for valid elements
            $.each(this.validElements(), function (index, element) {
            	element = $(element);
                NoError_ToolTip(element);
            });
            // Create new tooltips for invalid elements
            $.each(errorList, function (index, error) {
                element = $(error.element);
                message = error.message;
                Error_ToolTip(element,message);
            });
        },  				
		invalidHandler: function (event, validator) { //display error alert on form submit     
        	success.hide();
            $(document).scrollTop( $(".noscroll-modal-body").offset().top ); 
      	},
		 submitHandler: function () {

			if($("#editorForm #upd").data("id").value === "edit"){
			    var key = $("#editorForm").find(".pkey").val();
				EditNews(key);
			}
			if($("#editorForm #upd").data("id").value === "add"){
			    AddNews();
			}
			
		    return false;
	    }
    });
	
    $(":input:not(textarea)").trimInput();
	   
}	
var HtmlMarkdown = function(){
	 $("#html5").markdown({ 
    			  onShow: function(e){
    				     //hide buttons
    				     $("[data-handler=bootstrap-markdown-cmdItalic]").hide();
    					 $("[data-handler=bootstrap-markdown-cmdImage]").hide();
    					 $("[data-handler=bootstrap-markdown-cmdBold]").hide();
    					 $("[data-handler=bootstrap-markdown-cmdList]").hide();
    					 $("[data-handler=bootstrap-markdown-cmdHeading]").hide();
    					 $("[data-handler=bootstrap-markdown-cmdUrl]").hide();
        						
       
    			  }
    		});
}

var EditNews = function(key){
	   var pkey = $('.editorForm').find('input[value="' + key +'"]');
    	 var div = pkey.closest(".newsForm");
		 var msgr = div.closest(".row").find(".msgr");
		 div.addClass("hidden");
		 msgr.html("<div class='col-lg-12 col-md-12 col-xs-12 col-sm-12'>" + 
		 "<div class='loading'><div class='caption xs-small margin-auto'>Updating record " + pkey.val() + "...</div><img src='/images/loading.gif' alt='loading'>" +
		 "</div></div>");
	 	  msgr.removeClass("hidden");
	    var html = div.find(".md-preview").html();
        html = html.replace(/\s\s+/g, ' ');
		var html5 = html.replace(/(?:\r\n|\r|\n)/g, '<br>');
	   // html5 = html5.replace(/(?:\r\n|\r|\n)/g, '<br>');
		//alert(html5);
	    var arc = div.find("input[name='ARCHIVE']:checked").val();
	    if(empty(arc))
		   arc = '%20';
		var act = div.find("input[name='ACTIVE']:checked").val();
	    if(empty(act))
		   act = '%20';
	    var urg = div.find("input[name='URGENT']:checked").val();
	    if(empty(urg))
		   urg = '%20';
        var page = div.find('select[name="PAGE"] option:selected').val();	
         
	    var data = {USER : localProfile,  
	    INSTANCE : "HTHACKNEY",  
		PAGE : page, 
		PKEY: key,
		TITLE : div.find("input[name='TITLE']").val(), 
		HTML : html5,
		STARTDATE : div.find("input[name='STARTDATE']").val(), 
		ENDDATE : div.find("input[name='ENDDATE']").val(),
		ARCHIVE : arc, 
		ACTIVE : act, 
		URGENT : urg
		};	
		div.addClass("hidden");
		 //console.log(data);
	    $.ajax({
		    type: "POST",
           url:   "http://portal.hthackney.com/rest/web054E?callback=?",
           data:  data,
		   dataType:'jsonp'
	    }).
	    always(function(json){ 
		//  var div = pkey.closest(".newsForm").html("<div class='col-lg-12 col-md-12 col-xs-12 col-sm-12 alert-success'><strong>PKEY: " + pkey.val() + " " + json.SUCCESS + "</strong></div>");	 
	    div.find("input[name='TITLE']").val(json.TITLE);
		div.find("input[name='STARTDATE']").val(json.STARTDATE);
		div.find("input[name='ENDDATE']").val(json.ENDDATE);
	
		if(json.PAGE === "*GENERAL")
			div.find(".page").html('<option value="*GENERAL" selected>*GENERAL</option><option value="'+ json.PAGE +'">'+json.PAGE+'</option>');         	    
		else		
			div.find(".page").html('<option value="'+ json.PAGE +'" selected>'+json.PAGE+'</option><option value="*GENERAL">*GENERAL</option>');  
		if(json.ARCHIVE === 'Y')
		   div.find("select[name='ARCHIVE']").attr("checked", true);
	    if(json.ACTIVE === 'Y')
            div.find("select[name='ACTIVE']").attr("checked", true);
        if(json.URGENT === 'Y')	
			div.find("select[name='URGENT']").attr("checked", true);
		 
		setTimeout(function(){
		$("#newsForm .alert-success").show();
		DtaaraPKey();
		StorageNotifsLinks();
		msgr.addClass("hidden");
		div.removeClass("hidden").fadeIn('slow');
		$(document).scrollTop( div.offset().top );
	    },2000);

	   });
}
var AddNews = function(){
     $(".alert-success").hide();
	 $(".alert-danger").hide();
	var authlst = [];
	   //for each checkbox checked in authlst
		$('#editorForm [name="AUTHLST"]').each(function() {
			if($(this).is(":checked"))
			   authlst.push($(this).val());
		});
	   //only join object if more than one checked
       if(authlst.length > 1) 
	       authlst = authlst.join(',');
	 
	   var authStr = authlst.toString();
	       authStr = $.trim(authStr);
		   
		// html5 = html.replace(/"/g, "\"");
		var html = $("#editorForm").find(".md-preview").html();
        html = html.replace(/\s\s+/g, ' ');
		var html5 = html.replace(/(?:\r\n|\r|\n)/g, '<br>');
	   //alert(html5);
	   var arc = '%20';
	   if($("#editorForm").find("input[name='ARCHIVE']").is(':checked'))
	      arc = 'Y';
	   var act = '%20';
	   if($("#editorForm").find("input[name='ACTIVE']").is(':checked'))
	      act = 'Y';
	   var urg = '%20';
	   if($("#editorForm").find("input[name='URGENT']").is(':checked'))
	      urg = 'Y';
       var page = $('#PAGE option:selected').val();	
       //  console.log(page);
	   var data = {USER : localProfile,  
	    INSTANCE : "HTHACKNEY",  
		PAGE : page, 
		TITLE : $("input[name='TITLE']").val(), 
		HTML : html5,
		STARTDATE : $("#editorForm").find("input[name='STARTDATE']").val(), 
		ENDDATE : $("#editorForm").find("input[name='ENDDATE']").val(),
		ARCHIVE : arc, 
		ACTIVE : act, 
		URGENT : urg, 
	    AUTHLST : authStr
		};	
		 //console.log(data);
	   $.ajax({
		    type: "POST",
           url:   "http://webservices.hthackney.com/web054S?callback=?",
           data:  data,
		   dataType:'jsonp'
	   }).
	   done(function(json){ 
	 
	   if($.trim(json.PKEY) !== ""){
		  $("#newsForm .loading").removeClass("hidden");
	   $("#newsForm .loading .caption").html("News record successfully added!&nbsp;&nbsp;Updating WBPCHANG User Records...");  
    	  var data2 = {
		USER : localProfile,  
	    INSTANCE : "HTHACKNEY",  
		PAGE : page, 
		PKEY : json.PKEY, 
	    AUTHLST :  authStr};
		  //console.log(data2);
	   $.ajax({
		    type: "POST",
           url:   "http://webservices.hthackney.com/web054UA?callback=?",
           data:  data2,
		   dataType:'jsonp'
	   }).
	   done(function(json){
	    $("#newsForm .loading .caption").html("News record successfully added!&nbsp;&nbsp;Updating WBPCHANG User Records...");  
		$("#editorForm input[type='text']").val('');
		$("#editorForm input[type='checkbox']").attr("checked",false);
		$("#editorForm .md-input").val('_Enter new announcement here_');
		$("#editorForm .md-preview").html('<p><em>Enter new announcement here</em></p>');
        setTimeout(function(){
		$("#newsForm .loading").addClass("hidden");
		$("#newsForm .alert-success").show();
		 }, 2000);
		DtaaraPKey(); 
	    setTimeout(function(){
			 HtmlModalNewsFeed();
			 StorageNotifsLinks();
		}, 4000);
	   });
	   
	   }
	   else{
		$("#newsForm .alert-danger").show().html("The News item had some errors. Please try again.");
	   }
	   }).
	   fail(function(){
		   function bad(){
		   $("#newsForm").html("<div class='h4 msg xs-small text-center' style='font-weight: 400;'>we're sorry!<br><br><br><br><span class='text-danger'>unfortunately this inquiry cannot be processed at this time." +
		   "<br>please try again at a later time or give us a call at:</span><br><br>+1.800.406.1291</div><br><br><br><br><br><br>"+
					'<div class="caption right">'+
					'<a href="index.php" id="defaultactionbutton" class="btn btn-success">home&nbsp;<i class="fa fa-home"></i></a>'+
					'</div>');
		   }
		   setTimeout(bad, 1200);
	   });	
}
var DelNews = function(){
	$('[data-toggle=confirmation-popout]').confirmation({ 
		popout: true, 	
		singleton: true,
		placement:'bottom', 
		btnOkClass: 'btn-small btn-success mr5',
		btnCancelClass: 'btn-small btn-warning',
		onConfirm: function(){
		 var pkey = $(this).closest(".newsForm").find(".pkey");
		 var data = {USER:  localProfile, 
	            INSTANCE: "HTHACKNEY",
				PKEY:  pkey.val()};
	//alert(JSON.stringify(data));
    $.ajax({
	type: 'GET', // prefered to GET when updating/deleting records
	url: 'http://portal.hthackney.com/rest/WEB054D?callback=?',  // RPG program in HTHREST library
	data: data, // loaded above
	contentType: "application/json; charset=utf-8",
	dataType: "jsonp"}).
	done(function(json){		
	if(!empty(json.SUCCESS)){
	    var div = pkey.closest(".newsForm").html("<div class='col-lg-12 col-md-12 col-xs-12 col-sm-12 alert-success'><strong>PKEY: " + pkey.val() + " " + json.SUCCESS + "</strong></div>");
         DtaaraPKey();		 
		 StorageNotifsLinks();	 
	setTimeout(function(){
		div.parent(".row").fadeOut('slow');
		
	},1600);
	setTimeout(function(){
		$("#NewsModal").modal('hide');
	},400);
	
	} 
	else{
			$("#newsForm .alert-danger").show().html("The News item had some errors. Please try again.");
		}
	});
		}//eof Confirm
	});		
}
var VisitedNews = function(){
	//trigger this on modal_news ready() in News.triggerNews()
	var data = {USER:  localProfile, 
                PKEY:  actualKey,
	            INSTANCE: "HTHACKNEY"};
	//alert(JSON.stringify(data));
    $.ajax({
	type: 'GET', // prefered to GET when updating records
	url: 'http://portal.hthackney.com/rest/WEB054V?callback=?',  // RPG program in HTHREST library
	data: data, // loaded above
	contentType: "application/json; charset=utf-8",
	dataType: "jsonp"}).
	done(function(data){		 
	   if(data.SUCCESS) 
		   StorageNotifsLinks();
	   else 
		  $(".alert-danger").val(data.ERROR).show();
	}).
	fail(function(){
	   $(".shell").html("<div class='h5 msg xs-small text-center' style='font-weight: 400;'><br>We're Sorry!<br><br><br><br><span class='text-danger'>Unfortunately this inquiry cannot be processed at this time." +
	   "<br>Please try again at a later time or give us a call at:</span><br><br>+1.800.406.1291</div><br><br><br><br><br><br>"+
				'<div class="caption right">'+
				'<a href="index.php" id="defaultActionButton" class="btn btn-success">Home&nbsp;<i class="fa fa-home"></i></a>'+
				'</div>');			 
	});
}
var HandleNews = function(){ 
	$('#newsForm').on('click','.btn-primary', function(event){
	 var btn = $(this).closest(".newsForm").find(".upd");

	 if(btn.hasClass("disabled"))
		btn.removeClass("disabled");
	 else
		btn.addClass("disabled");
	});
 }
 //lets force a reload of notifs when user is idle for 30mins
 //http://stackoverflow.com/questions/667555/detecting-idle-time-in-javascript-elegantly
 //http://jsfiddle.net/q8wLuLbw/
 
var StartIdler = function(){
	
	setIdleTimeout(900000, function() {
		console.log("sessionstorage before dtaara = " +sessionStorage.getItem('myNewsKey'));
		DtaaraPKey(); 
		console.log("Idle before latestnews cookie = " + $.cookie('latestNewsKey')+ "\n sessionmynewskey=" + sessionStorage.getItem('myNewsKey') + " cookieVal=" + cookieVal + " myNewsKey=" + myNewsKey);

		//ensures news gets updated when user leaves session open or changes tabs
		if(myNewsKey != cookieVal  || cookieVal !== sessionStorage.getItem('myNewsKey') || empty(notifs) || $.cookie('latestNewsKey') != sessionStorage.getItem('myNewsKey') || empty($.cookie('latestNewsKey')) || empty(sessionStorage.getItem('myNewsKey'))){			
		 //console.log("Idle after latestnews cookie = " + $.cookie('latestNewsKey')+ "\n sessionmynewskey=" + sessionStorage.getItem('myNewsKey') + " cookieVal=" + cookieVal + " myNewsKey=" + myNewsKey);
		 sessionStorage.setItem('myNewsKey', $.cookie('latestNewsKey'));		
		 myNewsKey = sessionStorage.getItem('myNewsKey');
		 console.log("myNewsKey =" + myNewsKey + " and sessionstorage myNewsKey = " + sessionStorage.getItem('myNewsKey'));
		 StorageNotifsLinks();
		}
	}, function() {
    console.log("Welcome back!");
	});
	
    function setIdleTimeout(millis, onIdle, onUnidle) {
    var timeout = 0;
    $(startTimer);

    function startTimer() {
        timeout = setTimeout(onExpires, millis);
        $(document).on("mousemove keypress", onActivity);
    }
    
    function onExpires() {
        timeout = 0;
        onIdle();
    }

    function onActivity() {
        if (timeout) clearTimeout(timeout);
        else onUnidle();
        //since the mouse is moving, we turn off our event hooks for 1 second
        $(document).off("mousemove keypress", onActivity);
        setTimeout(startTimer, 1000);
    }
}
}

 
// Handles scrollable contents using jQuery SlimScroll plugin.
var HandleScroller	= function () {
    
	$("#notifs").slimscroll({destroy:true});
				  
	var notes = $("#notifs");
    var height = notes.css("height");
	if($('#notifs .nws').size() < 5 && $('#notifs .nws').size() != 0)
        height = $('#notifs .nws').size() * 40 + 22;
	else	   
		height = 182;
	if($('#notifs .nws').size() == 0)
		height = 0;
	
	$("#notifs").slimScroll({
		size: '10px',
		color: '#a1b2bd',
		railColor:'#272727',
		position: 'right',
		height: height,
		alwaysVisible: true,
		railVisible: true,
		disableFadeOut: true
	});

}

var EventEditor = function() {
	if(editor === "Y"){		
		$("#newsForm .slides").removeClass("hidden");
		HandleNews();
		NewsValidation();
		ToggleEditor();
	}
}
var ToggleEditor = function(){
	 $(".cmn-toggle-round").on("change", function() {
		  if($(".newsForm").parent(".row").hasClass('hidden')){
			 $(".newsForm").parent(".row").removeClass("hidden");	
			 $(".feed").addClass('hidden');
		 }
		 else{
			 $(".newsForm").parent(".row").addClass("hidden");	
			 $(".feed").removeClass('hidden');
		}
	});
}
/*
*
*News app section
*
*/
    return {

        //on login. If user leaves session open. it will update notifs after midnight
        initProfile: function (user, edit) {
			if(user.length > 0){
				sessionStorage.clear();
			    localStorage.clear();
				localStorage.setItem('profile', user);
				localProfile = localStorage.getItem('profile');
				localStorage.setItem('editor', edit);
				editor = localStorage.getItem('editor');
				StorageNotifsLinks();	
			}        			
	    },  
		triggerNotifs: function(user, pathInstance){	   
		    //set user profile
		    if(localProfile !== user && user !== ""){
				 SetProfile(user);
				// alert("setting profile");
			}
			if(user === ""){
					sessionStorage.clear();
			        localStorage.clear();
			}
			
			if(localProfile){
				functionCode = decodeURIComponent(pathInstance);
				// console.log("TriggerNotifs before latestnews cookie = " + $.cookie('latestNewsKey')+ "\n sessionmynewskey=" + sessionStorage.getItem('myNewsKey') + " cookieVal=" + cookieVal + " myNewsKey=" + myNewsKey);
			    
				//ensures news gets updated when user leaves session open or changes tabs
				if(cookieVal !== sessionStorage.getItem('myNewsKey') ||  myNewsKey != cookieVal ||empty(sessionStorage.getItem('notifs')) || $.cookie('latestNewsKey') !== sessionStorage.getItem('myNewsKey') || empty($.cookie('latestNewsKey')) ||empty(sessionStorage.getItem('myNewsKey'))){			
				    DtaaraPKey();
                    sessionStorage.setItem('myNewsKey', $.cookie('latestNewsKey'));		
	                myNewsKey = sessionStorage.getItem('myNewsKey');    
					//console.log("TriggerNotifs after latestnews cookie = " + $.cookie('latestNewsKey')+ "\n sessionmynewskey=" + sessionStorage.getItem('myNewsKey') + " cookieVal=" + cookieVal + " myNewsKey=" + myNewsKey);
					StorageNotifsLinks();
				}
				else{
					//Typical notifs display				
					HtmlNotifs();
                }	
                $("#notifs").css("height", "222px");	
				   setTimeout(function(){
					HandleScroller();
				 }, 1200);
				 //update notifs when user inactive for 30 minutes
				 StartIdler();
				 $('#NewsModal').on('hidden.bs.modal', function (e) {
					$(".newsLabel").text('');
					$("#newsForm").html('<div class="loading"><span class="caption">Loading...</span><img src="/images/loading.gif" alt="loading"></div>');
				 });
			}   		
		},
		destroyStorage: function(){
			sessionStorage.clear();
			localStorage.clear();
		},
		triggerNews: function(pkey){						
			actualKey = pkey;	
			//display modal_news content
			HtmlModalNews();
			HtmlMarkdown();
			//WBPCHANG VISTED = "Y" 
			VisitedNews();
			EventEditor();
		},
		triggerNewsFeed: function(){
			HtmlModalNewsFeed();
		    EventEditor();
		}
    }; 
     
	function empty(e) {
	  switch (e) {
		case "":
		case 0:
		case "0":
		case null:
		case false:
		case typeof this == "undefined":
		  return true;
		default:
		  return false;
	}
}
  
}();    

String.prototype.dotdotdot = function(len) {
	if(this.length > len){
		var temp = this.substr(0, len);
		temp = $.trim(temp);
		temp = temp + "...";
		return temp;
	}
	else
		return $.trim(this);
};
            