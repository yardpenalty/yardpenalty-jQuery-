var Events = Events || function(){
	 var user;
	 var functionCode = '';
	 var fscode ='';
	 var eventName = ''; //used for spreadsheet only
	 var noEvents = false;
	 var isLocked = true;
	 var attendeetotal = '0';
	 var recordstotal = '0';
     var allWhse = ''; //used for custretrieval
     var warehouse = ''; //used for global selections
     var hasWarehouses = false; //custretrieval option available
	// var hasCustWarehouse = false; //no chains
	 var justCust = false; //if true no edits available 
     var SqlWhereFilter_ATTEND = '';  // used for spreadsheet
	 var hasAuth = false; //power user
	 var qtime = false;
	 var isX = false; //remove all from event
	 var load = true; //web055S
	 var reload = false; //web055S2
     var validCusts = false; //customer selection - Ajax
    /***************************************************************************************
    Loads 2 DropDown Menus for Food Show / Quality Time Events  
    ***************************************************************************************/
   var DropDownMenus = function(){
	   var data = 'USER='+user+'&INSTANCE=HTHACKNEY&FUNCTION='+ functionCode;
	   $.getJSON( "http://portal.hthackney.com/rest/WEB055L",data )
	   .done(function(json){
	     // Corp Sys Error or Event dropdowns?
	     if(typeof json.ERROR === "undefined"){ //No error (remote access available)
	   	 var eventQT = '<option value="Q" title="Please select Quality Time by location">Quality Time Events</option>';
	   	 var lockQt = true;
          //json to select options
	      $.each(json, function(k ,v){
	   	   var option = '<option ';
	   	   if(v.CODE === "Q"){
	   		   if(v.QTLOC !== ""){
	   	        	  if(v.LOCKED === "Y"){ 
						   if(v.SELECTED === "Y") {
								option += ' value="' + v.QTLOC + '" title="This event is currently locked!" class="locked" selected>' + toTitleCase(v.QTLOC) + '***LOCKED***</option>';
								 qtime = true;
								 isLocked = true;
								 eventName = "Quality Time - " +toTitleCase(v.QTLOC);
						   }else		
								option += ' value="' + v.QTLOC + '" title="This event is currently locked!" class="locked">' +toTitleCase(v.QTLOC) + '***LOCKED***</option>';
					  }else{
	   			         lockQT = false;
						 if(v.SELECTED === "Y"){
	   	        		    option += ' value="' + v.QTLOC + '" class="unlocked" title="' +toTitleCase(v.QTLOC) + '" selected>' +toTitleCase(v.QTLOC) + '</option>'; 
					        qtime = true;
							isLocked = false;
							eventName = "Quality Time - " +toTitleCase(v.QTLOC);
						 }else
						     option += ' value="' + v.QTLOC + '" class="unlocked" title="' +toTitleCase(v.QTLOC) + '">' +toTitleCase(v.QTLOC) + '</option>'; 	 
							
                      } 
	   	              $("select[name='QTIME']").append(option);
	   	        }      
	   	   }
	   	   else{
	   		    if(v.LOCKED === "Y"){
					 if(v.SELECTED === "Y"){
						option += ' value="' + v.CODE + '" title="This event is currently locked!" class="locked" selected>' +toTitleCase(v.EVENT) + '***LOCKED***</option>'; 
						isLocked = true;
                            eventName =toTitleCase(v.EVENT);     
						    eventName = cutoff(eventName,"-");
					 }else
	   			       option += ' value="' + v.CODE + '" title="This event is currently locked!" class="locked">' +toTitleCase(v.EVENT) + '***LOCKED***</option>';
	   			}else{
					 if(v.SELECTED === "Y"){
	   				    option += ' value="' + v.CODE + '" class="unlocked" title="' +toTitleCase(v.EVENT) + '" selected>' +toTitleCase(v.EVENT) + '</option>';   
						isLocked = false;
                        eventName =toTitleCase(v.EVENT);     
						eventName = cutoff(eventName,"-");
					 }else
						option += ' value="' + v.CODE + '" class="unlocked" title="' + toTitleCase(v.EVENT) + '">' +toTitleCase(v.EVENT) + '</option>';   
               }
	   	   	   $("select[name='EVENT']").append(option);
	   	   }	
	      });
	      //Lock all QTIMES if none available
	      if(lockQt === true)
	     	  $("select[name='EVENT']").append('<option value="Q" title="All locations for Quality Time are currently locked!" class="locked">Quality Time Events ***LOCKED***</option>');
	      else
	   	      $("select[name='EVENT']").append(eventQT);
		  //remove default dropdown
	      $("#EVENT").removeClass('hidden');
		   if(qtime === true){//QTIME
				$("select[name='EVENT']").val("Q");
				$("#QTIME").removeClass('hidden');
				  fscode = $("select[name='QTIME'] option:selected").val();
		   }
		   else //EVENT
			   fscode = $("select[name='EVENT'] option:selected").val();
		   //Load table with Store_Default selection if present
		   if($("#EVENT option:selected:not(:disabled)").length != 0 || ($("#EVENT").val() === "Q" && $("#QTIME option:selected:not(:disabled)").length != 0)){
			 $("select option").not(':first-child').each(function (index) {
			 	  $(this).prop('disabled', true);
			 }); 
			 //Initializes dataTables when selected events are present
			  InitAttendeeTable();
			  if(justCust === false && hasWarehouses === true)
			     InitCustRetrievalTable();
		   }	   
		  }
	       else{
			   noEvents = true;
			   PageErrorHandler("#ATTENDEES",json.ERROR);
			   //$("#ATTENDEES .alert-danger").html(json.ERROR);
		   }	
         
	   }).fail(function( jqXHR, textStatus, error ) {
	     	var err = textStatus + ", " + error;
	       alert('Unable to Connect to Server.\n Try again Later.\n Request Failed: ' + err);
	   });  
	   }
/***************************************************************************************
 Intializes oTable.#table_001
***************************************************************************************/	       
   var InitAttendeeTable = function(){
	  // console.log(fscode); 
     if(noEvents === false){ 
        $(".ajax-loader").removeClass("hidden");	 
    	// Food Show Attendee Table Listing
		var oTable1 = $('#table_001').dataTable( {
			"processing": true,
			"serverSide": true,
			"deferRender": true,
			"lengthMenu": [[25,50,100, -1],[25,50,100, 'ALL']], // records pulldown
			"iDisplayLength": 25, // # records to initially display
		    "ajax": {
		    	"url": "http://portal.hthackney.com/rest/WEB055L2",
			    "data": function (d) { // pass additional pameters	    			 
		           			d.user = user;  
		           			d.instance = "HTHACKNEY"; 
		           			d.code = fscode;
		           			d.cols = "15"; // TOTAL <td> tags per <tr> tag  
		           			d.locked = isLocked;
		           			d.power = hasAuth; 
			    },
			    // Load attendee total and pending total sections - or - clear this portlet if empty
			    complete: function (d) {
					//Corp Sys Error or load table_001
					if(d.responseJSON.ERROR !== undefined){
						PageErrorHandler("#attendees",d.responseJSON.ERROR);
					}else{  
		               $("#ATTENDEES .hth_content").removeClass("hidden");
					   // SqlWhereAll_ATTEND = d.responseJSON.SqlWhereAll;
					    if(d.responseJSON.SqlWhereFilter !== undefined) 
 						   SqlWhereFilter_ATTEND = d.responseJSON.SqlWhereFilter; 
					    // recordstotal = d.responseJSON.recordsTotal;
					    if(d.responseJSON.recordsTotal !== undefined)
						   recordstotal = d.responseJSON.recordsTotal;	
						if(d.responseJSON.attendeeTotal !== undefined){
						   attendeetotal = d.responseJSON.attendeeTotal;
						//console.log(JSON.stringify(d.responseJSON.data));
						if ( attendeetotal == '0')  
							$("#totalAttendees").html("No one has signed up for this event yet");
						else 
							$("#totalAttendees").html("Event Total: " +  attendeetotal + " attendees");				    	
					}	
				}	
			}				
	 	    }, 
			// insert code to execute after table has been redrawn
	  	   	"fnDrawCallback": function( oSettings ) {
				$("select option").not(':first-child').each(function (index) {
					$(this).prop('disabled', false);
				}); 
				$(".ajax-loader").addClass("hidden");
				$('#table_001 th').removeClass("sorting_asc");
				 //#customer modal Add/Delete Customers from entry
				 $('#table_001').on('click','.custs', function(e) {
                      $("#customerForm").attr("data-atnid", $(this).attr('id'));
	                  CustomerFormValidation("#customerForm");
			          reload = false;
                      InitCustTable($(this).attr('id'));
				});
			     //#attendee modal Load Attendee  
		        $('#table_001').on("click",'.entry', function(e){
					$("#signupForm .alert").hide();
                     $(".add-attendee").addClass("hidden");
                     load = true;
                     var data = {
                         USER: user,
                         INSTANCE: "HTHACKNEY",
                         FUNCTION: functionCode,
                         FSCODE: fscode,
                         ATNID: $(this).attr("data-atnid"),
                         LTYPE: "L"
                      };
                      $("#signupForm").attr("data-atnid",$(this).data("atnid"));
					  load = true;
					  AttendeeAjax("Loading attendee", data);
		        });
	  	  	   	// Column filtering
	           	var table = $('#table_001').DataTable();
	           	$("#table_001 tfoot th").each( function ( i ) { // i = 0,1...
	               	if($.trim($(this).html()) != '') {
	                   	var save_value = $("#table_001 tfoot th:eq("+i+") input").val();
		               	save_html = $(this).html();
		               	$(this).empty(); 
		           		var select = $(save_html)
		               	.appendTo( this )
		               	.on( 'change', function () {
		               		table.column( i, { filter: 'applied' }).search($(this).val()).draw();
		               	});	
		               	$("#table_001 tfoot th:eq("+i+") input").val(save_value);
	               	} 
	           	}); 
				//enable download button when records exist
				if(!$("#table_001 tbody tr.odd td").hasClass("dataTables_empty")){
					$("#spreadsheet").removeClass("disabled hidden");
					if(hasAuth === true)
					   $("#del-attendees").removeClass("disabled hidden");
					
				}else{
					$("#spreadsheet").addClass("disabled").removeClass("hidden");
					if(hasAuth === true)
					   $("#del-attendees").addClass("disabled").removeClass("hidden");
				}
				//Make event readonly?
				if (isLocked === true && hasAuth !== true){ //ek 01/10/17
					$(".entry").each(function(){
						$(this).addClass("hidden");
					});
					$(".custs").each(function(){
						$(this).addClass("hidden");
					});
					$("#add-attendee").addClass("disabled");		
				}
				else
					$("#add-attendee").removeClass("disabled hidden");
	      	 },
		    "columns": [					// set "data" to next sequential number in double quotes
			        {"data":"0",			// Set "name" to field name that will be referenced
					"name": "skip"},        // in RPG Program. 
		        	{"data":"1", 
					"name": "skip"}, 
		           	{"data": "2",
					"name": "skip"},
	 	  			{"data":"3", 
					"name": "lname"},
					{"data":"4", 
					"name": "fname"},
					{"data":"5", 
					"name": "email"},
					{"data":"6", 
					"name": "buyer"},
		       		{"data":"7", 
					"name": "rooms"},
					{"data":"8",
					"name":"adate"}, 
	                {"data":"9",
	                "name":"ddate"},
	                 {"data":"10",
	                 "name": "whsno"},
	                 {"data":"11",
	                 "name": "custno"},
	                 {"data":"12",
	                  "name": "cusloc"},
	                 {"data":"13",
	                  "name": "cname"},
	                  {"data":"14",
	                   "name": "skip"}
	        ],
	        "columnDefs": [      
	                // what columns should be hidden?       
	        		{
	           		"targets": [1], // what element starting with 0
	            	"class":"hidden" // class to attach to <td>
	            	},
	              	// what columns should NOT be sortable?       
	        		{
	           		"targets": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], // what element starting with 0
	           		"sortable": false, // sortable?
	            	},
	            	// what columns should NOT be searchable?       
	        		{
	           		"targets": [0,1,2,6,7,8,9,12,13,14], // what element starting with 0
	           		"searchable": false, // searchable?
	            	}
	            	// Other items that can be used....
			        //{
			   		//"targets": [0,4], // what element starting with 0
			    	//"data": null, // null to used defaultContent to fill <td>
			    	//"defaultContent": "added by php, ignored by RPG", // what goes into <td>
			    	//"class":"bob", // class to attach to <td>
			    	//"visible": false,  // visible?
			    	//} 
	    	],  
	    	// manipulate the row <tr> being added along with any of the columns <TD> before it is added
	    	"createdRow": function( row, data, dataIndex ) { 
			    //could use this for traversing through rows to find class attr
				//manipulate the specific column in the row   
	    	     //$(row).addClass( 'form-group' ); 
				  // Add a class to the cell in the second column 
				 //$("#table_001 tbody tr").addClass("row");
				 //$("#table_001 tbody tr").addClass("row");
				 $('td', row).eq(6).addClass('text-center'); // Added to <td> 
	             $('td', row).eq(8).addClass('italic'); // Added to <td> 
				 $('td', row).eq(9).addClass('italic'); // Added to <td> 
	    	     $('td', row).eq(2).addClass('form-group'); // Added to <td> 
	    	 },
	      	// Specify initial order    	
	  	   "order": [[ '3', "asc" ],[ '4', "asc" ],[ '5', "asc" ],['10',"asc"],['11',"asc"]] // What is default sort order starting with 0
		});
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// handle 1st page table load initialization
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Specify the columns that should have column search capability (beginning with 0)
		Search_Capable = [10,11];  // simple RPG programming is also required
		//Use this to reload table
		//var oTable1 = $('#table_001').DataTable(); ///load .ajax structure
        //oTable.ajax.reload();
		TableAdvanced.init('table_001','Y');
      }
      else{
    	  $("#ATTENDEES .alert-danger").html("&nbsp;All Events are currently ***LOCKED***").show();
    	  $("#EVENT").hide();  
		  $("#QTIME").hide();
      }
    }
   /***************************************************************************************
   Intializes oTable.#table_003
  ***************************************************************************************/	       
     var InitCustRetrievalTable = function(){
    	oTable = $('#table_003').dataTable( {
   		"processing": true,
   		"serverSide": true,
   		"lengthMenu": [10,25,50,100], // records pulldown
   		"iDisplayLength": 100, // # records to initially display
   	    "ajax": {
   	    	"url": "http://portal.hthackney.com/rest/WEB018L",
   		    "data": function (d) { // pass additional pameters
   	           			d.tot = ""; //data set total - ALWAYS INCLUDE
  	           			d.authwhse = allWhse; //warehouses that this user has complete access to
   	           			d.cols = "8"; // TOTAL <td> tags per <tr> tag  
   		    }
    	    }, 
   		     // insert code to execute after table has been redrawn
     	   	"fnDrawCallback": function( oSettings ) {
				//dynamic binding
				//Trigger #add_cust_btn button on radio selection
				$("#retrievalForm input:radio").each(function(){
				  $(this).addClass("radio-custs");
				});
				$(".radio-custs").on("click",function(){
				   if($(this).is(":checked"))
				  $('#add_cust_btn').trigger('click');
				});
     	  	   	// Column filtering
              	var table3 = $('#table_003').DataTable();
              	$("#table_003 tfoot th").each( function ( i ) { // i = 0,1...
                  	if($.trim($(this).html()) != '') {
                      	var save_value = $("#table_003 tfoot th:eq("+i+") input").val()
   	               	save_html = $(this).html();
   	               	$(this).empty(); 
   	           		var select = $(save_html)
   	               	.appendTo( this )
   	               	.on( 'change', function () {
   	               		table3.column( i, { filter: 'applied' }).search($(this).val()).draw();
   	               	});	
   	               	$("#table_003 tfoot th:eq("+i+") input").val(save_value);
                  	} 
              	}); 	
         	 },
   	    "columns": [					// set "data" to next sequential number in double quotes
   				{"data":"0",			// set "name" to field name in file being SQLed
   				"name": "skip"}, 
   	        	{"data":"1", 
   				"name": "skip"}, 
   	           	{"data": "2",
   				"name": "skip"},
   	 	  		{"data": "3", 
   	       		"name": "whsno"},
    	  			{"data":"4", 
   				"name": "custno"},
   				{"data":"5", 
   				"name": "cusloc"},
   				{"data":"6", 
   				"name": "shpnam"},
   	       		{"data":"7", 
   				"name": "stat"}
           ],
           "columnDefs": [           
                // what columns should be hidden?       
           		{
              		"targets": [1], // what element starting with 0
               	"class":"hidden" // class to attach to <td>
               	},
               	// what columns should NOT be sortable?       
           		{
              		"targets": [0,1,2,3,7], // what element starting with 0
              		"sortable": false, // sortable?
               	},
               	// what columns should NOT be searchable?       
           		{
              		"targets": [0,1,2,3,7], // what element starting with 0
              		"searchable": false, // searchable?
               	}
               	// Other items that can be used....
   		        //{
   		   		//"targets": [0,4], // what element starting with 0
   		    	//"data": null, // null to used defaultContent to fill <td>
   		    	//"defaultContent": "added by php, ignored by RPG", // what goes into <td>
   		    	//"class":"bob", // class to attach to <td>
   		    	//"visible": false,  // visible?
   		       //"searchable": false, // searchable?
   		        //"sortable": false // sortable?
   		    	//} 
       	],  

       	// manipulate the row <tr> being added along with any of the columns <TD> before it is added
       	//"createdRow": function( row, data, dataIndex ) { 
   			//if (data['3'] == 'A') {
   				//$('td', row).eq(4).addClass('grp-header');
   			//}

   			//manipulate the specific column in the row
       	    //if ( data['0'] == "A" ) {
       	      //$(row).addClass( 'important' ); // added to <tr>
       	      //$('td', row).eq(5).addClass('highlight'); // Added to <td>
       	    //}
       	 //},

         	// Specify initial order    	
     	   "order": [[ '6', "asc" ],[ '4', "asc" ],[ '5', "asc" ]] // What is default sort order starting with 0
   	});
   	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   	// handle 1st page table load initialization
   	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   	// Specify the columns that should have column search capability (beginning with 0)
   	Search_Capable = [3,7];  // simple RPG programming is also required
   	TableAdvanced.init('table_003','Y');
       
      }
   
   /***********************************************************************************
    * Handles all events  
    **********************************************************************************/
   var EventHandlers = function(){
	   //EventListener - DropDownMenus 
	   $("select[name='EVENT'], select[name='QTIME']").on("change", function(event){
		 //reset fscode
		 fscode = '';
		 var option = $(this).find('option:selected:not(:disabled)');
		 if(option.hasClass("locked"))
			 isLocked = true;
		 else
			 isLocked = false;
		 $("#ATTENDEES .hth_content").addClass("hidden");  	
		 //reset QTIME dropdown when EVENT Q is selected	
		 if($(this).val() === "Q")
			 $("#QTIME").selectedIndex = 0;
		 //show QTIME dropdown?	
		 if($(this).val() === "Q" || $(this).val().length > 1){ 
		   $("#QTIME").removeClass("hidden");	
		 }else
		   $("#QTIME").addClass("hidden");
	   	 //Food Show gets char code, QTime gets Location
	   	 if(($(this).val() != "0" && $(this).val() !== "Q") || fscode !== ""){   
            Store_Defaults();		 
		    if(event.target.name === "EVENT"){
			   fscode = $(this).val();
				eventName = $('select[name="EVENT"] option:selected').text();   
	            eventName = cutoff(eventName,"-");
			}else{
			  fscode =  $('select[name="QTIME"] option:selected').val();
                var location = $(this).val();  
                eventName = "Quality Time - " + location;
			}
            if(eventName !== "" || eventName != "undefined")
	            eventName = toTitleCase($.trim(eventName));
	   	   	$("select option").not(':first-child').each(function (index) {
			 	  $(this).prop('disabled', true);
			 }); 
			//destroy table if present - used for default load dropdown menu logic
			if($.fn.DataTable.isDataTable('#table_001')){
			   $('#table_001').dataTable().fnDestroy();
				InitAttendeeTable(); 
			}
			else{
				InitAttendeeTable();  	
			}  	

	     }			 
         	 
	   });
	   
	   var removeDefault = $("#customerForm").find("[name='WHSE']");
	   removeDefault.removeClass("hth_default");
	   //remove hth_default inside modals pulldowns
	   $(".event select").each(function(){
		   $(this).removeClass(".hth_default");
	   });
	   //Download spreadsheet
	   $("#spreadsheet").on("click", function(){	
	     var show = encodeURIComponent(eventName);
		 var data = '&USERID=' + user + '&FUNCTION=' + functionCode + '&FSCODE=' + fscode +
		    '&EVENT=' + show + '&ATOTAL=' + attendeetotal + '&ETOTAL=' + recordstotal;
	 
		// console.log(data);
		$("#ATTENDEES").find(".alert-success").html("Creating spreadsheet...").show();
		$.ajax({
			type: 'GET',  
			url:  'http://portal.hthackney.com/phprest.php', 
			data: 'php_script_to_execute=attendeerest'+ data// loaded above
			//timeout:		300000, // max time to wait for response in ms
			}).done(function(data){
				setTimeout(function(){$("#ATTENDEES .alert-success").html('Your spreadsheet is being created in your download folder. Please wait a few minutes and click \'Actions\' to view your downloads.').fadeIn('fast');}, 4000);
			}).fail(function(jqXHR, exception) {
	            if (jqXHR.status === 0)  
	                $("#ATTENDEES .alert-danger").html('Unable to Connect to Server.\n Try again Later.');
	            else if (jqXHR.status == 404) 
	                $("#ATTENDEES .alert-danger").html('Requested page not found. [404]');
	            else if (jqXHR.status == 500) 
	                $("#ATTENDEES .alert-danger").html('Internal Server Error [500].');
	            else if (exception === 'parsererror') 
	                $("#ATTENDEES .alert-danger").html('Requested JSON parse failed.');
	            else if (exception === 'timeout') 
	                $("#ATTENDEES .alert-danger").html('Time out error.');
	            else if (exception === 'abort') 
	                $("#ATTENDEES .alert-danger").html('Ajax request aborted.');
	            else 
	                $("#ATTENDEES .alert-danger").html('Unexpected Error.\n' + jqXHR.responseText);
	       });
	  });
	/***********************************************************************************
	*  .event.modal global
	**********************************************************************************/
	    $('.event.modal').on('hide.bs.modal', function(e){
            //Reset both modal defaults			
			$(this).find(".alert").hide();
			$(this).find(".hth_content").addClass("hidden");
			$(this).find(".loading").addClass("hidden");
			validCusts = false;
			//Don't reset warehouse from custretrieval modal
			if(!$(this).hasClass("custretrieval")){ 
			$(".event select").each(function() { this.selectedIndex = 0 });
            $(this).find("form").removeAttr("data-atnid");
			}
			if($(this).hasClass("custretrieval")){
				var oTable3 = $('#table_003').DataTable();
	            // Removes search filter val                 
				oTable3.search('').columns().search('').draw();
				$(this).find("input[type=search]").val('');
			}
			$('input:radio:checked').prop('checked', false);
			$(this).find("input[type='text']").val('');
			$(this).find("input[type='tel']").val('');
			$(this).find("input[name='DCUST']").val('');
		    $(this).find("input[name='DLOCN']").val('');
		    //reset validation of forms
			$(":input").tooltip("destroy");
			$(":input").removeClass("error");
		    var validator = $(this).find('form').validate();
                validator.resetForm();
		});	

	  $('.event.modal').on('shown.bs.modal', function(e){       
            $(this).find("#evtLabel").text(eventName);
            //$(this).find(".visible-md").removeClass("clearfix");
            //Clear modal errors 
			$(this).find(".loading").addClass("hidden");
			$(this).find(".hth_content").removeClass("hidden");
			 $(".event").each(function(){ 
			    if($(this).attr('data-atnId') === "undefined"){
				$("#attendee input[name='DLOCN']").val('');
				$(this).find("input[name='DCUST']").val('');
				$(this).find("input[name='DLOCN']").val('');
				}
			});
          if(justCust === true && $(this).attr('id') == "customers"){//require associate to have warehouse attached to profile
            var $invoker = $(e.relatedTarget); 
            var msg = "Hackney Associates must attach themselves to a warehouse or chain in order to use this feature";
            PageErrorHandler("#" + $(this).attr('id'), msg);
            $("#" + $(this).attr('id') + " .btn:not(.modal-close)").addClass("hidden");
          }else{
			//Customize Pulldowns
            $(this).find("select").attr("multiple", false);
			//toggler - this modal customer event handler class 
		    $(this).find("select:not([name='WHSE'])").addClass("toggler");
		    $(this).find("input[type=tel]:not(#GOLF)").addClass("toggler");
			$(this).find("input[type=hidden]").remove();
			$(this).find("select[name=GRP]").closest('.form-group').remove();	
            //css edits 
			if($(this).find("select[name='LOCN']").length > 0)
				$(this).find("select[name='LOCN'] option[value='*ALL']").remove();
			//has chain
            if( $(this).find("select[name='CUST']").length > 0){
			    $(this).find("select[name='CUST'] option[value='*CHAIN']").remove();
               $(this).find("select[name='CUST'] option[value='*INDEP']").remove();
			}
			 
            //reset not this select && input type tel
			$(this).on("change focus", ".toggler", function(e){
			    //console.log($(this).attr("name"));
				if($(this).attr("name") !== "DLOCN" && $(this).attr("name") !== "DCUST"){
					$(".event .toggler").not(this).prop("selectedIndex", 0);
					$(".event input[type='tel']:not(#GOLF)").val('');
				}else 
					if($(this).attr("name") === "DLOCN" || $(this).attr("name") === "DCUST") 
						$(".toggler").prop("selectedIndex", 0);		
			   $("#customerForm").tooltip('disable');
			   $("#customerForm").find("span.hth_td_error").removeClass("hth_td_error");
			   $("#customerForm input[type='checkbox']").prop("checked",false);
		   });	
          
			//remove row class in pulldown
            if($(this).find("select[name='LOCN']").length == 0 && $(this).find("select[name='LOCN']").length == 0){
				var div = $(this).find("select[name='WHSE']").closest(".row");	
			    div.removeClass("row");
			}	
           }		
	  });
	    //This trims input when it loses focus
	    $(":input").trimInput();	
        //Reset cust select - dropdowns
	   $(".event select:not([name='WHSE'])").on("change", function(){
		   $("select:not(this)").selectedIndex = 0; 
		   $("input[name='DCUST']").val('');
		   $("input[name='DLOCN']").val('');
		   if($(this).attr('id') === "attendee")
		              validCusts = false;
	   }); 		
	/***********************************************************************************
	*  #attendee .modal 
	**********************************************************************************/
	    //Load #attendee modal based on invoker
		$("#attendee").on("show.bs.modal", function(e){
			var $invoker = $(e.relatedTarget);
			checked = 0;
			AttendeeFormValidation("#signupForm");
			//reset form?
			if ($invoker.attr('id') === "add-attendee"){
			    $("#atnLabel").text("Add New Attendee");
	            $(".add-attendee").removeClass("hidden");
				$(this).find("input[name='DCUST']").val('');
			    $(this).find("input[name='DLOCN']").val('');
				$('#attendee #uniform-buyer').find('span').removeClass('checked');
				$("#attendee #uniform-buyer input[type='checkbox']").prop('checked', false)
				$('#attendee #uniform-KING').find('span').removeClass('checked');
				$("#attendee #uniform-KING input[type='checkbox']").prop('checked', false);
				$('#attendee #uniform-DOUBLE').find('span').removeClass('checked');
				$("#attendee #uniform-DOUBLE input[type='checkbox']").prop('checked', false);
				$('.rooms').addClass('hidden');
				$('.dates').addClass('hidden');
				//if(hasCustWarehouse === true)
				  // $(this).find(".control-label:contains(Chain)").closest(".row").addClass("chainFix");
			}
			else{ //edit/delete attendee
				   $("#atnLabel").text("Attendee Maintenance");
				   //show on ajax load with user update info if present
				   $(".edit-attendee:not(.update)").removeClass("hidden");
				   $(".add-attendee").addClass("hidden");
			}
        });
		//Default hidden fields 
		$("#attendee").on("hidden.bs.modal", function(e){
		    $(".edit-attendee").addClass("hidden"); 
            $(".add-attendee").addClass("hidden"); 
		    $("input[name='DCUST']").val('');
		    $("input[name='DLOCN']").val('');
        });
		//#attendee modal checkboxes resolved here
	   $(".bscheck #buyer").on("click", function(e){
		   e.stopImmediatePropagation();
		   if($(this).is(':checked')){
                 //clear rooms checkboxes				 
				 $('#signupForm #uniform-KING').find('span').removeClass('checked');
		         $("#signupForm #uniform-KING input[type='checkbox']").prop('checked', false);
				 $('#signupForm #uniform-DOUBLE').find('span').removeClass('checked');
		         $("#signupForm #uniform-DOUBLE input[type='checkbox']").prop('checked', false);
				 //clear datepicker vals
				 $("#signupForm #adate").val('');
				 $("#signupForm #ddate").val('');
				 //hide rooms and datepickers
			     $('#signupForm .rooms').removeClass('hidden');	 
		   }else{
			 
                 //clear rooms checkboxes				 
				 $('#signupForm #uniform-KING').find('span').removeClass('checked');
		         $("#signupForm #uniform-KING input[type='checkbox']").prop('checked', false);
				 $('#signupForm #uniform-DOUBLE').find('span').removeClass('checked');
		         $("#signupForm #uniform-DOUBLE input[type='checkbox']").prop('checked', false);
				 //clear datepicker vals
				 $("#signupForm #adate").val('');
				 $("#signupForm #ddate").val('');
				 //hide rooms and datepickers
			     $('#signupForm .rooms').addClass('hidden');
				 $("#signupForm .dates").addClass("hidden"); 
		  }	   
		 
	   });
	    //Select king size bed     
	    $(".bscheck #KING").on("click", function(e){
			  e.stopImmediatePropagation();
	        if($(this).is(":checked")){
		         $(".dates").removeClass("hidden");	
			     $('#signupForm #uniform-DOUBLE').find('span').removeClass('checked');
		         $("#signupForm #uniform-DOUBLE input[type='checkbox']").prop('checked', false);
			 }else{
				 if($("#uniform-DOUBLE").find("span:not(.checked)")){
					//clear datepicker vals
					$("#signupForm #adate").val('');
					$("#signupForm #ddate").val('');
					//hide date fields
					$(".dates").addClass("hidden");
                 }				 
			 }	
	   });
	   //Select double size bed
	   $(".bscheck #DOUBLE").on("click", function(e){
	         e.stopImmediatePropagation();
        	if($(this).is(":checked")){
		        $(".dates").removeClass("hidden");	
			    $('#signupForm #uniform-KING').find('span').removeClass('checked');
			    $("#signupForm #uniform-KING input[type='checkbox']").prop('checked', false);
			 }else{
				  if($("#uniform-KING").find("span:not(.checked)")){
					//clear datepicker vals
					$("#signupForm #adate").val('');
					$("#signupForm #ddate").val('');
					//hide date fields
					$(".dates").addClass("hidden");	
				  }				 
			 }
	   });
		//Show #attendee customer dropdowns 
		$("#add-attendee").on("click",function(){
		     $(".add-attendee").removeClass("hidden");
		});
	   //Reset cust select - direct cust entry
	   $("#signupForm input[name='DCUST']").on("keyup focusout", function(){
		  $("#signupForm select").selectedIndex = 0; 
		  validCusts = false;
	   });
	   //Remove bootstrap 3 checkbox images
	   $("#signupForm input[type='checkbox']").each(function(){
		  var div = $(this).closest(".checker");
              div.removeClass("checker").addClass("inline");
		});
        //Call WEB055S LTYPE = A
		$("#signupForm #add_atn").on("click",function(e){	
           	
			if($("#signupForm").valid()){
				$("#signupForm .alert").hide();
     		   //change warehouse
			   if($("#signupForm select[name='WHSE']").length > 0) 
				   warehouse = $("#signupForm [name='WHSE']").find("option:selected").val();    			 	  	   
			   if(validCusts === false)                
				   CustomerValidation("#signupForm");
			   
			   if(validCusts === true){
			    //ADD ROOMS input - King/Double/No room
                var rooms;
                if($('#signupForm #uniform-KING').find('span').hasClass('checked'))
				 rooms = 1;		
			    else if($('#signupForm #uniform-DOUBLE').find('span').hasClass('checked'))
				 rooms = 2;  
                else
                 rooms = 0;					
			     //ADD BUYER input
                 var buyer;
			     if($('#signupForm #uniform-buyer').find('span').hasClass('checked'))
                    buyer = "Y";  
			     else//remove hotel room if not buyer
				    buyer = ""; 
				//convert pulldowns to args form serialization	 
				var custno = '';
				var cusloc = '';
				if(justCust === true){
					  custno = locnum.substring(0,6);
					  cusloc = locnum.substring(6,9); 						
				}
				else{
				  //Chain
				   if($("#signupForm select[name='CUST'] option:selected").val() !== "*NONE" && $("#signupForm select[name='CUST']").length > 0){
					   custno = $("#signupForm select[name='CUST'] option:selected").val();
					   cusloc = 0;
				   } //Location
				   else if($("#signupForm select[name='LOCN'] option:selected").val() !== "*NONE" && $("#signupForm select[name='LOCN']").length > 0){
					   locn = $("#signupForm [name='LOCN'] option:selected").val();
					   custno = locn.substring(0,6);
					   cusloc = locn.substring(6,9);
					   //console.log(cusloc);
				   }
				   else{//Direct customer entry
						custno = $("#signupForm input[name='DCUST']").val(); 
						cusloc = $("#signupForm input[name='DLOCN']").val();    
						if(cusloc === "")				   
						   cusloc = 0;
				  } 
			   }
			   if(cusloc === "")				   
				   cusloc = 0;  
                var data = {
                   USER: user,
                   FUNCTION: functionCode,
                   INSTANCE: "HTHACKNEY",
                   LTYPE: "A",
                   FSCODE: fscode,
                   FNAME: $("#signupForm [name='FNAME']").val(),
                   LNAME: $("#signupForm [name='LNAME']").val(),
                   EMAIL: $("#signupForm [name='EMAIL']").val(),
                   WHSE: warehouse,
                   CUSTNO: custno,
                   CUSLOC: cusloc,
                   ROOMS: rooms,
                   BUYER: buyer,
                   ADATE: $("#signupForm [name='ADATE']").val(), 
                   DDATE: $("#signupForm [name='DDATE']").val(),
                   GOLF: $("#signupForm [name='GOLF']").val()					   
				};
				load = false;
                AttendeeAjax("Creating attendee", data);
              }
            }
		});
		//Call WEB055S LTYPE = E
		$("#signupForm #edit_atn").on("click",function(e){
			if($("#signupForm").valid()){
              	$("#signupForm .alert").hide();
             
                //ADD ROOMS input - King/Double/No room
                var rooms;
                if($('#signupForm #uniform-KING').find('span').hasClass('checked'))
				 rooms = 1;		
			    else if($('#signupForm #uniform-DOUBLE').find('span').hasClass('checked'))
				 rooms = 2;  
                else
                 rooms = 0;					
			     //ADD BUYER input
                 var buyer;
			     if($('#signupForm #uniform-buyer').find('span').hasClass('checked'))
                    buyer = "Y";  
			     else//remove hotel room if not buyer
				    buyer = "";   			 	  	   
                var data = {
                   USER: user,
                   FUNCTION: functionCode,
                   INSTANCE: "HTHACKNEY",
                   LTYPE: "E",
                   FSCODE: fscode,
                   FNAME: $("#signupForm [name='FNAME']").val(),
                   LNAME: $("#signupForm [name='LNAME']").val(),
                   EMAIL: $("#signupForm [name='EMAIL']").val(),
                   ATNID: $("#signupForm").attr("data-atnid"),
                   ROOMS: rooms,
                   BUYER: buyer,
                   ADATE: $("#signupForm [name='ADATE']").val(), 
                   DDATE: $("#signupForm [name='DDATE']").val(),
                   GOLF: $("#signupForm [name='GOLF']").val()
				};
				load = false;
				AttendeeAjax("Updating attendee", data);
			}
		});
      
		AttendeePopouts();
	/***********************************************************************************
	*  #customers.modal  
	**********************************************************************************/
		$('#customers').on('shown.bs.modal', function (e) {
		    var $invoker = $(e.relatedTarget);
     	    $("#nameLabel").text($invoker.attr('data-fname') + " " + $invoker.attr('data-lname'));
		});
     	
		//WEB055S2 LTYPE = A 
        $("#customerForm #add-customer").on("click",function(e){
		    e.preventDefault();
			if($("#customerForm").valid()){	
            		
			  if($("#customerForm [name='WHSE']").length > 0) 
				warehouse = $("#customerForm [name='WHSE']").find("option:selected").val();    	
			  if(validCusts === false) 
                 CustomerValidation("#customerForm");
               
			  if(validCusts === true){
			     //convert dropdowns to args form serialization		
				var locn = ''; 
				var custno = '';
				var cusloc = '';  
				if(justCust === true){
					  custno = locnum.substring(0,6);
					  cusloc = locnum.substring(6,9); 						
				}
				else{
				   //Chain
				   if($("#customerForm select[name='CUST'] option:selected").val() !== "*NONE"  && $("#customerForm select[name='CUST']").length > 0){
					   custno = $("#customerForm select[name='CUST'] option:selected").val();
					   cusloc = 0;
				   } //Location
				   else if($("#customerForm select[name='LOCN'] option:selected").val() !== "*NONE" && $("#customerForm select[name='LOCN']").length > 0){
					   locn = $("#customerForm  [name='LOCN'] option:selected").val();
					   custno = locn.substring(0,6);
					   cusloc = locn.substring(6,9);
				   }
				   else{//Direct customer entry
						custno = $("#customerForm input[name='DCUST']").val(); 
						cusloc = $("#customerForm input[name='DLOCN']").val();    
						if(cusloc === "")				   
						   cusloc = 0;
				   }  
				}
                var data = {
                USER: user,
                INSTANCE: "HTHACKNEY",
                FUNCTION: functionCode,
                FSCODE: fscode,
                WHSNO: warehouse,
                CUSTNO: custno,
                CUSLOC: cusloc,
                ATNID: $("#customerForm").attr("data-atnid"),
                LTYPE: "A"
              };
			    reload = true;
				CustomerAjax("Creating customer",data);
			  }

		   }
		});	
		//WEB055S2 LTYPE = D 
		$("#customerForm").on("change", "input[type='checkbox']",function(e){
            
			if($(this).is(':checked')){
				if($("#customerForm input[type='checkbox']").length > 1){
					var row = $(this).closest("tr");
					var td = row.find("td:eq(1)");
				    var whsno = td.find("span").text();
					td = row.find("td:eq(2)");
					var custno = 	td.find("span").text();
                    td = row.find("td:eq(3)");
                   var cusloc = td.find("span").text();
				   var data = {
					USER: user,
					INSTANCE: "HTHACKNEY",
					FUNCTION: functionCode,
					FSCODE: fscode,
					WHSNO: whsno,
					CUSTNO: custno,
					CUSLOC: cusloc,
					ATNID: $("#customerForm").attr("data-atnid"),
					LTYPE: "D"
                  };		
                  reload = true;			  
				  CustomerAjax("Deleting customer", data);
				}
				else{
					var err = $(this).closest("td").find("span").addClass("hth_td_error").attr("title", "Please add another customer before deleting this customer");
				    err.tooltip('show');
				}
			}
		});
		/************************************************************************************************************
	      #custretrieval.modal	resets backdrop
		*************************************************************************************************************/
	   	// customer retrieval modal - enter key triggers 'return with selection' button 
	   $("#custretrieval").on("keydown", function(event) {			 
     		var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
     		if (keycode == 13 && event.target.type == 'radio') { // keycode for enter key	      			 
        	    // Allow enter key to process #custretrieval modal
        		$('#add_cust_btn').click();
        		return false;
     		} 
     		else   
				return true;
	    });
	    //customer retrieval modal -  'return selection' button clicked
		$("#add_cust_btn").on("click",function(){
			str = $("[name='LOCNSELECTION']:checked").val();
 			whse = str.substring(0,3);
 			cust = str.substring(3,9);
 			loc = str.substring(9);
		    warehouse = whse;
 			if($("[name='WHSE']").length > 0)
 			   $("[name='WHSE']").val(warehouse);
 			$("input[name='DCUST']").val(cust);
 			$("input[name='DLOCN']").val(loc);
 			$("[name='LOCNSELECTION']:checked").removeAttr("checked");
			$('#custretrieval input:radio').each(function(){
				$(this).prop('checked', false);
			});
		});
	   //Replace links for Customer Retrieval buttons
	   $( ".custretbutton" ).replaceWith("<a href=\"#\" id=\"Cust_Ret\" role=\"button\" class=\"atn-main radio-custs btn default btn-xs atn\" data-toggle=\"modal\" data-target=\"#custretrieval\" title=\"Allows you to search for a customer\"><i class=\"fa fa-user\"></i> Customer Retrieval</a>" );
       $('#custretrieval').on('hidden.bs.modal', function (e) {			
			if($('.event.modal').is(':visible')) 
				if(!$(".modal-backdrop").length)
				   $('<div class="modal-backdrop fade in"></div>').appendTo(document.body);			
	   });
       $("#custretrieval").on("shown.bs.modal", function(e){
			//Trigger #add_cust_btn button on radio selection
		    $("input:radio").on("click",function(){
              if($(this).is(":checked"))
				  $('#add_cust_btn').trigger('click');
            });
        });
		 $("#custretrieval").on("hide.bs.modal", function(e){
			 $(this).find("[name='LOCNSELECTION']").removeAttr("checked");	
            $('#custretrieval input:radio').each(function(){
				$(this).prop('checked', false);
			});				
		 });
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// handle #table_001 load draws 
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////     
		$('#table_001').on( 'draw.dt', function () {
			//portlet-title -> caption -> this
		     $("#event_name").html(eventName).addClass("xs-small");
			// keep track of values for table input fields on each draw
			$("[aria-controls='table_001'][type='search']").attr('hth_orig',$("[aria-controls='table_001'][type='search']").val());
			$(".searchable[placeholder='Last Name']").attr('hth_orig',$(".searchable[placeholder='Last Name']").val());
			$(".searchable[placeholder='First Name']").attr('hth_orig',$(".searchable[placeholder='First Name']").val());
			$(".searchable[placeholder='Whse']").attr('hth_orig',$(".searchable[placeholder='Whse']").val());
			$(".searchable[placeholder='Cust']").attr('hth_orig',$(".searchable[placeholder='Cust']").val());
			//required on draw
			TableAdvanced.init('table_001','N');
			 //CSS Group by atnid  
			 $(".childEntry").each(function(){
				var mainEntry = false; 
				var child = $(this);
			    var tr = child.closest("tr");
				var trPrev = child.closest("tr");
			    var main = tr.closest("tr").find("td:nth-child(3) span");
				while(!mainEntry){
					if(main.hasClass("mainEntry")){
					    var mainTr = main.closest("tr");
						mainTr.addClass("multi"); 
						//not used
						//mainTr.css("background-color", getRandomColor(), "!important");
					    var bgColor = mainTr.css("background-color");
					    tr.css("background-color", bgColor);
						mainEntry = true;
					}
					else{
						trPrev = trPrev.prev("tr");
	                    main = trPrev.find("td:nth-child(3) span");
			        }
				}
			 });    
		 
		});
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// handle #table_003 load draws 
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		$('#table_003').on( 'draw.dt', function () {
			TableAdvanced.init('table_003','N');
			//var table3 = $('#table_003').DataTable();
			// Load additional information pertaining to the table
			//var data = oTable.fnSettings();
			var filtered = oTable.fnSettings()._iRecordsDisplay; // total number of elements with filter applied
			var total = oTable.fnSettings()._iRecordsTotal; // total number of elements with filter applied
			var search = oTable.fnSettings().oPreviousSearch.sSearch;
			
		});
   }
   /***************************************************************************************
   * Confirmation on delete
   ***************************************************************************************/
    var AttendeePopouts = function(){
	    // var oTable1 = $('#table_001').DataTable();	
		$('[data-toggle=confirmation-popout]').confirmation({ 
			popout: true, 
			singleton: true,
			placement:'bottom', 
			btnOkClass: 'btn-small btn-success mr5',
			btnCancelClass: 'btn-small btn-warning',
			onConfirm: function(){
				if($.trim(this.context.id) == 'del_atn') {
					
				   var data = {
                      USER: user,
                      FUNCTION: functionCode,
                      INSTANCE: "HTHAKNEY",
                      FSCODE: fscode,
                      LTYPE: "D",
                      ATNID: $("#signupForm").attr("data-atnid")
                   };
                    load = false;
					AttendeeAjax("Deleting attendee", data);
				}
				
				if($.trim(this.context.id) == 'del-attendees') {
					$("#ATTENDEES .alert-success").html("Please wait...Your Request is being processed!").show();
					isX = true;
			        var data = {
                      USER: user,
                      FUNCTION: functionCode,
                      INSTANCE: "HTHAKNEY",
                      FSCODE: fscode,
                      LTYPE: "X"
                   };
				     load = false;
					 AttendeeAjax("Removing all attendees", data); 
			   }
			     
			}
		});
   }
	/***********************************************************************************
	* POST #attendee.modal via Add || Update || Delete Attendee
	**********************************************************************************/
    var AttendeeAjax = function(msg, args){
		$("#attendee").find(".loading").html('<span class="caption xs-small">'+toTitleCase(msg) + '...</span><img src="/images/loading.gif" alt="loading">').removeClass("hidden");
		$(".alert").fadeOut('fast');
		console.log(args);
		$.ajax({
		   type: "GET",
		   url:  "http://portal.hthackney.com/rest/WEB055S?callback=?",
		   data: args,
		   contentType: "application/json; charset=utf-8",
		   dataType: "jsonp"}).
		   done(function(data){
		       $("#signupForm .loading").addClass("hidden");
		       //Successful Submit! 
			   if(typeof data.ERROR == "undefined"){	
					var oTable1 = $('#table_001').DataTable(); ///load .ajax structure     
					
					if(isX === true){
					    oTable1.ajax.reload();
					    setTimeout(function(){$("#ATTENDEES .alert-success").html(data.MESSAGE).show();},2000);
			     		setTimeout(function(){$("#ATTENDEES .alert").fadeOut('slow');},7000);	
					}else{
					    //Load Attendee
						if(load === true){
						  $("#signupForm [name='FNAME']").val(data.FNAME);
						  $("#signupForm [name='LNAME']").val(data.LNAME);
						  $("#signupForm [name='EMAIL']").val(data.EMAIL);
						  $("#signupForm [name='GOLF']").val(data.GOLF);
						  $("#signupForm #adate").val(data.ADATE);
						  $("#signupForm #ddate").val(data.DDATE);        
						  $("#signupForm #crtusr").text(data.CRTUSR);
						  $("#signupForm #crtdt").text(data.CRTDT);
						  $("#signupForm #crttm").text(data.CRTTM);
						  $("#signupForm").attr("data-atnId", data.ATNID);
								  
						  if(data.BUYER === "Y"){
							 $('#signupForm #uniform-buyer').find('span').addClass('checked');
							 $("#signupForm #uniform-buyer input[type='checkbox']").prop('checked', true);
							 $('#signupForm .rooms').removeClass('hidden');
						  }
						  else{
							 $('#signupForm #uniform-buyer').find('span').removeClass('checked');
							 $("#signupForm #uniform-buyer input[type='checkbox']").prop('checked', false);
							 $('#signupForm .rooms').addClass('hidden');
						  }
						  // UPDATE KING DOUBLE SIZE BEDS
						  if(data.ROOMS >= 1){
							  if(data.ROOMS == 2){
							     $('#signupForm #uniform-DOUBLE').find('span').addClass('checked');
							     $("#signupForm #uniform-DOUBLE input[type='checkbox']").prop('checked', true);
							     $('#signupForm .dates').removeClass('hidden'); 
                              }else{								  
							     $('#signupForm #uniform-KING').find('span').addClass('checked');
							     $("#signupForm #uniform-KING input[type='checkbox']").prop('checked', true);
							     $('#signupForm .dates').removeClass('hidden'); 
							  }
						  }	 
						  else{
							     $('#signupForm #uniform-KING').find('span').removeClass('checked');
							     $("#signupForm #uniform-KING input[type='checkbox']").prop('checked', false);
							     $('#signupForm #uniform-DOUBLE').find('span').removeClass('checked');
							     $("#signupForm #uniform-DOUBLE input[type='checkbox']").prop('checked', false);
							     $('#signupForm .dates').addClass('hidden'); 
						  }
					      // console.log(data.UPDUSR.length);
						 if(data.UPDUSR.length > 0){	
                            $("#signupForm").find("#updusr").parent().removeClass("hidden"); 						 
						    $("#signupForm #updusr").text(data.UPDUSR);
							$("#signupForm #upddt").text(data.UPDDT);
                            $("#signupForm #updtm").text(data.UPDTM);							
						 }
						 else{
							$("#signupForm").find("#updusr").parent().addClass("hidden");
						 }
					  }//EOF Loading Attendee
					  else{ //delete, update, add
					    console.log(data.MESSAGE);
						oTable1.ajax.reload();
						$("#signupForm .alert-success").html(data.MESSAGE).show();
						setTimeout(function(){  $("#attendee").modal('hide');},1600);
					   }
			        }//EOF Crud on single attendee
				   $("#signupForm select").each(function() { this.selectedIndex = 0 });
			   } //EOF Success
			   else{//ERROR
			     //console.log(data.ERROR);
				 if(isX === true){
				    $("#ATTENDEES .alert-danger").html(data.ERROR).show();
					setTimeout(function(){$("#attendees .alert").fadeOut('slow');},7000); 
			     }
				 else{
					$("#attendee .alert-danger").html(data.ERROR).show();
				    $("#attendee .loading").addClass("hidden");
				    setTimeout(function(){$("#attendee .alert-danger").fadeOut('slow');},10000);
				 }
			   }  
	   }).
	   fail(function(){
		   	$("#attendee .loading").addClass("hidden");
		    $("#signupForm .alert-danger").html("We're sorry, you're request cannot be processed at this time. It is likely the corporate system is under maintenance.").show();
	   }).always(function(){
	           //reset global vars
			   isX = false;
               load = true;
	           validCusts = false;
			      //reset inputs	   
			   $("#signupForm select").each(function() { 
				  if($(this).attr('name') !== 'WHSE')
				   this.selectedIndex = 0;
			    });
				 
                if($("#signupForm input[name='DCUST']")){
                       $("#signupForm input[name='DCUST']").val('');
					   $("#signupForm input[name='DLOCN']").val('');
	     		}
	   });
   }
   	/***********************************************************************************
	* POST #customers.modal via Add || Delete Attendee
	**********************************************************************************/
    var CustomerAjax = function(msg,args){
	$("#customers").find(".loading").html('<span class="caption xs-small">'+ msg + '...</span><img src="/images/loading.gif" alt="loading">').removeClass("hidden");
    $(".alert").fadeOut('fast');    
	//console.log(args);
	$.ajax({
	   type: "GET",
	   url:  "http://portal.hthackney.com/rest/WEB055S2?callback=?",
	   data: args,
	   contentType: "application/json; charset=utf-8",
       dataType: "jsonp"}).
	   done(function(data){
		       $("#customers").find(".loading").addClass("hidden");
		       //Successful Submit! 
			   if(typeof data.MESSAGE != "undefined"){	
                    //console.log(data.MESSAGE);
					$("#customerForm .alert-success").html(data.MESSAGE).show();
					InitCustTable($('#customerForm').attr('data-atnid'));
			   }
			   else{//ERROR
			        //console.log(data.ERROR);
					$("#customerForm .alert-danger").html(data.ERROR).show();   
			   } 
                 setTimeout(function(){ $("#customers .alert").fadeOut('slow');},7000); 
	   }).
	   fail(function(){
		   	$("#customerForm .loading").addClass("hidden");
		  $("#customerForm .alert-danger").html("We're sorry, you're request cannot be processed at this time. It is likely the corporate system is under maintenance.").show();
	   }).always(function(){
	   		   //reset inputs	   
			   $("#customerForm select").each(function() { 
				  if($(this).attr('name') !== 'WHSE')
				   this.selectedIndex = 0;
			    });
				 
                if($("#customerForm input[name='DCUST']")){
                       $("#customerForm input[name='DCUST']").val('');
					   $("#customerForm input[name='DLOCN']").val('');
	     		}
				validCusts = false;
	   });
   }
    /****************************************************************************************
    #attendee modal Validation
    ****************************************************************************************/
    function AttendeeFormValidation(form){
    	var $form;
		if (form instanceof $) 
			$form = form;
		else
			$form = $(form);

        var FormError = $('.alert-danger',$form);
       	var success = $('.alert-success',$form);

    	$form.validate({
    		focusInvalid: false, // do not focus the last invalid input
            ignore: ':hidden',
    		onkeyup: function(element) { //only allow if 'onkeyup:false' is rule!!
    			var element_id = $(element).attr('name');
    			if (this.settings.rules[element_id]) {
    			    if (this.settings.rules[element_id].onkeyup !== false) {
    			      	$.validator.defaults.onkeyup.apply(this, arguments);
    			    }
    			}
    		},	
    		rules: {
        		"FNAME":{
                    required: true,
                    HTH_alpha: true,
                    rangelength: [2, 20]
        		},
        		"LNAME":{
                   required: true,
                   HTH_alpha: true,
                   rangelength: [2,25]
        		},
        		"EMAIL":{
                  required: true,
                  HTH_EmailSingle: true,
                  rangelength: [7,50]
            	},
            	"WHSE":{
            	   required: {
                        depends: function() {
						if($("#signupForm [name='WHSE']").length > 0)
							return true;
						else
							return false;
						}
                    },
              	  HTH_SelectValue: true
            	},
            	"GOLF":{
					max: 10,
					digits: true
				},
            	"ADATE": { 
                    required: {
                        depends: function() {
						if($("#signupForm #uniform-KING span").hasClass("checked") || $("#signupForm #uniform-DOUBLE span").hasClass("checked") || Date.parse($("input[name='DDATE']").val()))
							return true;
						else
							return false;
						}
                    },
                    HTH_dateUSA: true,
                    HTH_dateRange: ['<',$("input[name='DDATE']")]
            	}, 
            	"DDATE": { 
                    required: {
                        depends: function() {
						if($('#signupForm #uniform-KING span').hasClass('checked') || $("#signupForm #uniform-DOUBLE span").hasClass("checked") || Date.parse($("input[name='ADATE']").val()))
							return true;
						else
							return false;
						}
                    },
                    HTH_dateUSA: true,
                    HTH_dateRange: ['>',$("input[name='ADATE']")]
            	}
			},
        	messages: { // custom messages for radio buttons and checkboxes
            	"ADATE": {
            		HTH_dateUSA: "Arrival Date must be a valid date in mm/dd/yyyy format.",
            		HTH_dateRange: "Arrival Date must be before the Departure Date."	
                },
                "DDATE": {
            		HTH_dateUSA: "Departure Date must be a valid date in mm/dd/yyyy format.",
            		HTH_dateRange: "Departure Date must be after the Arrival Date."
                }
         	},  		
         	showErrors: function(errorMap, errorList) {
         		FormError.hide();
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
                    FormError.show();
                });
            },  				
    		invalidHandler: function (event, validator) { //display error alert on form submit     
            	success.hide();
                FormError.show();
                $(this).scrollTop( $(".modal-body").offset().top ); 
          	},
    		 submitHandler: function (form) {
                FormError.hide();
                $(this).scrollTop( $(".modal-body").offset().top );
                //Using $.valid() on click we call WEB055S with appropiate LTYPE
            }
      	});
		// Date Range
		if (jQuery().datepicker) {
			$("[name='ADATE']").datepicker({
				  showOn: "button",
			      buttonImage: "/images/calendar.png",
			      buttonImageOnly: true,
			      changeMonth: true,
			      changeYear: true,
			      minDate: 'today',
			      onClose: function() {}
			});
		    $("[name='DDATE']").datepicker({
		    	  showOn: "button",
			      buttonImage: "/images/calendar.png",
			      buttonImageOnly: true,
			      changeMonth: true,
			      changeYear: true,
			      minDate: '0',
			      onClose: function( ) {}
		    });							
		}
    }
    /****************************************************************************************
    #customers modal Validation
    ****************************************************************************************/
    function CustomerFormValidation(form){
    	var $form;
		if (form instanceof $) 
			$form = form;
		else
			$form = $(form);

        var FormError = $('.alert-danger',$form);
       	var success = $('.alert-success',$form);

    	$form.validate({
    		focusInvalid: false, // do not focus the last invalid input
    		onkeyup: function(element) { //only allow if 'onkeyup:false' is rule!!
    			var element_id = $(element).attr('name');
    			if (this.settings.rules[element_id]) {
    			    if (this.settings.rules[element_id].onkeyup !== false) {
    			      	$.validator.defaults.onkeyup.apply(this, arguments);
    			    }
    			}
    		},	
    		rules: {
        		"WHSE":{
            	   required: {
                        depends: function() {
						if($("#customerForm [name='WHSE']").length > 0)
							return true;
						else
							return false;
						}
                    },
              	  HTH_SelectValue: true
            	},
            	"LOCN":{
            	 required: true,
            	 HTH_SelectValue: true
            	}
        	},
        	messages: { },// custom messages for radio buttons and checkboxes	
         	showErrors: function(errorMap, errorList) {
         		FormError.hide();
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
                    FormError.show();
                });
            },  				
    		invalidHandler: function (event, validator) { //display error alert on form submit     
            	success.hide();
                FormError.show();
                $(this).scrollTop( $(".modal-body").offset().top );
          	},
    		 submitHandler: function (form) {
                FormError.hide();
                $(this).scrollTop( $(".modal-body").offset().top );
                //Using $.valid() on click we call WEB055S with appropiate LTYPE
            }
      	});
    }
	/*********************************************************************************** 
	  Customer Selection Validation after Form is valid 
	***********************************************************************************/
	var CustomerValidation = function(formId){ 
			var $form;
		      
			if (formId instanceof $) 
				$form = formId;
			else
				$form = $(formId);

		   var FormError = $form.find('.alert-danger', $form);    

		   // Is there a validation error? 
		   var pulldown_error = '';
		   var locn = '';
			if(justCust === true)   
				locn = locnum;
			else
				locn = $form.find("[name='LOCN'] option:selected").val();
		   // load all parameters
		   var data = 'INSTANCE=HTHACKNEY' +
				'&FUNCTION=' + functionCode +
				'&USER=' + user +
				'&WHSE=' + warehouse +  
				'&CUST=' + $form.find("[name='CUST'] option:selected").val() +
				'&LOCN=' + locn +  
				'&GRP=*NONE' +   
				'&VEND=undefined' + 
				'&SALES=undefined' + 
				'&SBREAK=undefined' +  
				'&DCUST=' + $form.find("[name='DCUST']").val() + 
				'&DLOCN=' + $form.find("[name='DLOCN']").val() + 
				'&JUSTWHSE=N';
		 // console.log(data);
		// Call the RPG REST JSONP program that will validate all pulldown variables
		$.getJSON( "http://portal.hthackney.com/rest/WEB019?callback=?",data )
		  .done(function( json ) {	
				var id = $form.attr('id');
				// Load return parameters if we dont want tooltip error to show for WHSE---- 
				if($form.find("select[name='WHSE']")) {
					one_sel = 'N';
					
					$("#" + id + " select[name='WHSE'] option").each(function(){
						if ($.trim(json.WHSE).indexOf($(this).val()) >= 0) {
							one_sel = 'Y';
							$(this).prop('selected', true);					
							 pulldown_error = 'Y';
						}
						else{
							$(this).prop('selected', false);
						}
					});
					if (one_sel != 'Y') {
					   $("#" + id + " select[name='WHSE'] option:first").attr('selected','selected');
					}
				}		
                //update whsno if invalid				
				if(json.WHSE != warehouse)
					warehouse = json.WHSE;
			 
				if ($.trim(json.NAME) != '') {
					
					// General Error
					if ($.trim(json.NAME) == '*GENERAL')
						$form.find(".alert-danger").html($.trim(json.ERROR));	
					// field specific error
					else {
						 var name =  "[name='"+$.trim(json.NAME)+"']";
						 //console.log(json.NAME);
						 var message = $.trim(json.ERROR);
						 var element = $form.find(name);
						Error_ToolTip(element,message);
						element.tooltip("show");
						$form.find(".alert-danger").html('You have some errors. Please check below.');
					}
					
					FormError.show(); 		  
					validCusts = false;	
				}// web page specific form validation 
				else {
					validCusts = true;
					if(id === "signupForm")
					   $("#add_atn").trigger('click');
					else
					   $("#add-customer").trigger('click');
				}
		  })	  
		  // the call to the validation program failed!!!	
		  .fail(function( jqXHR, textStatus, error ) {
			var err = textStatus + ", " + error;
			alert('Unable to Connect to Server.\n Try again Later.\n Request Failed: ' + err);
			});
		}
	//initialize customer table
	var InitCustTable = function(aid){
	   
	   var data = {
		 USER : user,
         INSTANCE : "HTHACKNEY",
		 FSCODE : fscode,
		 ATNID : aid,
		 COLS : "5"	 
	   };
	   
        $("#customers").find(".ajax-loader").removeClass("hidden");
	    $("#customers").find(".hth_tbl").addClass("hidden");
		$.ajax({
		   type: "GET",
		   url:  "http://portal.hthackney.com/rest/WEB055L3?callback=?",
		   data: data,
		   contentType: "application/json; charset=utf-8",
		   dataType: "jsonp"}).
		   done(function(data){
				   $("#customerForm .loading").addClass("hidden");
				   //Successful Submit! 
				   if(typeof data.ERROR == "undefined"){
                        var dt = dynamicTable.config('#table_002', ['1','2','3','4','5'],['Remove?','Warehouse','Customer','Loc','Name'],'No customers to display');
						dt.load(data);
						 $("#table_002 tr th:eq(4)").addClass("hidden-xs");
						 $("#table_002 tr").each(function() {
                          $(this).find("td:eq(4)").addClass("hidden-xs");  
                         });	 
                        $("#customers").find(".ajax-loader").addClass("hidden");
	                    $("#customers").find(".hth_tbl").removeClass("hidden");
						if(reload === true){ //reload dataTable on LTYPE A or D
							var oTable1 = $('#table_001').DataTable(); ///load .ajax structure     
							oTable1.ajax.reload();
						}
				   }
				   else{//ERROR
						//console.log(data.ERROR);
						$("#customers").find(".ajax-loader").addClass("hidden");
						$("#customerForm .alert-danger").html(data.ERROR).show();   
				   } 
				   reload = false;
		   }).
		   fail(function(){
				$("#customerForm .loading").addClass("hidden");
			  $("#customerForm .alert-danger").html("We're sorry, you're request cannot be processed at this time. It is likely the corporate system is under maintenance.").show();
		   }).always(function(){});
		
	}	
	
	var CustEventHandlers = function(id){
	   CustomerModalDropDownMenus("#customers");
	   CustomerFormValidation("#customerForm");
       InitCustTable(id);	 
	}
	
	    //This is for Corp system failure
    var PageErrorHandler = function(id,err){
		var errPage = $(id).find(".hth_content");
		errPage.removeClass("hidden");
		errPage.css("border","none", "!important");
		errPage.html('<div class=\"half-shell margin-auto\"><br>'+
       '<div class=\"set text-center text-danger h5\">The H.T. Hackney Co.<br>' +
       '<img class=\"h\" src=\"/bootstrap-assets-overrides/img' +
       '/hthlogo.png\" width=\"194\"' +
       ' height=\"118\" style=\"width: 100%; max-width: 194px;\">' +
       '</div></div>');
	   $(".atn-main").addClass("hidden");
		setTimeout(function(){
			$(id).find(".alert-danger").html(err).fadeIn('fast');
			errPage.fadeIn('fast');
	},500);
	}

   /*
   *
   *Event app section
   *
   */
       return {
    init: function (usr,func,powerUser,authWhss,whse,locn) {
        	    allWhse = authWhss;
				locnum = locn;
			    console.log("authwhss=" + authWhss +" whse=" + whse +" locn= " + locn);
               //InitCustRetrievalTable active
			   if(allWhse.length >= 3)
				    hasWarehouses = true;
			   //chain is hidden so shift row
			   //if(allWhse === "" && whse.length == 3)
			       //hasCustWarehouse = true;
               if(allWhse.length == 3) //set warehouse to default warehouse
					warehouse = allWhse;
			   else //customer's warehouse or hth_default
					warehouse = whse;			  
 			  //No warehouses attached but has single Customer attached
			   if(locnum.length > 5 && hasWarehouses === false)
				   justCust = true;			  	
			   //store_default fix before removed hth_default from #customers modal
               if(whse.length > 3)
                  warehouse = whse.substring(0,2);				   
               //power user			 
			   if(powerUser === "Y")
				  hasAuth = true;
			   user = usr;
			   functionCode = func;
               DropDownMenus();	
               EventHandlers();		   
   	    }		   
       }; 

}();