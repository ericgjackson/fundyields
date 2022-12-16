// import {errorMessage} from "./messages.js";

// "Bad gateway" signifies server down.  Possibly crashed during request, can't tell.
// "JSON type exception" could signify unexpected parameters sent
var failure = function(request, error, displayError) {
    let errorMsg = "Error \"" + error + "\" on " + request + " request";
    console.log(errorMsg);
    if (displayError) {
	// errorMessage(errorMsg);
    }
};

// "action" is the unique part of the URL
// If you pass in "play", we make a call to "/wordhex/api/play/".
//   I think the uri needs a trailing slash for some security reason.
// Pass the params in context in case we want to access them with "this" in the callback:
//   https://stackoverflow.com/questions/5097191/ajax-context-option
// Don't think we need success callback.
// Don't think we need cache: false
// Don't think we need processData: false
var makeAjaxRequest = function(action, params, callback, displayError=true) {
    var jqxhr = $.ajax({type: "POST",
			dataType: "json",
			timeout: 5000,
			url: "/fundyields/api/" + action + "/",
			cache: false,
			headers: {
			    'Content-Type': 'application/json',
			    'Accept': 'application/json'
			},
			// This may be needed for passing cookies?
			// Or is this only for cross-domain?
			crossDomain: true,
			xhrFields: {withCredentials: true},
			data: JSON.stringify(params),
			context: params,
			processData: false,
			success : function(data) {}
		       })
	.done(callback)
	.fail(function(jqxhr, textStatus, error) {failure(action, error, displayError)});
};

export {makeAjaxRequest};
