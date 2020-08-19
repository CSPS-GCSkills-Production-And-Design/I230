(function() {
	function detectIE() {
		var ua = window.navigator.userAgent;
	
		var msie = ua.indexOf('MSIE ');
		if (msie > 0) {
			// IE 10 or older => return version number
			return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		}
	
		var trident = ua.indexOf('Trident/');
		if (trident > 0) {
			// IE 11 => return version number
			var rv = ua.indexOf('rv:');
			return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
		}
	
		var edge = ua.indexOf('Edge/');
		if (edge > 0) {
		   // IE 12 => return version number
		   return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
		}
	
		// other browser
		return false;
	}
	
	$.printContents = function(selector) {
			var $printTable = $(selector),
				contents = $printTable.html(),
				title = $printTable.closest("div.modal-content").find(".modal-header .modal-title").text(),
				$printFrame = $('<iframe />').attr('name', 'printFrame').css({ "position": "absolute", "top": "-1000000px" }).appendTo("body"),
				pf = $printFrame[0],
				frameDoc = pf.contentWindow ? pf.contentWindow : pf.contentDocument.document ? pf.contentDocument.document : pf.contentDocument;
				
			frameDoc.document.open();
			//Create a new HTML document.
			frameDoc.document.write(
				'<html><head><title>' + title + '</title>' +
				'<!--[if gte IE 9 | !IE ]><!-->' +
				'    <link href="https://fonts.googleapis.com/css?family=Titillium+Web:600&amp;subset=latin,latin-ext" rel="stylesheet" type="text/css">' +
				'    <link href="./assets/favicon.ico" rel="icon" type="image/x-icon" />' +
				'    <link rel="stylesheet" href="./css/wet-boew.css" />' +
				'<!--<![endif]-->' +
				'<!--[if lt IE 9]>' +
				'    <link href="./assets/favicon.ico" rel="shortcut icon" />' +
				'    <link rel="stylesheet" href="./css/ie8-wet-boew.css" />' +
				'<![endif]-->' +
				'<link rel="stylesheet" class="theme" href="./theme/CSPS_fix.css" />' +
				'<link rel="stylesheet" class="theme" href="theme/pm.css" />' +
				'<!--[if IE 8]>' +
				'    <link rel="stylesheet" class="theme" href="theme/pm_IE8.css" />' +
				'<![endif]-->' +
				'</head><body>' +
				'<h1>' + title + '</h1>' +
				contents +
				'</body></html>'
			);
			frameDoc.document.close();
			
			setTimeout(function () {
				if (detectIE()) { //wb.ie) {
					frameDoc.document.execCommand('print',false, null);
				} else {
					window.frames["printFrame"].focus();
					window.frames["printFrame"].print();
				}
				$printFrame.remove();
			}, 500);
	};
})();