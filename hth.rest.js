 /**
 * jquery.custom.hth-rest.js 
 * Author: Brian V Streeter
 * Create Date: 7/8/2016
 * About: File is used to store global ajax/restful calls via HTHREST
 *
 */
/**
*  Plugins
*
* serializeObject used for serializing forms for POST ajax 
* NOTE: See contact_us.php
* TODOS: Needs $('option:selected',this);
$('option:selected',this).attr('value'); 
*/
 $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
		var $value = '';
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };	 

$.fn.fadeOutBox = function(speed){
	
	var boxleft = $(this).outerWidth()/2;
    var boxtop  = $(this).outerHeight()/2;
	var imgleft = $(this).find('img').outerWidth()/2;
    var imgtop  = $(this).find('img').outerHeight()/2;
	if(speed.toLowerCase !== "slow" || speed.toLowerCase !== "fast")
		speed = 'slow';
    $(this).animate({
        'opacity' : 0,
        'width': 0, 
        'height': 0,
        'left': boxleft + 'px',
        'top': boxtop + 'px'
    },speed);
	if(typeof imgtop != "undefined"){
    $(this).find('img').animate({
        'opacity' : 0,
        'width': 0, 
        'height': 0,
        'left': imgleft + 'px',
        'top': imgtop + 'px'
    }, speed);
	}
};	
  /*
  *  Trim input on focusout
  */
  $.fn.trimInput = function (){
	  $(this).on("focusout ", function(e){
		  var input = $.trim($(this).val());
		  $(this).val(input);
	  });
  }
/* Simple conversions for JSON */
function jsonToURI(json){ return encodeURIComponent(JSON.stringify(json)); }

function uriToJSON(urijson){ return JSON.parse(decodeURIComponent(urijson)); }
/**
 * Gets User's Email by passing jQuery selector or selector string, userid, instance 
 * @param $USER
 * @param $PATH_INSTANCE
 * @return $("'"+element+"'").val(json.Address)
 */

function GetEmail(element, user, instance){  

	var data =  'USERID=' + user +
	        '&INSTANCE=' + instance + "'";

	$.getJSON( "http://webservices.hthackney.com/WEB892?callback=?",data )
	.done(function( json ) {
	        
			 var email = $.trim(json.Address);
			 if ($.trim(json.Address.length) > 0){ 
				if ( element instanceof $)  
					element.val($.trim(json.Address));
                else
                    $(element).val($.trim(json.Address)); 				
			 }
	})	
	.fail(function( jqXHR, textStatus, error ) {
	var err = textStatus + ", " + error;
	alert('Unable to Connect to Server.\n Try again Later.\n Request Failed: ' + err);
	}); 
}

/**
 * Gets User's authorized warehouses by passing jQuery selector or selector string, userid, instance, function 
 * @param $USER
 * @param $PATH_INSTANCE
 * @param $FUNCTIONCODE
 * @return json  
        $.each(json, function (k, v) {
           $select.append('<option value=' + v.whsno + '>' + v.whsnam + '</option>');
        });
	USAGE: 
		    <div class="warehouses hidden">
           		<label class="control-label">Warehouse</label>(Sorted by Number)<br>
        		<select name="WHSE" class="hth_default xs-small">
                <option value="" selected disabled> -- Please select a warehouse -- </option>
                </select>
            </div>
 */

function GetWarehouses(element, user, instance, funkshun){  

	var data =  'USERID=' + user +
	        '&INSTANCE=' + instance + 
			'&FUNCTION=' + funkshun;

	$.getJSON( "http://webservices.hthackney.com/WEB901?callback=?",data )
	.done(function( json ) {
		    var $select;
			if ( element instanceof $)  
				$select = element;
			else
				$select = $(element);
		
    		if(json.ERROR){
				//alert(json.ERROR);
			   	$select.closest('form').find(".alert-danger").html(json.ERROR).show();
	    	}	
		    else
				$.each(json, function(k,v){
					$select.append('<option value="' + v.WHSNO + '">' + v.WHSNO + "&nbsp;" + v.WHSNAM + '</option>');
				});
			//console.log( $select.children('option').length);
			//hide warehouse drop down if only one option
			if($select.children('option').length == 2){
				$select.prop('selectedIndex', 1);
				$select.closest("div").addClass("hidden");
			}
			else{
				 $select.find("option:first:disabled").attr("selected", true);
				 $select.parent("div").removeClass("hidden");	
			}
	})	
	.fail(function( jqXHR, textStatus, error ) {
	var err = textStatus + ", " + error;
	alert('Unable to Connect to Server.\n Try again Later.\n Request Failed: ' + err);
	}); 
}
/**
 * Gets User's authorized customers by warehouses by passing jQuery selector or selector string, userid, instance, function, whsno 
 * @param $USER
 * @param $PATH_INSTANCE
 * @param $FUNCTIONCODE
 * @param whsno
 * @param sort
 * @return json  
        $.each(json, function (k, v) {
           $select.append('<option value=' + v.custno + v.cusloc + '>' + v.custno + ' - ' + v.cusloc + '(' + v.shpnam + ')' + '</option>');
        });
    USAGE: 
	          <div class="locations hidden">
           		<label class="control-label xs-small">Location</label>(Sorted by Number)<br>
        		<select id="locn" name="LOCN" class="hth_default xs-small">
                <option value="" selected disabled> -- Please select a warehouse -- </option>
                </select><br>
			    <div id="sort" class="btn btn-xs default">
						<i class="fa fa-sort-alpha-asc"></i> Sort By Name
			    </div>
             </div>
 */

function GetLocations(element, user, instance, funkshun, whsno, sort){  
    var isId = false;
	var data =  'USERID=' + user +
	        '&INSTANCE=' + instance + 
			'&FUNCTION=' + funkshun + 
            '&WHSNO=' + whsno + 
			'&SORT=' + sort;
			//console.log(data);
	$.getJSON( "http://webservices.hthackney.com/WEB902?callback=?",data )
	.done(function( json ) {
			var $select;
			if ( element instanceof $){ 
				$select = element;
			}
			else
				$select = $(element);
				
			var name = $select.attr('id');
			//console.log("name = " +name);
			if(name !== undefined){
				isId = true;
				var elem = $("#" + name + " option:not(:disabled)").remove();
			}
			else{
				name = $select.attr('name');
			  $("[name='" + name + "']" + " option:not(:disabled)").remove();	
			}	
	    //alert(JSON.stringify(json));
        if(json.ERROR){
			$select.closest('form').find(".alert-danger").html(json.ERROR).show();
		}	
		else
			$.each(json, function (k, v) {
			   $select.append('<option value="' + v.CUSTNO + v.CUSLOC + '">' + v.CUSTNO + '-' + v.CUSLOC + '(' + v.SHPNAM + ')' + '</option>');
			});
	    //console.log( $select.length + " or " + $select.children('option').length); 
	    //hide locations dropdown if only option
    	if($select.children('option').length == 2){
			$select.prop('selectedIndex', 1);
			//console.log($(".warehouses").hasClass("hidden"));
			if($(".warehouses").hasClass("hidden"))
		    	$select.parent("div").addClass("hidden");
		}
	    else{
	       $select.find("option:first:disabled").attr("selected", true);
           $select.closest("div").removeClass("hidden");	
        }			
	})	
	.fail(function( jqXHR, textStatus, error ) {
	var err = textStatus + ", " + error;
	alert('Unable to Connect to Server.\n Try again Later.\n Request Failed: ' + err);
	}); 
}

function getStackTrace () {

  var stack;

  try {
    throw new Error('');
  }
  catch (error) {
    stack = error.stack || '';
  }

  stack = stack.split('\n').map(function (line) { return line.trim(); });
  return stack.splice(stack[0] == 'Error' ? 2 : 1);
}

var SortList = function(selector){
	var options = $(selector + ' option');
    var arr = options.map(function(_, o) { return { t: $(o).text(), v: o.value }; }).get();
    arr.sort(function(o1, o2) { return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; });
    options.each(function(i, o) {
    o.value = arr[i].v;
    $(o).text(arr[i].t);
});
}
/*
* How to use AJAX response to load tableId
* <table id="data-table">
    <tr><td>There are no items...</td></tr>
  </table>
* USAGE: loadTable('data-table', ['field1', 'field2', 'field3'], jsonData);
*
*/
function loadTable(tableId, fields, data) {
	    var $id;
		if (tableId instanceof $) 
			$id = tableId;
		else
			$id = $(tableId);
    //$('#' + tableId).empty(); //not really necessary
    var rows = '';
    $.each(data, function(index, item) {
        var row = '<tr>';
        $.each(fields, function(index, field) {
            row += '<td>' + item[field+''] + '</td>';
        });
        rows += row + '<tr>';
    });
    id.html(rows);
}
	function cutoff(str, charr) {
	 var i = str.indexOf(charr);
     //console.log(str.substr(0, i) +"index = " + i);
	 if(i > 0)
	  return  str.substr(0, i);
	 else
	  return str;     
    }

//http://jsfiddle.net/onury/kBQdS/
/*
 var data1 = [
        { field1: 'value a1', field2: 'value a2', field3: 'value a3', field4: 'value a4' },
        { field1: 'value b1', field2: 'value b2', field3: 'value b3', field4: 'value b4' },
        { field1: 'value c1', field2: 'value c2', field3: 'value c3', field4: 'value c4' }
        ];
    
    var data2 = [
        { field1: 'new value a1', field2: 'new value a2', field3: 'new value a3' },
        { field1: 'new value b1', field2: 'new value b2', field3: 'new value b3' },
        { field1: 'new value c1', field2: 'new value c2', field3: 'new value c3' }
        ];
    
    var dt = dynamicTable.config('data-table', 
                                 ['1', '2', '3','4','5'], 
                                 ['Del?','Whsno','Customer','Loc','Name'],
					Add classes to tds TODOS:['col-xs-1 col-sm-1 col-md-1 col-lg-1','col-xs-2 col-sm-2 col-md-2 col-lg-2',...]
        						 //set to null for field names instead of custom header names
                                 'There are no items to list...');
    
    $('#append').click(function(e) {dt.load(data1, true);});
    $('#clear').click(function(e) {dt.clear();});
*/
var dynamicTable = (function() {
    
    var _table, _fields, _headers,  
		_classes, _tableId,
        _defaultText;
    
    /** Builds the row with columns from the specified names. 
     *  If the item parameter is specified, the memebers of the names array will be used as property names of the item; otherwise they will be directly parsed as text.
     */
     function buildRowColumns(isTh, names, item) {
       
        if (names && names.length > 0)
        {
			 var row = '<tr>';
            $.each(names, function(index, name) {
                var c = item ? item[name+''] : name;
				if(isTh === true)
				   row += '<th>' + c + '</th>';
			    else
                   row += '<td>' + c + '</td>';
            });
			row += '<tr>';
        }
        
        return row;
    }

    /** Builds and sets the headers of the table. */
    function setHeaders() {
        // if no headers specified, we will use the fields as headers.
        _headers = (_headers == null || _headers.length < 1) ? _fields : _headers; 
        var h = buildRowColumns(true, _headers);
        if (_table.children('thead').length < 1) _table.prepend('<thead></thead>');
        _table.children('thead').html(h);
    }
    
    function setNoItemsInfo() {
        if (_table.length < 1) return; //not configured.
        var colspan = _headers != null && _headers.length > 0 ? 
            'colspan="' + _headers.length + '"' : '';
        var content = '<tr class="no-items"><td ' + colspan + ' style="text-align:center">' + 
            _defaultText + '</td></tr>';
        if (_table.children('tbody').length > 0)
            _table.children('tbody').html(content);
        else _table.append('<tbody>' + content + '</tbody>');
    }
    
    function removeNoItemsInfo() {
        var c = _table.children('tbody').children('tr');
        if (c.length == 1 && c.hasClass('no-items')) _table.children('tbody').empty();
    }
    
    return {
        /** Configres the dynamic table. */
        config: function(tableId, fields, headers, defaultText) {
            if (tableId instanceof $) 
			_table = tableId;
		    else
			_table = $(tableId);  
             _tableId = _table.attr('id');		
            _fields = fields || null;
            _headers = headers || null;
            _defaultText = defaultText || 'No items to list...';
			setHeaders();
            setNoItemsInfo();
            return this;
        },
        /** Loads the specified data to the table body. */
        load: function(data, append) {
            if(_table.length < 1) return; //not configured.
			 setHeaders();
             removeNoItemsInfo();
            if (data && data.length > 0) {
                var rows = '';
                $.each(data, function(index, item) {
                    rows += buildRowColumns(false, _fields, item);
                });
                var mthd = append ? 'append' : 'html';
                _table.children('tbody')[mthd](rows);
            }
            else {
                setNoItemsInfo();
            }
            return this;
        },
        /** Clears the table body. */
        clear: function() {
             setNoItemsInfo();
            return this;
        },
		addStyle: function(elem, index, cssClass){
			 if(index === 'all'){
		     _table.find(elem).each (function() {
                $(this).addClass(cssClass);  
              });
			 }else{	
              $("#" + _tableId + " tr " + elem + ":eq(" + index + ")").each (function() {
                $(this).addClass(cssClass);  
              });			 				
			 }
		  //return this;
		}
    };
}(jQuery));