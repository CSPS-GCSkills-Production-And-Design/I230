//Javascript document
		var courseLegacyCode = "I230"; 										//C000
		var courseTitle_en="Information Management:";					//course title english
		var courseTitle_fr="La gestion de l’information ";	//course title french
		var courseSubtitle_en="Supporting Programs and Services";										//course subtitle english
		var courseSubtitle_fr="à l’appui des programmes et des services";										//course subtitle french
		var cssFileName="I230.css";									//name of the css theme file to load.



		var lang=$("html").attr("lang");
		var skipSplash=false;

		var browser = ""
		var versionPattern = new RegExp(/MSIE [0-9]{1}\./ig);		
		if(navigator.userAgent.match(versionPattern)!=null)	{
			browser = "lt-ie10";
		}
/*------------------ Toolbar -----------------*/		
		var showLangSwitch =true;
		var showHome = true;
		var showHelp = true;
		var showToolbox = true;
			var showGlossary = true;
			var showResources = true;
		var showExit = true;

/*------------------ VIEWED SUBS -----------------*/
		var trackViewedSubs = true;					// This will track all viewed pages in the course
		var trigger_completion_Viewed_Subs = true;	// This will trigger course completion once all pages are viewed

/*------------------ TIMELINE -----------------*/
	var tlPermissive = true; 	//is the timeline going to take sub-modules into account?
        var lvlTimeline = 1;		//Level at which the timeline acts
        var minTimeline = 3;		// hm... whats this again? most likely to use with permissive.
		var tlContent=true;			//is the timeline within the content (not in te frame).
		var tlPlace=""; 	//this is the spot where we need to append and add the timeline div. default is below the first h3
		

/*------------------ navigation -----------------*/
		var loopLevel=3; // 0 is a course loop, 1 takes you back to home after each module, 3 is none (2 makes no sense so far) 
		var markOnLast=false;
		var topNavFullwidth=true;
		var breadCrumbs=false;
		var breadCrumbsSpecial=true;
/*------------------ External Links-----------------*/		
		var extMethod=""; //default is target=_blank, other valudes : "lightbox" "popup". overeridé local avec data-extmethod="value"
/*------------------ Debug -----------------*/		
 		var debugMode=false;
