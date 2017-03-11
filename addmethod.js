	/*******************************************************************************************************************
Custom Validation methods used by the jquery validate function

HTH_alpha				    Alphanumeric test - alphabet only
										HTH_alpha: true
										
HTH_alphanum 				Alphanumeric test  - alphabet and numbers
										HTH_alphanum: true
										
HTH_AlphaNumSpace		    Alphanumeric test  - alphabet and numbers and spaces
										HTH_AlphaNumSpace: true	
					
HTH_AlphaNumSymbols         Allows alphanumeric and special symbols
                                        HTH_AlphaNumSymbols: true
										
HTH_compare  				Compare an element to another jquery element or value
            					test for: < > <= >= <> != == 
            					HTH_compare: ['<=',$("[name='toval']")]	
            					HTH_compare: ['<=','100']	
								
HTH_CUPC				    RegX for CUPC number must be an integer >= 3 && <= 6 for iteminquiry search

HTH_dateRange				Is date within a specific range											
										HTH_dateRange: ['range','<?echo $LOWDATE?>','<?echo $HIGHDATE?>']
										HTH_dateRange: ['<=',$("input[name='ENDDAT']")]	
										
HTH_dateUSA					Is *USA date valid											
										HTH_dateUSA: true	
HTH_DCUST                   RegX for CUSTNO number must be an integer >= 99999 && <= 999999 for CUSTNO search 

HTH_DLOCN                   RegX for CUSLOC number must be an integer >= 1 && <= 999 for CUSTLOC search 
 																														
HTH_dec					    decimal number test - pass in max to right and left of decimal 
										HTH_dec: ["3","2"]   <-- xxx.xx	

HTH_dec_neg					    decimal number test - pass in max to right and left of decimal -can have leading '-' sign 
										HTH_dec: ["3","2"]   <-- xxx.xx	
																			
HTH_EmailMult				Edits multiple email addresses separated by commas or spaces											
										HTH_EmailMult: true	

HTH_EmailSingle				Edits single email address
										HTH_EmailSINGLE: true
										
HTH_ITEMNO                  Allows only Item numbers (3 -7 digits), spaces, commas 
										
HTH_inline			******	Used a place holder for an inline 'function' edit											
										HTH_inline: true	
																									
HTH_isequal					Is an element equal to another or a string (uses 'name' reference and not 'id' reference)											
										HTH_isequal: $("input[name='NEWPWD']")
										HTH_isequal: 'string'	
										
HTH_notif					This element cannot be supplied if another element has a value
										HTH_notif: $("input[name='NEWPWD']")
										HTH_notif: 'string'

HTH_num						Valid integer - leading spaces are allowed - no negative sign
										HTH_Num: true

HTH_num0					Valid integer - leading spaces are allowed - no negative sign - 
											all zeros is also allowed
										HTH_Num0: true
																				
HTH_PersonName			    Validate a person's Name
										HTH_PersonName: true										
HTH_RegExpress              Validates jQuery selector using custom regular expression
 									
HTH_RequireIfCheck	        Required if a particular checkbox is checked										
										HTH_RequireIfCheck: ['input[name=\'CHECKBOX\']','Purchase Units'] 	<--- Single
										HTH_RequireIfCheck: ['input[name=\'CHECKBOX[]\']','Purchase Units'] <--- Multiple
										*NOTE: Replace 'Purchase Units' with name of field that is required.  This will be loaded into the error message

HTH_SelectValue             Ensure that option is not disabled and selected
										HTH_SelectValue: true
										
HTH_TelephoneEmail               Validate a user's telephone number
                                        HTH_TelephoneEmail: true
										
HTH_UPC						RegX for UPC number must be an integer
										HTH_UPC: [6,8, errormsg]			
										
HTH_Vel999Days              RegX for range 01-999 OR 1-999
                                        HTH_Vel999Days: true

*******************************************************************************************************************/

//  Alpha  -------------------------------------------------------------------------------------------------------
$.validator.addMethod("HTH_alpha", function(value, element) {
  return this.optional(element) || /^[a-zA-Z]+$/i.test(value);
}, "Must contain only letters.");

//  Alphanumeric  - leading spaces are allowed --------------------------------------------------------------------
$.validator.addMethod("HTH_alphanum", function(value, element) {
  return this.optional(element) || /^[a-zA-Z0-9]+$/i.test(value);
}, "Must contain only letters and numbers and no spaces.");

//  AlphaNumSpace  - leading spaces are allowed --------------------------------------------------------------------
$.validator.addMethod("HTH_AlphaNumSpace", function(value, element) {
  return this.optional(element) || /^[a-zA-Z0-9\s-]+$/i.test(value);
}, "Must contain only letters, numbers, spaces or hypens.");


//  AlphaNumSymbols - Allows alphanumeric and some special symbols --------------------------------------------------------------------
$.validator.addMethod("HTH_AlphaNumSymbols", function(value, element) {
  return this.optional(element) || /^[ A-Za-z0-9'/%$#&+-@]*$/i.test(value);
}, "Must contain only letters, numbers, spaces, or '/$#%&+~-. symbols");
//ascii_compare - compare alphanumeric values against each other.
//            test for: < > <= >= <> != == 
$.validator.addMethod("HTH_alphaNum_compare", function(value, element, param) 
{  
        
		if(param[1] instanceof jQuery) {
			eval("var comp = $(\""+param[1].selector+"\").val();");
	 	}
	 	else {
	 		var comp = param[1]; 
	 	}
		var len = value.length;
		var complen = comp.length;
		 //console.log('a'+comp + "length=" + complen); console.log('b'+value + "value=" + len);
	 	if (value.trim() == '' || comp.trim() == '') return true;
	
		if (param[0] == '=') {
			return value == comp;
		}
		else if (param[0] == '<>' || param[0] == '!=') {
			return value != comp;
		}
		else if (param[0] == '<') {
			return value < comp;
		}
		else if (param[0] == '<=') {
           	return value <= comp;
	    }
	    else if (param[0] == '>') {
	    	return value > comp;
	    }
		else if (param[0] == '>=') {
	       	return value >= comp;
		}
}, "**REPLACE** HTH_compare error");

//compare - compare an element to another jquery element or value
//            test for: < > <= >= <> != == 
$.validator.addMethod("HTH_compare", function(value, element, param) 
{  
		if(param[1] instanceof jQuery) {
			eval("var comp = $(\""+param[1].selector+"\").val();");
	 	}
	 	else {
	 		var comp = param[1]; 
	 	}
		//alert(comp);
		 console.log('a'+comp); console.log('b'+value);
	 	if (value.trim() == '' || comp.trim() == '') return true;
	
		if (param[0] == '=') {
			return value*1 == comp;
		}
		else if (param[0] == '<>' || param[0] == '!=') {
			return value*1 != comp;
		}
		else if (param[0] == '<') {
			return value*1 < comp;
		}
		else if (param[0] == '<=') {
			return value*1 <= comp;
	    }
	    else if (param[0] == '>') {
	    	return value*1 > comp;
			}
		else if (param[0] == '>=') {
			console.log(value*1 >= comp);
			return value*1 >= comp;
		}
}, "**REPLACE** HTH_compare error");

// CUPC search iteminquiry
$.validator.addMethod('HTH_CUPC',function(value,element,param){return this.optional(element) || /^[0-9]{6,8}\s*$/.test(value);}, "Search items by entering a single Compressed UPC between 6 - 8 digits.");

// dateRange - Date Range validation -------------------------------------------------------------------------------
$.validator.addMethod("HTH_dateRange", function(value, element, param) 
{		
		if(param[1] instanceof jQuery) {
			eval("var comp = $(\""+param[1].selector+"\").val();");
	 	}
	 	else {
	 		var comp = param[1]; 
	 	}
	 	if (value == '' || comp == '') return true;
	 	var CompDate1e = new Date(comp).getTime();
	 	var PassDatee = new Date(value).getTime();
	 	var CompDate1 = new Date(comp);
	 	var PassDate = new Date(value);
	
		if (param[0] == '=') {
			return PassDatee == CompDate1e;
		}
		else if (param[0] == '<>' || param[0] == '!=') {
			return PassDate != CompDate1;
		}
		else if (param[0] == '<') {
			return PassDate < CompDate1;
		}
		else if (param[0] == '<=') {
			return PassDate <= CompDate1;
    }
    else if (param[0] == '>') {
    	return PassDate > CompDate1;
		}
		else if (param[0] == '>=') {
			return PassDate >= CompDate1;
		}
		else if (param[0] == 'range') {
			if(param[2] instanceof jQuery) {
	 			var comp = $(param[2]).val();
		 	}
		 	else {
		 		var comp = param[2];
		 	}
		 	var CompDate2 = new Date(comp);
	 		if (PassDate >= CompDate1 && PassDate <= CompDate2)
				return true;
			else
				return false;
		}
}, "**REPLACE** HTH_dateRange ERROR");

// dateUSA - Date validate in mm/dd/yyyy format---------------------------------------------------------------------
$.validator.addMethod("HTH_dateUSA",function(value, element) 
{				
        var check = false;
        var re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        if( re.test(value)){
            var adata = value.split('/');
            var mm = parseInt(adata[0],10);
            var dd = parseInt(adata[1],10);
            var yyyy = parseInt(adata[2],10);
            var xdata = new Date(yyyy,mm-1,dd);
            if ( ( xdata.getFullYear() == yyyy ) && ( xdata.getMonth () == mm - 1 ) && ( xdata.getDate() == dd ) )
                check = true;
            else
                check = false;
        } else
            check = false;
        return this.optional(element) || check || $(element).parents('div').hasClass('hidden');
}, "Please enter a date in the format mm/dd/yyyy");
// DCUST RegX
$.validator.addMethod('HTH_DCUST',function(value,element,param){return this.optional(element) || /^[1-9]{1}[0-9]{5}\s*$/.test(value);}, "Customer number must be six digits and cannot start with a zero.");
// DLOCN RegX
//$.validator.addMethod('HTH_DLOCN',function(value,element,param){return this.optional(element) || /^([0-9]{0,2}[1-9]{1})||([1-9]{1}[0-9]{2})\s*$/.test(value);}, "Customer location must be three digits. Please select chain if no location.");
//  dec - Numeric with decimal position  - leading spaces are allowed --------------------------------------------------------------------
$.validator.addMethod("HTH_dec", function(value, element,param) {
	re = new RegExp('^([0-9]{1,' + $.trim(param[0]) + '})?(\\.[0-9]{1,' + $.trim(param[1]) + '})?$'); 
  return this.optional(element) || re.test(value);
},"Number has max integer positions of {0} and max decimal positions of {1}.");

//dec_neg - Numeric with decimal position  - leading spaces are allowed --------------------------------------------------------------------
$.validator.addMethod("HTH_dec_neg", function(value, element,param) {
	re = new RegExp('^-?([0-9]{1,' + $.trim(param[0]) + '})?(\\.[0-9]{1,' + $.trim(param[1]) + '})?$'); 
  return this.optional(element) || re.test(value);
},"Number has max integer positions of {0} and max decimal positions of {1}.");
  
  
//EmailMult - Valid string with multiple email addresses -----------------------------------------------------------
$.validator.addMethod("HTH_EmailMult", function(value, element) {
  return this.optional(element) || /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*([,\s]\s*\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*)*$/i.test(value);
}, "One or more email addresses are not formatted properly.");

//EmailSingle - Valid string with single email address -----------------------------------------------------------
$.validator.addMethod("HTH_EmailSingle", function(value, element) {
  return this.optional(element) || /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i.test(value);
}, "Single email address is not formatted properly.");

//inline - place holder for inline 'function' edit --------------------------------------------------------------------
$.validator.addMethod("HTH_inline", function(value, element) {
return true;
}, "");

//HTH_ITEMNO - itemnumbers by single entry or by list try?: ^([0-9]{6,7}(\s?))*
$.validator.addMethod('HTH_ITEMNO',function(value,element){return this.optional(element) || /^((\s*\b[0-9]{3,7}\b[\s,]?)*)$/.test(value);}, "Search by Item #(s) using 3 - 7 digits per item.");

//  isequal - replaces equalTo - allows name reference or string  -----------------------------------------------------------
$.validator.addMethod("HTH_isequal", function (value, element, param)
{
	console.log('param'+param);
	
	if(param instanceof jQuery) {
		var target = $(param).val();
 	}
 	else {
 		var target = param; 
 	}
	if (this.optional(element)) return true;
	else if (value || target.trim() != "") return $.trim(value) == $.trim(target);
    else return true;
}, "Value must be equal to {0}.");

$.validator.addMethod("HTH_notif", function (value, element, param)
{
	if(param[0] instanceof jQuery) var target = param[0].val();
 	else var target = param; 
 	if (this.optional(element)) return true;
	else if (value && target.trim() != "") return false;
    else return true;
}, "***SUPPLY ERROR MESAGE***");

//num - Numeric  - leading spaces are allowed --------------------------------------------------------------------
$.validator.addMethod("HTH_num", function(value, element) {
return this.optional(element) || /^\s*[0]*[1-9]+[0-9]*\s*$/i.test(value);
}, "Not a valid positive number.");

//num - Numeric  - leading spaces are allowed --------------------------------------------------------------------
$.validator.addMethod("HTH_num0", function(value, element) {
return this.optional(element) || /^\s*[0-9]*\s*$/i.test(value);
}, "Not a valid positive number.");

//  PersonName - Validate a person's name---------------------------------------------------------------------------------------
$.validator.addMethod("HTH_PersonName", function (value, element) {
 return this.optional(element) || /^\w(?:\w+|([.\x20])(?!\1))+\s*$/i.test(value);
}, "Name is not correct.");

// HTH_RegularExpress
$.validator.addMethod('HTH_RegExpress',function(value,element,regexpress){
	 return this.optional(element) || regexpress.test(value);
}, "Location can only consist of one selection using this option");

//  RequireIfCheck - A field is required if any check boxes with the same name are checked------------------------------------------
$.validator.addMethod("HTH_RequireIfCheck", function (value, element, param)
{
    eval('var atLeastOneIsChecked = $("'+param+':checked").length > 0;');
    if (value || atLeastOneIsChecked) return value.trim() != '';
    else return this.optional(element);
}, "***ADD CUSTOM MESSAGE***");

// HTH_SelectValue - Ensure that option is not disabled and selected
$.validator.addMethod("HTH_SelectValue", function(element) 
{  
	var $select;
	if ( element instanceof $){ 
		$select = element;
	}
	else
		$select = $(element);
	
	var name = $select.attr('id');
	var elem;
	//console.log("name = " +name);
	if(name !== undefined){
		elem = $("#" + name + " option:selected:not([disabled])");
	}
	else{
		name = $select.attr('name');
	    elem = $("[name='" + name + "']" + " option:selected:not([disabled])");
	}
	
	if(elem)
       return true;
    else
       return false;
          
}, "Please select an option");
// UPC search iteminquiry
$.validator.addMethod('HTH_UPC',function(value,element){return this.optional(element) || /^[0-9]{8,14}\s*$/.test(value);}, "Search items by entering a single UPC between 8 - 14 digits.");
/*	NEEDS WORK HA HA	// Custom Validations-----------------------------------------------------------------
	$.validator.addMethod('HTH_RegXNumQuantifier',function(value,element,params){
		        var regXStr = "/^[0-9]{";
		        alert(params[1]);
        	 	//get quantifier
        		if(!$.trim(params[0])  && !$.trim(params[1]))
	    			regXStr += params[0] + "," + params[1] + "}\s*$/"; //min,max quantifier
	    		else
	    			regXStr += params[0] + "}\s*$/.test(value);"; //just max for both
                 var pattern = new RegExp(regXStr);
                
        		return this.optional(element) || pattern.test(value);
	    	}, 
	    	function(value,element,params){
	    		if(!$.trim(params[0])  && !$.trim(params[1]))
		    		return "Enter a valid number that has between {1} and {2} digits!" 
		    	else
		    		return "Enter a valid number that has {1} digits!"
	    		
	});*/
// Telephone number formats allowed 1234567890, 123-456-7890, 123.456.7890, 123 456 7890, (123) 456 7890
$.validator.addMethod('HTH_TelephoneEmail', function (value, element){
	var phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\s*$/;
	var emailRegex =  /^\s*\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*\s*$/;
	return this.optional(element) || phoneRegex.test(value) || emailRegex.test(value);
	}, function(value, element){ 
	var tel = element.value;
	var digits = /^(\d+\s*){1,3}$/;
	if(tel.indexOf('@') > -1)
		return "Please enter a valid Email (eg: johndoe@yahoo.com)";
	else if(digits.test(tel))
		return "Please enter a valid Phone Number (eg: 231-555-5555)";
    else		
		return "Please enter a valid Phone Number (eg: 231-555-5555) or Email (eg: johndoe@yahoo.com)";
	});
// Velocity data by ItemNo going back up to 999 days - one zero (ie: 01,02,03) allowed
$.validator.addMethod('HTH_Vel999Days', function (value, element){return this.optional(element) || /^\s*[0-9]{1,3}\s*$/.test(value);}, "Must enter 999 days or less for Velocity data.");