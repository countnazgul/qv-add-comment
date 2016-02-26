// Comments
// Author: stefan.stoichev@gmail.com
// Version: 0.1.0
// Repo: https://github.com/countnazgul/qv-add-comment

var selections = [];
var osUser = "";
var _path = Qva.Remote + "?public=only&name=Extensions/Comments/";
var selectedNode = '';

function extension_Init() {
  Qva.LoadScript(_path + "jquery.js", extension_Done);
}

if (Qva.Mgr.mySelect === undefined) {
  Qva.Mgr.mySelect = function(owner, elem, name, prefix) {
    if (!Qva.MgrSplit(this, name, prefix)) return;
    owner.AddManager(this);
    this.Element = elem;
    this.ByValue = true;

    elem.binderid = owner.binderid;
    elem.Name = this.Name;

    elem.onchange = Qva.Mgr.mySelect.OnChange;
    elem.onclick = Qva.CancelBubble;
  };
  Qva.Mgr.mySelect.OnChange = function() {
    var binder = Qva.GetBinder(this.binderid);
    if (!binder.Enabled) return;
    if (this.selectedIndex < 0) return;
    var opt = this.options[this.selectedIndex];
    binder.Set(this.Name, 'text', opt.value, true);
  };
  Qva.Mgr.mySelect.prototype.Paint = function(mode, node) {
    this.Touched = true;
    var element = this.Element;
    var currentValue = node.getAttribute("value");
    if (currentValue === null) currentValue = "";
    var optlen = element.options.length;
    element.disabled = mode != 'e';

    for (var ix = 0; ix < optlen; ++ix) {
      if (element.options[ix].value === currentValue) {
        element.selectedIndex = ix;
      }
    }
    element.style.display = Qva.MgrGetDisplayFromMode(this, mode);
  };
}

function extension_Done() {
  Qva.AddExtension('Comments', function() {
    var _this = this;
    var divName = _this.Layout.ObjectId.replace("\\", "_");

	Qv.GetCurrentDocument().GetCurrentSelections({
	    onChange: function () {
		  var f, data = this.Data.Rows;
		  selections = [];
		  for (f = 0; f < data.length; f++) {
			if( selectionFields.indexOf(data[f][0].text) > -1 ) {
				selections.push( { field: data[f][0].text, value: data[f][2].text });				
			}
		  }
		}
	});
	
    if (_this.Element.children.length === 0) {
      var ui = document.createElement("div");
      ui.setAttribute("id", divName);
      _this.Element.appendChild(ui);
    } else {
      $("#" + divName).empty();
    }

    var serverURL = _this.Layout.Text0.text.toString();
    var showComments = _this.Layout.Text1.text.toString();
    var inputSize = _this.Layout.Text2.text.toString();
	inputSize = inputSize.split('/');
	var inputSizeRows = inputSize[0];
	var inputSizeCols = inputSize[1];
	var selectionFields = _this.Layout.Text3.text.toString();
	selectionFields = selectionFields.split(',');
	osUser = _this.Layout.Text4.text.toString();

	
    if (serverURL.slice(-1) == "/") {
      serverURL = serverURL.slice(0, -1)
    }
	
    window.GetComments = function() {	
      if (showComments == "true") {
        var isVisible = $("#comments").is(":hidden");
        if (isVisible == true) {
          $('#comments').toggle()
        }
        jQuery.support.cors = true;
        $.get(serverURL + "/comments",{ "_": $.now() }, function(data) {
          $('#comments').html('');
          if (data.length != 0) {
		  
            for (var i = 0; i < data.length; i++) {
              $('#comments').append('<div>' + data[i].comment + '</div>')
            }
          } else {
            $('#comments').append('<div>No comments</div>')
          }
        }).fail(function() {
			$('#status').append('Error! Cannot connect to the server')
		});
      } else {
        $('#comments').toggle()
      }
    }	

    window.addComment = function() {
      var comment = $('#comment').val();
	  var today = new Date();
	  var mm = today.getMonth() + 1;
	  var dd = today.getDate();
	  var yy = today.getFullYear();

	  currentHours = today.getHours();
	  currentHours = ("0" + currentHours).slice(-2); 
	  currentMins = today.getMinutes();
	  currentSec = today.getSeconds();
	  var todayDate = yy+''+mm+''+dd + ' ' + currentHours + ':' + currentMins + ':' + currentSec;
	  var variableContent = "";
	  var formattedToday = todayDate;
	  
	  if( comment.length > 0 ) {
		  $.ajax({
			type: "POST",
			url: serverURL + "/addcomment",
			data: JSON.stringify({
			  comment: comment,
			  dateAdded: formattedToday,
			  user: osUser,
			  selections: selections
			}),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
		  }).done(function(data) {
			$('#comment').val('')
			$('#status').text('Saved');
			$('#status').fadeOut(2000);
			//GetComments()			
		  }).fail(function(jqXHR, textStatus) {
			$('#status').text('Error! Cannot connect to the server.')
			$('#status').fadeOut(2000);
		  });
	  } else {
		$('#status').text('Please enter comment');
		$('#status').fadeOut(2000);
	  }
    }
	
    //GetComments();
    $('#' + divName).append('<textarea rows="' + inputSizeRows + '" cols="' + inputSizeCols + '" type="text" id="comment" value="" ></textarea>');
    $('#' + divName).append('<input type="button" id="commentSubmit" value="Submit" onclick="addComment()"/>');
    $('#' + divName).append('<span id="status" margin-left: 10px; /></span>');
    $('#' + divName).append('<div id="comments" style="overflow:auto; height:' + this.GetHeight() + 'px;width:' + this.GetWidth() + 'px;"></div>');
  })
}

extension_Init();
