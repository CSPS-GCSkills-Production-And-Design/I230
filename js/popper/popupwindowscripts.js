var popup;
var confirmExitMessage;

function launchPop(target) {
	
    //temporary popper
    var params = [
        'height=' + screen.height,
        'width=' + screen.width,
        'scrollbars=1',
        'resizable=1'//,
       // 'fullscreen=yes' // only works in IE
    ].join(',');

    //window.onbeforeunload = confirmExit;
    popup = window.open(target, 'popup_window', params);
    popup.moveTo(0, 0);
    window.top.resizeTo(100, 50);
    window.top.moveTo(9999, 9999);
	
}

function checkLaunch(target){
	var scormIsOn=getAPIHandle()!=null
	if(scormIsOn ){
		isInit=doLMSInitialize();
		if (isInit){
			var bookmark=doLMSGetValue("cmi.core.lesson_location");
			var bookmarkPresent=(bookmark.length>0)?true:false;
			if(doLMSGetValue("cmi.core.lesson_status") != "completed")	{
				doLMSSetValue("cmi.core.lesson_status", "incomplete");
				doLMSCommit();
			}	
		}
	}
	//launchPop(target)
	if(skipSplash || bookmarkPresent){
		launchPop(target)
	}
}


function callAlert(msg) {

}

function quitCourse() {
    forceChildClose = true;
    popup.close();
    window.top.close();
}

//confirm exit.
function confirmExit() {
    //add a checkup for language.
    return confirmExitMessage;
}



// JavaScript Document
lmsConnected = LMSIsInitialized();
addEvent(window, 'load', loadPage, false);
addEvent(window, 'beforeunload', doQuit, false);

var forceChildClose = false;

function loadPage() {
    //Charger les valeurs instanciées dans le Cookie par la page de départ du SCO.
    if (lmsConnected) {
        var url = document.location.href;
        bookmark = doLMSGetValue("cmi.core.lesson_location");
        if (url.indexOf("quit", 0) == -1 && bookmark !== url && url.indexOf("index") == -1) {
            doLMSSetValue("cmi.core.lesson_location", url);
            bookmark = url;
        }
    }
}

function doQuit(e) {

    var url = document.location.href;
    if ((url.indexOf("launch") > -1) && (url.indexOf(".html") > -1) && (popup)) {
        forceChildClose = true;
        popup.close();
    }

    if (lmsConnected) {
        lessonStatus = doLMSGetValue("cmi.core.lesson_status");
        if (lessonStatus == "completed" || lessonStatus == "passed") {
            doLMSSetValue("cmi.core.exit", "");
        }
        else {
            doLMSSetValue("cmi.core.exit", "suspend")
        }
        doLMSCommit();
    }
}

function noclose(){
	document.getElementById("noclose").className="";
}