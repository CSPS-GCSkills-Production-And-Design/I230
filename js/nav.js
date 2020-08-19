// JavaScript Document
/*---------------------------------------------------------------------------------------
                                      NavStructure
---------------------------------------------------------------------------------------									  
		COMMENTS:
---------------------------------------------------------------------------------------*/
function navStructure() {
        this.levels = new Array(); //=new objNiveau(0, this)
        this.menuHtml; //this is the jquery object for the menu (UL.supermenu) from ajax/supermenu_en.html
        this.maxDepth; //number of levels total
        this.subs = new Array(); //this is where we'll stick sub elements (li's in the menu)
        this.flatList = new Array(); //this is the list of all page objects (subs that lead to an actual page)
        this.currentNav = new Array(); //array of current position
		this.currentSub;//sub that's currently loaded
		this.currentFlat; //index of flatList that'S being pointed at.
		this.targetNav = new Array(); // this is the array of a page that is to be loaded
		this.isPageLocked = false; //specifies if navigation is locked (lockPage() || unlockPage())
        //timeline;
        this.timelinePermissive = tlPermissive; 
        this.lvlTimeline = lvlTimeline;
        this.minTimeline = minTimeline;
		this.timelineContent=tlContent;
		this.tlPlace=tlPlace;

		/*--------------------------------------------------------------------------------
							METHODS of NavStructure
		---------------------------------------------------------------------------------*/	
        /*--------------------------------------------------------------------------
							POPULATE:
		  --------------------------------------------------------------------------							
							populate the structure, generate all subobjects
							reading the menuHTML, set the maxdepth, then loop through
							all the levels, create all the lvl and sub objects and set 
							the relations between them, then add them to flatList.
		----------------------------------------------------------------------------*/
        //Method to populate the structure, generate subobjects
        this.populate = function () {

		
                this.menuHtml = $("#wb-sm").children("div.nvbar").children("div.row").children("ul.supermenu");
				this.menuHtmlMb=$("#sm-pnl").children("ul.mb-menu");
                this.maxDepth = $(this.menuHtml).children("li").length;
                //loop through the levels
                for (lvls = 0; lvls < this.maxDepth; lvls++) {
                    //if this is the first lvl, the parent is the root structure aka this;
                    //otherwise, pass the previous level as the parent
                    var thisParent = (lvls == 0) ? this : this.levels[lvls - 1];
                    // get title from HTML
                    var thisTitle = $(this.menuHtml).children().eq(lvls).children("a").text();
                        //add a level to the structure, pass its depth and parent, and obj
                    this.levels[this.levels.length] = new objNiveau(this.levels.length, thisParent, thisTitle, $(this.menuHtml).children().eq(lvls).children("a"));
                    var thisSubs = $(this.menuHtml).children("li").eq(lvls).children("ul").children("li");
					var thisSubsMb=$(this.menuHtmlMb).children("li").eq(lvls).children("details").children("ul").children("li");
                        // -----------LOOP for all elements within this LEVEL --------------
                  for (subs = 0; subs < $(thisSubs).length; subs++) {
					  $(thisSubs).children().eq(subs).attr("onclick", "javascript:fNav(this.getAttribute('data-target'));return false;"); //added to remove redundance in menu syntax (supermenu)
					  $(thisSubsMb).children().eq(subs).attr("onclick", "javascript:fNav(this.getAttribute('data-target'));return false;"); //added to remove redundance in menu syntax (supermenu)
                    //Créé un nouveau Sub à l'intérieur du niveau
                        this.levels[lvls].subs[this.levels[lvls].subs.length] = new objSub(lvls, this.levels[lvls], $(thisSubs).children().eq(subs));
                        if (this.levels[lvls].subs[this.levels[lvls].subs.length - 1].isPage) {
                            //set aria-controls
                            $(this.levels[lvls].subs[this.levels[lvls].subs.length - 1].obj).attr("aria-controls", "dynamic_content");
                            //add to flatList
                            this.flatList[this.flatList.length] = this.levels[lvls].subs[this.levels[lvls].subs.length - 1];
                        }
	                 }
			
                }

				//now since the hierarchy is setup, we need to set the aria stuff, starting at the root subs
				//originally we were supposed to use something recursive. .. that failed.... ... 
				//CSPS SJ maybe someday do the recursive thing... for fun's sake.
				for (lvls = 0; lvls < this.levels.length; lvls++) {

					for (subs = 0; subs < this.levels[lvls].subs.length; subs++) {
						if(this.levels[lvls].subs[subs].subs.length>0 ){
							this.levels[lvls].subs[subs].setChildrenAria();
							//add an if for 1st levels
						}else{

						}
					}
					
				}
				scorm.initLessonStatus();
				//check to see if there's a toolbox
				if($(".toolbox").length >0){

					this.toolbox=new objToolbox($(".toolbox").eq(0));
				}

				//fix lightbox problems in mobile sc
				$(".wb-mb-links .wb-lbx").click(function(e){
					e.preventDefault();		   
					$('#wb-lng #'+this.id.replace('mb-','')).trigger('click');
				}); 
			
                //since the list is populated in 2D (lvl 1, then lvl2, etc, so it would go m1, m8, and then m2-1 and so on.
                this.reorderFlatList();
                //set the navigation default
                if (showResources){this.loadExt();} //load external link list
                if (showGlossary){this.glossary=new objGlossary();} //load glossaire
				this.getFirstPage();//we'll put the bookmark in there
				if (!this.timelineContent){$(this.tlPlace).append("<div id='timeline'></div>");}
                this.loadTarget();
				this.setNav();//set how the menu'll look
				this.addSwipe();
				//this.addAutomations();

            } //end populate
		/*--------------------------------------------------------------------------
							getViewedSubs
		  --------------------------------------------------------------------------
		  					goes through the scorm object to set if viewed
							affect objSubs and html were viewed
							get info from scorm object
		----------------------------------------------------------------------------*/
		this.getViewedSubs = function (){			
			viewedList = trackingObj.getData("vp");			
			if(viewedList){// if we have viewed pages/subs
				viewedList = viewedList.split(";");
				for(var i=0;i<viewedList.length-1;i++){ 
					viewedObj = viewedList[i].split("-");
					this.findSub(viewedObj).setViewedSubs();// set viewed for objSub and html			
				}
			}	
		}
        /*--------------------------------------------------------------------------
							REORDERFLATLIST:
		  --------------------------------------------------------------------------							
							flatList is generated in a 2D manner (all the pages in
							Level 1, then all the pages in Level 2, etc)
							this method is to reorganize them all.
		----------------------------------------------------------------------------*/
            //

        this.reorderFlatList = function () {
                var newList = new Array();
				var newerList = new Array();
                for (flatLoop = 0; flatLoop < this.flatList.length; flatLoop++) {
                    newList[flatLoop] = this.flatList[flatLoop];
                }
                newList.sort(function(a,b){ return a.getNumeric()-b.getNumeric()});

                for (flatLoop = 0; flatLoop < this.flatList.length; flatLoop++) {
                    this.flatList[flatLoop] = newList[flatLoop];
                    this.flatList[flatLoop].flatID = flatLoop;
					//check if first, do the previous
					if(flatLoop==0){
						this.flatList[flatLoop].previous=null;
						
					}else{
						this.flatList[flatLoop].previous=this.flatList[flatLoop-1]
						if(flatLoop==this.flatList.length-1){
							this.flatList[flatLoop-1].next=this.flatList[flatLoop]
							this.flatList[flatLoop].next=null;
							
						}else{
							this.flatList[flatLoop-1].next=this.flatList[flatLoop]
						}
					}
                }
				//this.flatList=newList
            } //end reorderFlatList

        /*--------------------------------------------------------------------------
							SETNAV & getFirstPage:
		  --------------------------------------------------------------------------							
							this is used at the beginning, when populate is doing 
							its thing. 
							It Initializes currentNav, checks the bookmark and hides 
							menu levels that are not being used.
							also does backnext 
							
		----------------------------------------------------------------------------*/
        this.setNav = function () {
			// Add history capability for all browssers
			var State = History.getState(); // init the hystory states object
			History.options.disableSuid = true; // avoir IE problems with suid

			History.Adapter.bind(window,'statechange',function(e){ 
				// Log the State
				var State = History.getState(); 					
				History.options.disableSuid = true;
				var currentIndex = History.getCurrentIndex();
				var stateData = State.data._index;
				// prevent from loading twice when pushing state
				var internal = (stateData == (currentIndex - 1));
				if (!internal) {
					if(browser == "lt-ie10"){
						itemID = State.url.substr(State.url.lastIndexOf("/")+1);	
					}else{
						itemID = State.url.substr(State.url.lastIndexOf("=")+1);
					}
						
					popPage(itemID);	
				}				
				return false;
			});
			
            //check depth
            var localDepth = this.levels.length;
            //check  length of aTarget
           // var targetDepth = (this.firstLaunch)?1:this.targetNav.length;
		   var targetDepth=(this.firstLaunch)?1:this.targetNav.length;
            for (lvlLoop = 0; lvlLoop < localDepth; lvlLoop++) {
                if (lvlLoop >= targetDepth) {//put this back in if you want the click here to start as it was
                    //remove levels that are unused (too far deep)
                   masterStructure.levels[lvlLoop].disable();
                }
            }
			if (this.findSub(this.currentNav) == this.flatList[0]) {					
					$("#lvl1").html(labels.nav.clickStart);

                }
				
				$("#wb-sm").after("<div id='topbacknext' class='visible-xxs visible-xs visible-sm'></div>");
				if (!topNavFullwidth){$("#topbacknext").addClass("container")}
				$("#topbacknext").html("<nav class='backnext'><a href='#' class='back'></a><span>Page of</span><a href='#' class='next'></a></nav>");
				$(".back").each(function(){
					$(this).attr("onclick", "goToPrevPage();return false;");
					$(this).attr("title",  labels.nav.backBtnTxt);
					$(this).html(  labels.nav.backBtn);
					})
				$(".next").each(function(){
					$(this).attr("onclick", "goToNextPage();return false;");
					$(this).attr("title",  labels.nav.nextBtnTxt);
					$(this).html(  labels.nav.nextBtn);
					})				
				
			
            } //end setNav
			
		this.addSwipe=function(){
			$("#dynamic_content").attr("ontouchstart", "touchStart(event,'dynamic_content');") ;
			$("#dynamic_content").attr("ontouchend","touchEnd(event);" );
			$("#dynamic_content").attr("ontouchmove","touchMove(event);" );
			$("#dynamic_content").attr("ontouchcancel","touchCancel(event);" );

		}
			
			//
			this.getFirstPage=function(){
				var bookmark="";
				bookmark=(scorm.getBookmark())?scorm.getBookmark():"";
				this.firstLaunch=true;
				//Set the first page of the product for history.js
				var firstPage=this.flatList[0].sPosition;
				stateUrl = History.getState().hash;	
				// first check if already on some page								
				if(stateUrl.indexOf('state') > -1 || stateUrl.indexOf('./') > -1){
					this.firstLaunch=false;
					
					if(browser == 'lt-ie10'){
						var statePage = stateUrl.substr(stateUrl.lastIndexOf("/")+1);
					}else{
						var statePage = stateUrl.substr(stateUrl.lastIndexOf("=")+1);
					}
									
					this.targetNav=getArrayFromString(statePage);
					// verrify if targetNav is a page
					if(typeof(this.findSub(this.targetNav).isPage) == 'undefined'){ // CSPS the page does not exist in this language sc						
						this.targetNav=firstPage; // CSPS go back to first page sc
						replacePage(firstPage);						
					}
					else{ // page exists						
						replacePage(statePage);	 // add first page to history sc					
					}				
					
				}
				// check if coming from bookmark
				else if (bookmark.length>0){//there's a bookmark
					this.firstLaunch=false;
					this.targetNav=getArrayFromString(bookmark);
					replacePage(bookmark); // add first page to history sc
					
				}else{//there's no bookmark	and not coming from other language or page			
					this.targetNav=this.flatList[0].aPosition;
					replacePage(firstPage); // add first page to history sc
				}
				
			}
		this.testEnvironment=function(){
			var envLog;
			if (window.opener) {
				envLog='inside a pop-up window or target=_blank window';
			} else if (window.top !== window.self) {
				envLog='inside an iframe';
			} else {
				envLog='this is a top level window';
			}
			 //msg(envLog)
			 return envLog;
			
			}
        /*--------------------------------------------------------------------------
							LOADTARGET:
		  --------------------------------------------------------------------------							
							this function takes the content from targetNav
							and loads its content, adjusts ... 
							
		----------------------------------------------------------------------------*/			
        this.loadTarget = function () {
                var targetObj = this.findSub(this.targetNav);
				
				// verify if targetObj exists (coming from other lang)
				if(typeof(this.findSub(this.targetNav).isPage) == 'undefined'){
					return false;
				}
                if (!targetObj.isPage) {
                    //not a page but a Sub, needs to open stuff!
                    targetObj.activateSubs();
                }
                else { //this is a page, not a sub.
                    //set the title
                    //loop through all the levels and update the topnav with the proper title
                    //including disabling what's pas rapport?
                    for (lvlLoop = 0; lvlLoop < this.levels.length; lvlLoop++) {
                        if (lvlLoop < this.targetNav.length) {
                            //enable the level so that it's present
                            this.levels[lvlLoop].enable();
                            //for this level, find the sub that'S refered and push the title to the level
                            var foundSub = this.findSub(this.targetNav.slice(0, lvlLoop + 1));
                            foundSub.parentLevel.setTitle(foundSub.title);
                        }
                        else {
                            //disable the level
                            this.levels[lvlLoop].disable();
                        }
                        //thisObj.parentLevel.setTitle(thisObj.title)
                    }
                    //load this page's page
                    targetObj.loadPage();
                    //update currentNav
                    this.currentNav = this.targetNav;
					flatID = this.findSub(this.currentNav).flatID;
					
					
					/////////////////////////////////////////////
					// update viewed pages and verify completion
					////////////////////////////////////////////
					
					if(trackViewedSubs){
						if(!this.flatList[flatID].viewed ){
							this.flatList[flatID].setViewedPage();
							var parentNode = this.flatList[flatID].parent;				
							var viewed = true;			
							var originalDepth=this.flatList[flatID].depth;
							// Verify if all pages were viewed from the top level menu
							while(typeof parentNode != "undefined" && viewed && parentNode.depth >= 0){
								if(parentNode.depth >=0 || parentNode.depth<originalDepth){
									viewed = parentNode.checkViewedSubs();
									if(viewed){
										parentNode.setViewedPage();
									}	
								}
								parentNode = parentNode.parent;	// now go check this parent's parent
							}
						}
						if (trigger_completion_Viewed_Subs)	{
							var allViewed = this.checkViewedCompletion();
							if(allViewed)	scorm.complete();
						}
					}

                    //implement backnext
                    foundSub.retroFix();
                }
            } // end LoadTarget
			
		/*--------------------------------------------------------------------------
							checkViewedCompletion:
		  --------------------------------------------------------------------------							
							this method is by LoadTarget to check if all pages
							from the structure were viewed
							
		----------------------------------------------------------------------------*/	
		this.checkViewedCompletion = function () {			
			for(i=0;i<this.subs.length;i++){
				if(!this.subs[i].viewed)	return false;
			}
			return true;
		
		} // end checkViewedCompletion
        /*--------------------------------------------------------------------------
							ISLOADED:
		  --------------------------------------------------------------------------							
							this method is called once the AJAX for the page is done 
							this methode is used everytime a page is loaded.
							
		----------------------------------------------------------------------------*/				
        this.isLoaded = function () {

			
            //update aria-busy
            $("#dynamic_content").attr("aria-busy", "false");
            //update currentNav
            this.currentNav = this.targetNav;
			this.currentSub=this.findSub(this.currentNav)
			var newBookmark=this.currentSub.sPosition;
            var localListInfo = getLocalList(this.currentSub, this.lvlTimeline, this.timelinePermissive);
            if (this.currentNav.length > 1 || (this.timelinePermissive)) {
                if (localListInfo[0].length >= this.minTimeline) {
					if (this.timelineContent){
						if (this.tlPlace!=""){
							$("#dynamic_content").children(this.tlPlace).append("<div id=\"timeline\">" + generateTimeline(localListInfo[0], localListInfo[1]) + "</div>");
						}else{
                    		$("#dynamic_content").children("h1").after("<div id=\"timeline\">" + generateTimeline(localListInfo[0], localListInfo[1]) + "</div>");
						}
					}else{
						$("#timeline").html(generateTimeline(localListInfo[0], localListInfo[1]));
					}
					$(".peg.current").attr("tabindex", "0");
					if(this.isTimelineBrowsing){
						this.isTimelineBrowsing=false;
						$(".peg.current").focus();
					}
                }
			}
			//add pageOf
            $(".backnext").children("span").html(" Page " + (localListInfo[1] + 1) + " "+labels.vocab.pageOf+" " + localListInfo[0].length + " ");
			this.disableBacknext();
			//SCORM interactions
			scorm.saveBookmark();
			// save Viewed pages/subs if tracking enabled in settings
			if(trackViewedSubs){
				//on last, mark module as done.
				if(this.isLastOfLevel()<=loopLevel && markOnLast){
					this.levels[0].subs[this.currentSub.aPosition[0]].setViewedSubs()
				}
				//CSPS-SJ we should do a ifloopLevel>2, then
				
				
				var stringViewed = "";				
				// save viewed subs in scorm	
				for(i=0;i<masterStructure.subs.length;i++){
					stringViewed += masterStructure.subs[i].saveViewedSubs();	
				}
				trackingObj.saveData("vp",stringViewed);
			}
			
			if($(".supermenu>li>a:first-child").is(":visible")){
				$(".supermenu>li>a:first-child").attr("tabindex","0"); 
			}// adding second level menu tabindex
		
			pageLoaded();
			this.addAutomations();
			
        } //END isLoaded
		/*--------------------------------------------------------------------------
							loadAll
		  --------------------------------------------------------------------------
		  					@PARAMS: returns 
		----------------------------------------------------------------------------*/			
		this.loadAll = function (target) {
			
			
			var sitemap=masterStructure.flatList;
			var returnHtml="";
			var module;
			var addClass="";
			var titleFlag;
			var currentDepth;
			for(i=0;i<sitemap.length;i++){
				cBread=masterStructure.flatList[i].getTop().title;
				if (module!=masterStructure.flatList[i].getTop().title){
					module=masterStructure.flatList[i].getTop().title
					addClass="class='row page new-module' data-module='"+module+"'";
						//$(target).append("<h1 class='bread-print'>"+cBread+"</h1>")
				}else{
					addClass="class='row page'";
				}

				
				
				$(target).append("<section "+addClass+" style='margin:15px;clear:both;' id='showAll_"+i+"' data-index='"+i+"'></section>")
				if(i>0){$("#showAll_"+i).addClass('linebreak')}
				//$("#showAll_"+i).html(masterStructure.flatList[i].pagePath())
				var isloaded = $("#showAll_"+i).load(masterStructure.flatList[i].pagePath(), function (response, status, xhr) {
				if (status == 'error') {
						//make sure to reset the nav.
				}
				else {
					var h1Found=$(this).find("h1")
					$(h1Found).after("<h2>"+$(h1Found).html()+"</h2>")
					if($(h1Found).parent().hasClass("new-module")){
						$(h1Found).html($(h1Found).parent().attr("data-module"))
					}else{
						$(h1Found).remove();
					}
					//run automations.
					masterStructure.addAutomations();
					$(this).find("a").each(function(index, element) {
						if ($(this).hasClass("external")){
                        	$(this).append("(External link to "+$(this).attr("href")+")")
						}
						if($(this).hasClass("wb-lbx")){
							$(this).append("(Link to '"+$($(this).attr("href")).children("header").eq(0).children("h2").html()+"' )")
							$($(this).attr("href")).removeClass("mfp-hide");

						}
                    });
				}

				});
				
				
			}
		$(target).append("<section class='row page linebreak' style='margin:15px;clear:both;' id='res_print'><h1>Resources</h1><div id='resourcesdiv'></section>")
		$("#resourcesdiv").load("content/tools/resources_en.html #reslist", function (response, status, xhr) {
			$("#resourcesdiv").find("a").each(function(index, element) {

                   	$(this).append("(External link to "+$(this).attr("href")+")")
			})
		})
		return returnHtml;			
			
		}
		/*--------------------------------------------------------------------------
							loadExt & loadGloss
		  --------------------------------------------------------------------------
		  					@PARAMS: sets the external links
		----------------------------------------------------------------------------*/	

        this.loadExt = function () {


			$.get("content/tools/resources_"+ lang +".html", function(respons) {
				var extFile = respons;
				var aExt=new Array();
				htmlExt=$(respons).find("a");
				var printThis="";
				for (lExt=0;lExt<htmlExt.length;lExt++){
					printThis+=lExt;
					aExt[aExt.length]=htmlExt.eq(lExt);
				}
				masterStructure.aExt=aExt;
			});
        }
	 /* --------------------------------------------------------------------------
	 						addAutomations is where we'll add things to check and 
							do across the board
		  					@PARAMS: sets the external links
		----------------------------------------------------------------------------*/	

        this.addAutomations = function () {
			//remove duplicate IDs generated by lbx bewing copied over by wet
			$("#wb-glb-mn").find(".wb-lbx").each(function( index ) {
				if($(this).attr("id").substring(0,3)!="mb-"){
					$(this).attr("id", "mb-"+$(this).attr("id"))
				}
			})
			//add empty alt tag on images.
			$("#dynamic_content").find("img:not([alt])").attr("alt", "");
			//removes the simplified html version
			$("#wb-tphp").children(".wb-slc").eq(1).remove();
			
			//treat external links
			var ext=$(".external");//gather ext
			var extID="";
			if (ext.length>0){//if there are ext
				for (lExt=0;lExt<ext.length;lExt++){//go through external links in page
					extID=ext.eq(lExt).attr("data-ext");
					//go through all externals in the masterStructure
					for (lMasterExt=0;lMasterExt<masterStructure.aExt.length;lMasterExt++){
						checkExt=masterStructure.aExt[lMasterExt].attr("ID");
						if(checkExt==extID){
							var linkHttp=masterStructure.aExt[lMasterExt].attr("href")
							var linkTitle=masterStructure.aExt[lMasterExt].parent().next().html();
							ext.eq(lExt).attr("title", linkTitle);
							var extMethodFinal;
							extMethodFinal=ext.eq(lExt).attr("data-extmethod");
							extMethodFinal=(typeof extMethodFinal != 'undefined')?extMethodFinal:extMethod;
							
							switch(extMethodFinal) {
								case "lightbox":
									ext.eq(lExt).attr("onclick", "$( document ).trigger( 'open.wb-lbx',[[{src: '"+linkHttp+"',type: 'iframe'}],false,['"+linkTitle+"']]);return false;");
									ext.eq(lExt).attr("aria-haspopup", true);
									ext.eq(lExt).append( "<span class='wb-inv'>Ce lien s'ouvrira dans une nouvelle fenêtre</span>" );
									ext.eq(lExt).removeAttr("target");
									break;
								case "popup":
									ext.eq(lExt).attr("onclick", "window.open('"+linkHttp+"', '_blank', 'toolbar=0,location=0,menubar=0');return false;");
									ext.eq(lExt).attr("aria-haspopup", true);
									ext.eq(lExt).append( "<span class='wb-inv'>Ce lien s'ouvrira dans une nouvelle fenêtre</span>" );
									ext.eq(lExt).removeAttr("target");
									break;
								default:
									$(".external").attr("target","externallink");
									ext.eq(lExt).attr("aria-haspopup", true);
									ext.eq(lExt).append( "<span class='wb-inv'>Ce lien s'ouvrira dans une nouvelle fenêtre</span>" );
									ext.eq(lExt).attr("href", linkHttp);
									
							}
							
							
							
							
							if($(".ext-link").length>0){//if there's a toolbox with links
							
								$(".ext-link").append("<p> "+masterStructure.aExt[lMasterExt].parent().html()+" </p>");
							}//if there's a toolbox ext-link
						}
					}

					
				}
				
				
			}
			//treat glossary items in the page
			$("#dynamic_content").find(".csps-glossary").each(function(){
				masterStructure.glossary.searched=this;
				masterStructure.glossary.generate();
			})
			this.glossary.automate
			if($("#dynamic_content").find(".qs-elearning-activity").length>0){
					$.getScript("js/plugins/qsbeta.js");}
			//automate WB ADD wb-add whatever.
			initWbAdd(".wb-lbx");
			initWbAdd(".wb-mltmd");
			initWbAdd(".wb-tabs");
			initWbAdd(".wb-details");
			initWbAdd(".wb-charts");

        }		
        /*--------------------------------------------------------------------------
							FINDSUB:
		  --------------------------------------------------------------------------
							@PARAMS aFind: a position array of object tofind
							@RETURNS : if Found: returns the sub
										not found: false
							this method searches through the flatlist
							 to find a page and returns the object.
		----------------------------------------------------------------------------*/	
        this.findSub = function (aFind) {
                //cycle through the subs in a level (found by length of the array (depth=level)
                var lvl = aFind.length;
                var flagFound = false;
                var subs = this.levels[lvl - 1].subs;
                //loop through the subs in the appropriate level
                for (loopSubs = 0; loopSubs < subs.length; loopSubs++) {
                    if (arrays_equal(subs[loopSubs].aPosition, aFind)) {
                        return subs[loopSubs];
                    }
                }
                return flagFound;
            } //END FINDSUB
		/*--------------------------------------------------------------------------
							isLastOfLevel:
		  --------------------------------------------------------------------------
							this method returns the level for which this sub is last of
							0 for course
							1 for module
							2 for section
							3 for not last

		----------------------------------------------------------------------------*/				
		this.isLastOfLevel = function () {
			if( typeof this.currentSub.isLastOf === "undefined"){
				var objSub=this.currentSub;
				var isStillLast=true;
				var lowestDepth=this.maxDepth;
				var parentSub=objSub.parent
			
				for (i=objSub.depth;i>0;i--){
			
					if(objSub.parent.subs[objSub.parent.subs.length-1]==objSub && isStillLast==true){
						lowestDepth=objSub.depth;
						objSub=objSub.parent;
					}else{
						isStillLast=false
					}
				}
				if (this.isLastPage()){
					lowestDepth=0;
				}
				this.currentSub.isLastOf=lowestDepth
			}
		
			return this.currentSub.isLastOf;
		}
		/*--------------------------------------------------------------------------
							NEXTPAGE/BACKPAGE:
		  --------------------------------------------------------------------------
							this method returns the SUB that follows or 
							precedes the current page.

		----------------------------------------------------------------------------*/	

        this.nextPage = function () {
                //var currentID = masterStructure.findSub(masterStructure.currentNav).flatID;
				//masterStructure.currentSub.next
				return masterStructure.currentSub.next
            } //END NEXTPAGE
        this.prevPage = function () {
                //var currentID = masterStructure.findSub(masterStructure.currentNav).flatID;
				//return masterStructure.findSub(masterStructure.currentNav).previous;
				
				return masterStructure.currentSub.previous;
            } //END PREVPAGE
			
		this.disableBacknext=function(){
				$(".backnext").css("visibility", "visible");
				$(".backnext").children("a").removeClass("disabled")
							.attr("style","")
							.attr("tabindex", "0");

				if(this.isFirstPage()){

					if (loopLevel==0){
						$(".back").attr("onclick", "loadLast();return false;")
					}else{
						if(loopLevel>0 &&loopLevel<masterStructure.maxDepth){
							$(".backnext").css("visibility", "hidden");
							
						}
						
						$(".back").addClass("disabled")
							.attr("style", "pointer-events: none !important;")
							.attr("tabindex", "-1");
						}
				}else{
						$(".back").attr("onclick", "goToPrevPage();return false;");
				}

				if(this.isLastPage() && loopLevel >= masterStructure.maxDepth){

					$(".next").addClass("disabled")
						.attr("style", "pointer-events: none !important;")
						.attr("tabindex", "-1");
					}

				if (loopLevel < masterStructure.maxDepth && (this.isLastOfLevel()<=loopLevel)){ //if it's gonna loop n it's the right loop
					$(".next").attr("onclick", "loadHome();return false;");
				}else{
					$(".next").attr("onclick", "goToNextPage();return false;");
				}			
		}

		this.isLastPage = function () {
			var lastFlag=(this.flatList[this.flatList.length-1]==this.currentSub)?true:false;
				return lastFlag;
                //if(this.findSub(this.currentNav),this.flatList[this.flatList.length-1]){return true;}else{return false;}
            } //END isLastPage
		this.isFirstPage = function () {
				var firstFlag=(this.flatList[0]==this.currentSub)?true:false;
				return firstFlag;
                //if(arrays_equal(this.currentNav,this.flatList[0].aPosition)){return true;}else{return false;}
            } //END isLastPage
    }
/*-------------------------------------------------------------------------------------
                                      objNiveau
---------------------------------------------------------------------------------------									  
		COMMENTS:	L’objet niveau (levels) permet de regrouper les subs par leur niveau (depth).
					La plupart du temps référencés à partir de navStructure, 
					les modules (lvl 1) seraient retrouvés comme ceci :
						masterStructure.levels[0]
					les sections (lvl 2) comme ceci :
						masterStructure.levels[0]
					Et donc, le 4e sub qui est dans les sections (lvl 2) se trouve comme ceci
            			masterStructure.levels[1].subs[3]
---------------------------------------------------------------------------------------*/
function objNiveau(depth, parentLevel, title, obj) {
        this.depth = depth; // acts as an index, depth is the level
        this.parent = parent; // this will always be masterStructure... 
        this.title = title; // name of the level
        this.defaultTitle = title; //default name ("module" or "sous-module")
        this.obj = obj;//reference to the html element. $(obj) 
		this.objMb = $("#sm-pnl").children("ul.mb-menu")
			.children("li").eq(this.depth).children("details").children("summary"); //reference to mobile html object
        this.subs = new Array(); //could be sous-niveau or sousPages
       
		/*--------------------------------------------------------------------------------
											  METHODS of OBJNIVEAU
		---------------------------------------------------------------------------------*/	
        /*--------------------------------------------------------------------------
							HIDESUBS:
		  --------------------------------------------------------------------------
							hides all subs from a level

		----------------------------------------------------------------------------*/				
        // 
        this.hideSubs = function () {
                for (subsLoop = 0; subsLoop < this.subs.length; subsLoop++) {
                    this.subs[subsLoop].disable()
                }
            }
        /*--------------------------------------------------------------------------
							HIDESUBS:
		  --------------------------------------------------------------------------
		  					@PARAMS: aLookFor : a position array to look for
							Shows subs which match the aLookFor criteria

		----------------------------------------------------------------------------*/		

        this.showArray = function (aLookFor) {
            var levels = aLookFor.length
            var subCount = 0;
            for (subsLoop = 0; subsLoop < this.subs.length; subsLoop++) {
                var aLookingAt = this.subs[subsLoop].aPosition.slice(0, levels)
                if (arrays_equal(aLookingAt, aLookFor)) {
                    subCount++;
                    this.subs[subsLoop].enable();
                }
            }
        }
        /*--------------------------------------------------------------------------
							setTitle/resetTitle:
		  --------------------------------------------------------------------------
		  					@PARAMS: newTitle : a string of new title to display 
							this also includes the span to make sure the arrow is 
							pointing in the right direction
		----------------------------------------------------------------------------*/	

        this.setTitle = function (newTitle) {
            this.title = newTitle;
            var chevronHtml = "<span class='expicon glyphicon glyphicon-chevron-down'></span>";
            $(this.obj).html(this.title + chevronHtml);
            $(this.objMb).html(this.title);
        }
        this.resetTitle = function () {
            this.setTitle(this.defaultTitle);
        }


        /*--------------------------------------------------------------------------
							enable/disable:
		  --------------------------------------------------------------------------
		  					shows and hides the menubar element with animation.
		----------------------------------------------------------------------------*/			
        this.enable = function () {
            $(".mb-menu").children("li").eq(this.depth).attr("disable", "false").slideDown("slow");
            $(this.obj).attr("disable", "false").slideDown("slow");
        }		
        this.disable = function () {
                this.resetTitle();
                $(".mb-menu").children("li").eq(this.depth).attr("disable", "true").hide().slideUp("slow");
                $(this.obj).attr("disable", "true").hide().slideUp("slow");
        } //end DISABLE

    }
/*---------------------------------------------------------------------------------------
                                      ObjSub
									  
		COMMENTS:
---------------------------------------------------------------------------------------*/
function objSub(depth, parentLevel, obj) {
        this.depth = depth;
        this.obj = obj;
        this.title = $(obj).text();
        //get the (formerly ID)data-target position as a string
        this.sPosition = $(obj).attr("data-target");
		//mobile equiv
		this.mbObj = $(".mb-menu").find("a[data-target='" + this.sPosition +"']");
            //get the ID or whatever M01S01P01 and set it as an array
        this.aPosition = getArrayFromString(this.sPosition);
            //place the sub inside a 2D hierarchy (everything under its level)
        this.parentLevel = parentLevel;
        // prepare for the eventual subs
        this.subs = new Array();
        this.active; //flag to tell if active or not
        this.isPage = ($(obj).attr("href") == "#") ? false : true;
		this.isLastOf;// lvl de depth qu'il est last of
        this.completed = false;
		this.viewed = false; // CSPS SC added to ckeck page/modules visited
		this.next; // reference in flatList to next page;
		this.previous;// reference in flatList to previous page;
		
		/*--------------------------------------------------------------------------------
				METHODS of objSub
		---------------------------------------------------------------------------------*/			
		/*--------------------------------------------------------------------------
							saveViewedSubs
		  --------------------------------------------------------------------------
		  					return string of viewed subs for this sub
		----------------------------------------------------------------------------*/		
		this.saveViewedSubs = function(){		
			var stringViewed = "";
			if((!this.isPage && this.viewed) || this.isPage && this.viewed)	return this.aPosition.join("-") + ";"; // we can stop here we know all under were viewed
			
		
			for(var childSubsCounter = 0; childSubsCounter < this.subs.length; childSubsCounter++){
				if(this.subs[childSubsCounter].viewed){
					if(this.subs[childSubsCounter].isPage){
						stringViewed += this.subs[childSubsCounter].aPosition.join("-") + ";";						
					}else{
						return stringViewed += this.subs[childSubsCounter].aPosition.join("-") + ";";	// we can stop here we know all under were viewed
					}
					
				}else{// continue with child subs to see if viewed
					if(!this.subs[childSubsCounter].isPage){						
						this.subs[childSubsCounter].saveViewedSubs();
					}
				}				
			}
			return stringViewed;
		}

		
		/*--------------------------------------------------------------------------
							setViewedSubs
		  --------------------------------------------------------------------------
		  					goes through each child of a sub and set viewed
							affect ojbSub and html
		----------------------------------------------------------------------------*/		
		this.setViewedSubs = function(){
			//set current object to viewed
			this.setViewedPage();
			for(var childSubsCounter = 0; childSubsCounter < this.subs.length; childSubsCounter++){
				if(this.subs[childSubsCounter].isPage){
					this.subs[childSubsCounter].setViewedPage();
				}else{
					this.subs[childSubsCounter].viewed = true;//update the object
					this.subs[childSubsCounter].setViewedSubs();
				}					
			}
		}
		
		/*--------------------------------------------------------------------------
							setViewedPage
		  --------------------------------------------------------------------------
		  					goes through each child of a sub and set viewed
							affect ojbSub and html
		----------------------------------------------------------------------------*/			
		this.setViewedPage = function(){
			this.viewed= true;	// CSPS update the flatList		
			$(this.obj).addClass('viewed');// CSPS SJ add class without using ID
			$(this.obj).append("<span class=\"wb-inv\">("+labels.nav.viewed+")</span>");//CSPS SJ added to add accessible text.
			$(this.mbObj).addClass('viewed');// CSPS SJ add class without using ID
			$(this.mbObj).append("<span class=\"wb-inv\">("+labels.nav.viewed+")</span>");//CSPS SJ added to add accessible text.			
			
		}			
		
		/*--------------------------------------------------------------------------
							checkViewedSubs
		  --------------------------------------------------------------------------
		  					goes through each child of a sub and check if viewed
							returns true if page or all subs were viewed
		----------------------------------------------------------------------------*/		


		/*this.checkViewedSubs = function (){
			var viewed = true;
			for(var childSubsCounter = 0; childSubsCounter < this.subs.length; childSubsCounter++){
				// is this sub a page
				if (this.subs[childSubsCounter].isPage){
					if(!this.subs[childSubsCounter].viewed){
						viewed = false; //at least one page was not viewed						
					}
				}else{	// this is not a page but a level
					if(!this.subs[childSubsCounter].viewed){						
						viewed = this.subs[childSubsCounter].checkViewedSubs(); // recall to check with child subs
						if(!viewed){														
							viewed = false;//at least one page was not viewed
						}else{// this sub and its children were all viewed
							this.subs[childSubsCounter].setViewedPage();
							viewed = true && viewed; // make sure it stays false if one page or level was not seen
						}						
					}
				}	
			}	
			
			return viewed; 
		}
		*/
		
		this.checkViewedSubs = function (){
			var viewed = true;
			for(var childSubsCounter = 0; childSubsCounter < this.subs.length; childSubsCounter++){
				// is this sub a page
				if (this.subs[childSubsCounter].isPage){
					
					if(!this.subs[childSubsCounter].viewed){
						viewed = false; //at least one page was not viewed						
					}
				}else{	// this is not a page but a level
					if(!this.subs[childSubsCounter].viewed){						
						viewed = this.subs[childSubsCounter].checkViewedSubs(); // recall to check with child subs
						if(!viewed){														
							viewed = false;//at least one page was not viewed
						}else{// this sub and its children were all viewed
							this.subs[childSubsCounter].setViewedPage();
							//viewed = true && viewed; // make sure it stays false if one page or level was not seen
						}						
					}
				}	
			}	
			
			return viewed; 
		}

        /*--------------------------------------------------------------------------
							nest
		  --------------------------------------------------------------------------
		  					place the sub inside a 3D hierarchy 
							(master > Module > Section > Page )
		----------------------------------------------------------------------------*/	
        this.nest = function () {
                if (this.depth == 0) { //if this item is a module (depth 0)
                    masterStructure.subs[masterStructure.subs.length] = this;
                }
                else {
                    //find the parent within the previous level 
                    //aNewLevel is the previous depth's level (if this is in a section, it contains all the modules
                    // if it is in a page, it contains all the sections.
                    var aNewLevel = masterStructure.levels[this.depth - 1].subs;
                    for (i = 0; i < aNewLevel.length; i++) {
                        var toCheck = masterStructure.levels[this.depth - 1].subs[i];
                            // Need to compare with the number
                        if (compareArrayDepth(this.aPosition, toCheck.aPosition)) {
                            //make the connection!
                            this.parent = toCheck;
                            //add Aria dependancy
                            $(this.parent.obj).attr("aria-controls", "nav" + (this.depth + 1));
                            //yes, son.
                            toCheck.subs[toCheck.subs.length] = this;
                        }
                    }
                }
            } // END NEST METHOD

		this.getTop = function(){

			var obj=this;
			var flag=false;
			while (flag!=true){
				//is obj the top?
				if(obj.depth==0){
					flag==true;
					return obj;
				}else{
					obj=obj.parent;
				}
			
			}
		}
					
        /*--------------------------------------------------------------------------
							activateSubs
		  --------------------------------------------------------------------------
		  					goes through next level, disables everything and re-enable
							all pertinent ones.
							
		----------------------------------------------------------------------------*/	
        this.activateSubs = function () {
                this.enable();
                if (!this.isPage) { //if it'S a standard sub
                    //for each level
                    for (lvlLoop = this.depth + 1; lvlLoop < masterStructure.levels.length; lvlLoop++) {
						//loop from next level til the last level.
                        if (lvlLoop < masterStructure.levels.length - 1) {
                            //disable the next level
                            masterStructure.levels[lvlLoop + 1].disable();
                        }
                        //hide everything in next Levels
                        masterStructure.levels[lvlLoop].hideSubs();
                        //show related things in the next levels
                        masterStructure.levels[lvlLoop].showArray(this.aPosition);
                    }
                }//else { //this is a PAGE }
                //change the title
                this.parentLevel.setTitle(this.title);
                //enable the next level now that it's done being messed with
                masterStructure.levels[this.depth + 1].enable();
                masterStructure.levels[this.depth + 1].resetTitle();
				//set the focus to the next menu element
                $(masterStructure.levels[this.depth + 1].obj).trigger(cspsWetMenu.focusEvent);
                $($(".mb-menu").children("li").eq(this.depth + 1)).find("summary").trigger("click") //(cspsWetMenu.focusEvent)
                    // SET FOCUS ON FIRST ELEMENT.next("ul").find("a[aria-hidden!='true']:first")
                    .trigger("setfocus.wb");
            } // END activateSubs METHOD
        /*--------------------------------------------------------------------------
							retroFix
		  --------------------------------------------------------------------------
		  					retrofix is to fix the menu when an element is selected
							from outside the menu (loading a page from the content
							for example, so gotta update the menu, hide all the 
							unwanted elements.
		----------------------------------------------------------------------------*/				
        this.retroFix = function () {
            if (this.depth > 0) {
                for (lvlLoop = 1; lvlLoop <= this.depth; lvlLoop++) {
                    masterStructure.levels[lvlLoop].hideSubs();
                    masterStructure.levels[lvlLoop].showArray(this.aPosition.slice(0, lvlLoop));
                }
            }
        } // END retrofix
        /*--------------------------------------------------------------------------
							enable/disable
		  --------------------------------------------------------------------------
		  					show and hide subs	
		----------------------------------------------------------------------------*/			
		
        this.enable = function () {
				// show and aria
                $(this.obj).show().attr("aria-hidden", "false");
                $(this.mbObj).show().attr("aria-hidden", "false");
            } // END enable	
        this.disable = function () {
                //hide in main version and aria hidden true
                $(this.obj).hide().attr("aria-hidden", "true");
				$(this.mbObj).hide().attr("aria-hidden", "true");
            } // END disable
            //setup page folder and filename
        /*--------------------------------------------------------------------------
							pagePath
		  --------------------------------------------------------------------------
		  					returns the content folder and filepath of a sub
		----------------------------------------------------------------------------*/				
        this.pagePath = function () {
                var contentfolder = "content";
                var moduleFolder = "module" + this.aPosition[0];
                loadContent = contentfolder + "/" + moduleFolder + "/" + this.sPosition + "_" + lang + ".html";
                return loadContent;
            } //END pagePath
		/*--------------------------------------------------------------------------
							get Numeric:
							this is to assign a numeric value to a sub for the purpose of sorting it.
		  --------------------------------------------------------------------------	*/		
	        this.getNumeric= function () {
    			var numeric=0;
				var multiplyer=0;
				var position=0;
				
				for (loop=0;loop<this.aPosition.length;loop++){
					multiplyer=Math.pow(10, ((masterStructure.maxDepth-loop)*3))
					position=this.aPosition[loop];
					numeric+=position*multiplyer;
				}
				
				return (numeric);
				
				
            } //END getnumeric		
        /*--------------------------------------------------------------------------
							setChildrenAria
		  --------------------------------------------------------------------------
		  					this method assigns "aria set" values to children subs
							this would be better if it were recursive, but it'll do for now.
		----------------------------------------------------------------------------*/				
		this.setChildrenAria=function(){
				if(this.subs.length>0){
					for (subLoop = 0; subLoop < this.subs.length; subLoop++) {
						$(this.subs[subLoop].obj).attr("aria-posinset",(subLoop+1));
						$(this.subs[subLoop].obj).attr("aria-setsize",(this.subs.length));
				
					}
				}
		  	} // end setAria
        /*--------------------------------------------------------------------------
							loadBreadCrumbs
		  --------------------------------------------------------------------------
		  					this method checks the settings if there are breadcrumbs
							 and loads them
		----------------------------------------------------------------------------*/		
        this.loadBreadCrumbs = function () {
			var bread="";
			var currentObj=this;
			for (i=this.depth;i>0;i--){
				currentObj=currentObj.parent;
				bread =currentObj.title+ " "+labels.nav.breadSeparator+" "+ bread ;
			}
			$(".breadcrumb").html(bread);
		}
        /*--------------------------------------------------------------------------
							loadPage
		  --------------------------------------------------------------------------
		  					this method loads this sub's target pagePath in the proper
							div (dynamic_content) and then activates isLoaded.
		----------------------------------------------------------------------------*/		
        this.loadPage = function () {
                //thisPage, load it
                if (this.isPage) {
                    $("#dynamic_content").attr("aria-busy", "true");
                    var isloaded = $('#dynamic_content').load(this.pagePath(), function (response, status, xhr) {
                        if (status == 'error') {
                                //make sure to reset the nav.
                            //fClickedOutsideMenuNav()
                        }
                        else {
							
                            masterStructure.isLoaded();
                        }
                        //alert("load page says:\r\n"+itmID+".html");
                    });
                }
                cspsWetMenu.menuClose($("li.active.sm-open"), true);
                var mbClose = $("#sm-pnl").find("details"); //this.depth
                $("#sm-pnl").find("details").removeAttr('open');
                $(".mfp-close").trigger("click");
                $("#dynamic_content").focus();
				//load the breadcrumb if it is activated
				if(breadCrumbs) this.loadBreadCrumbs();
            } // END loadPage
			
		//this is a function to call when all is created.
        this.nest();
    }
/*-------------------------------------------------------------------------------------
                                      objToolbox
---------------------------------------------------------------------------------------									  
		COMMENTS:	
---------------------------------------------------------------------------------------*/
function objToolbox(obj) {
	//toolbox object
	this.obj=obj;
	this.mbObj=$("#mb-pnl").find(".toolbox").eq(0);
	this.isOpen=false;
	this.items=new Array();
	this.current,this.target;

	this.menuClose=function(){
		this.isOpen=false;
		$("#mb-tb").slideToggle();
		$(this.obj).next("ul").slideToggle();
		
	}
	this.menuDisplay=function(){
		$(this.obj).next("ul").slideToggle();
		$("#mb-tb").slideToggle();
		this.isOpen=true;
		
	}
	this.menuToggle=function(){
		if(this.isOpen){
			this.isOpen=false;
			this.menuClose();
			}else{
			this.isOpen=true;
			this.menuDisplay();
		}
		
	}
	this.setFocus=function(){
		this.current=this.target;
		this.items[this.target].setFocus();
		
	}
	this.scrollItems=function(offset){
		if (this.current==0 && offset<0){
			this.target=this.items.length-1;
		}else if(this.current==(this.items.length-1) && offset>0){
			this.target=0;
		}else{
			this.target=this.current+offset;
			}
		this.setFocus();
		
		
	}
	this.initialize=function(){

		//fix the mobile version (put first for next mobile affectations)
		$("section.lng-ofr").find(".tb-item").parent('li').remove();
		$("section.lng-ofr").find(".tb-item").remove(); // fix ie8 version sc
		$("section.lng-ofr").find("ul.tb-container").detach();
		
		$("section.lng-ofr").after("<ul id='mb-tb' class='list-unstyled open tb-container' role='menu' aria-hidden='true'></ul>")
		$("#mb-tb").append($("ul.tb-container").html());
		$("#mb-tb").hide();
		
		
		//initialize items
		var kids=$(this.obj).next("ul").children("li");
		var mbKids=$(this.mbObj).closest('section').next("ul#mb-tb").children("li"); // fix mobile toolbox problem sc
		for(i=0;i<kids.length;i++){
			this.items[i]=new objToolItem(kids.eq(i), i, kids.length,mbKids.eq(i));
			
		}
		//add aria-expanded and aria-hidden
		//add attribute open		
		//add role="menuitem"	
		
		
		$(document).mouseup(function (e){

			var container = $("a.toolbox").next("ul");
			if (!container.is(e.target)  // if the target of the click isn't the container...
				&& container.has(e.target).length === 0 // ... nor a descendant of the container
				&& masterStructure.toolbox.isOpen!=false // ... and the toolbox is open
				&& !$("a.toolbox").is(e.target) 
				)
			{
				masterStructure.toolbox.menuClose(); //clickoutside
				masterStructure.toolbox.isOpen=false;
			}
			if ($("a.toolbox").is(e.target))	masterStructure.toolbox.menuToggle();
		});
		
		
		
		$("a.toolbox").keydown(function (e){			
			
			var container = $('ul.tb-container');			
			
			if(container.is(":visible") &&!$(masterStructure.toolbox.obj).is(":focus") ||
				container.is(":visible") &&!$(masterStructure.toolbox.mbObj).is(":focus")
			){
				
				if(e.which == 9){
					//tab	 
					masterStructure.toolbox.menuClose()	 
				}else if(e.which==40 || e.which==38){
					e.preventDefault();
					var offset=(e.which==40)?1:-1;
					masterStructure.toolbox.scrollItems(offset);
				}
				
			}
			// if inside toolbox menu
			if(($(masterStructure.toolbox.obj).is(":focus") && e.which==40) ||
				($(masterStructure.toolbox.mbObj).is(":focus") && e.which==40)
			){//get inside downarrow				
				e.preventDefault();
				// added for ie8 to work sc
				if(!masterStructure.toolbox.isOpen)		masterStructure.toolbox.menuToggle();
				
				masterStructure.toolbox.target=0;
				$(container).find('a').first().focus(); // fix for mobile sc
				masterStructure.toolbox.current=0;
				masterStructure.toolbox.setFocus();
			}			
		})
		$(".tb-container a").keydown(function(e){
			if(e.which==40 || e.which==38){
					e.preventDefault();
					var offset=(e.which==40)?1:-1;
					masterStructure.toolbox.scrollItems(offset);
			}else if(e.which == 9){
				masterStructure.toolbox.menuClose();
			}
		});	
		
		
	}	
	this.initialize();
}

/*-------------------------------------------------------------------------------------
                                      objToolItem
---------------------------------------------------------------------------------------									  
		COMMENTS:	
---------------------------------------------------------------------------------------*/
function objToolItem(obj, index, setsize, mbObj) {
	this.obj=obj;
	this.mbObj=mbObj;
	this.index=index;
	this.setsize=setsize;
	
	this.setFocus=function(){		
		// find out if we are in mobile view and put focus on
		if($(this.mbObj).closest('section').find('a.toolbox:focus').length > 0	|| ($('*:focus').hasClass('tb-item') && $('*:focus').closest('ul').attr('id') == "mb-tb" )){
			$(this.mbObj).children('a').focus();			
		}else if($(this.obj).closest('section').find('a.toolbox').is(':focus') || ($('*:focus').hasClass('tb-item') &&!($('*:focus').closest('ul').attr('id') == "mb-tb"))){
			$(this.obj).children("a").focus();
		}
	}
	this.initialize=function(){
		$(this.obj).children("a").attr("tabindex", "-1")
								.attr("aria-posinset", index+1)
								.attr("aria-setsize", setsize)
								.attr("aria-haspopup", "true")
								.attr("aria-controls", "popup")
								.attr("role", "menuitem");
		$(this.mbObj).children("a").attr("tabindex", "-1")
								.attr("aria-posinset", index+1)
								.attr("aria-setsize", setsize)
								.attr("aria-haspopup", "true")
								.attr("aria-controls", "popup")
								.attr("role", "menuitem");					
		
		
	}
	this.initialize();
}
/*-------------------------------------------------------------------------------------
                                      objScorm
---------------------------------------------------------------------------------------									  
		COMMENTS:	
---------------------------------------------------------------------------------------*/
function objScorm() {
	this.isOnline;
	this.status;
	this.lessonStatus;

	this.getLessonStatus=function(){
		if (this.getStatus()=="online"){
			return window.opener.doLMSGetValue("cmi.core.lesson_status");
		}else{
			this.checkStatusChange();
			return "";
		}	
		
	}
	this.getBookmark=function(){
		if (this.getStatus()=="online"){
			return window.opener.doLMSGetValue("cmi.core.lesson_location");
		}else{
			this.checkStatusChange();
			return "";
		}
		
	}
	this.getSuspendData=function(){
		if (this.getStatus()=="online"){
			return window.opener.doLMSGetValue("cmi.suspend_data");
		}else{
			this.checkStatusChange();
			return "";
		}	
	}
	this.saveBookmark=function(){
		if (this.getStatus()=="online"){
			window.opener.doLMSSetValue("cmi.core.lesson_location", masterStructure.currentSub.sPosition);
		}else{
			this.checkStatusChange();
			return "";
		}		
	}
	this.saveSuspendData=function(data){
		if (this.getStatus()=="online"){
			window.opener.doLMSSetValue("cmi.suspend_data", data);

		}else{
			this.checkStatusChange();
			return "";
		}		
	}
	this.saveCommentsData=function(data){
		if (this.getStatus()=="online"){
			window.opener.doLMSSetValue("cmi.comments", data);
		}else{
			this.checkStatusChange();
			return "";
		}		
	}	
	this.isPopped=function(){
		return (window.opener && window.opener.open && !window.opener.closed)?true:false;
	}
	this.isOnline=function(){
		return window.opener.getAPIHandle()!=null;
	}	
	
	
	this.getStatus=function(){
		if (this.isPopped()){//if this window has access to poppup
					//check for ILMS
					if(this.isOnline()){
						return labels.err.online;
					}else{

						return labels.err.noscorm;
					}
				}else{
					//do some sort of warning that the window is closed
					return labels.err.offline;
				}
		}
	this.initLessonStatus=function(){
		if (this.getStatus()=="online"){
			this.lessonStatus = this.getLessonStatus();			
			if (this.lessonStatus =="not attempted"){
				return "initLsesonStatus"+this.incomplete();
			}

		}else{
			this.checkStatusChange();
		}		
		
		
	}
	this.checkStatusChange=function(){
		//do SOMETHING if previous status hasn't been updated
		if(this.status!=this.getStatus()){
			//SOMETHING CHANGED
			//manage error
			alert(labels.err.statusChange);
		}
		
	}
	this.initialize=function(){
		this.status=this.getStatus();		
		if (this.status!="online"){
			if (debugMode)$("#wb-sttl").children("a").append(" <div id='status'>- "+labels.err.offline+"</div>");
		}else{
			//check if initialized already
			if (!window.opener.LMSIsInitialized()){
				 window.opener.doLMSInitialize();
				 
			}else{
				//alredy initialized
			}
		}
	}
	this.incomplete=function(){
		if (this.getStatus()=="online"){
			window.opener.doLMSSetValue("cmi.core.lesson_status", "incomplete");
			window.opener.doLMSCommit();
			return "done";

		}else{
			this.checkStatusChange();
		}		
	}
	this.complete=function(){
		if (this.getStatus()=="online"){
			if(this.getLessonStatus() != 'completed'){
				window.opener.doLMSSetValue("cmi.core.lesson_status", "completed");
				window.opener.doLMSCommit();
			}
			return "done";

		}else{
			this.checkStatusChange();
		}	
	}
	
	this.initialize();
}	

scorm=new objScorm();

/*---------------------------------------------------------------------------------------
                                      obj Glossaire
---------------------------------------------------------------------------------------*/

function objGlossary() {
	this.obj;
	this.searched;

	
	this.ajax=function(){
		$.get("content/tools/glossaire_"+ lang +".html", function(respons) {
			masterStructure.glossary.obj=respons;
			//masterStructure.glossary.initialize();
		});
	}
	this.ajax();
	
	this.generate=function(){
		var target=$(this.searched).closest("div");
		var targetID=$(this.searched).attr("href")
		var found=$(this.obj).find(targetID);
		var newID="pop_"+targetID.replace("#", "")
		var modalbody=found.children("dd").html()
		
		var htmlRender ="<section id='"+newID+"' class='mfp-hide unethical modal-dialog modal-content overlay-def'>"
		htmlRender +="<header class='modal-header'><h2 class='modal-title'>Definition : "+$(found).children("dt").text()+"</h2></header>"
		htmlRender += "<div class='modal-body'>"
		htmlRender +- "</div></section>"
		$(target).append(htmlRender)
		$("#"+newID).children(".modal-body").html(modalbody)
		$(this.searched).addClass("wb-lbx").attr("href", "#"+newID)
		
	}

	
}
/*				$(this).closest("div").append("<h2>INSERT GLOSSARY HERE</h2>");*/


/*---------------------------------------------------------------------------------------
                                      Conversion & compare functions
---------------------------------------------------------------------------------------*/
    //simple getting the array from the string. separated in in case it get more complicated.
function getArrayFromString(idString) {

        var splitString = (idString.substring(1)).split('-');
        for (aIndex = 0; aIndex < splitString.length; aIndex++) {
            splitString[aIndex] = parseInt(splitString[aIndex], 10);
        }
        return splitString;
    }


    //simple comparing a substring's aPosition (arrayThis) with a potential parent (arrayCompare)'s aPosition
function compareArrayDepth(arrayThis, arrayCompare) {
    var compareFlag = 1;
    for (lvlsLoop = 0; lvlsLoop < arrayCompare.length; lvlsLoop++) {
        if (arrayThis[lvlsLoop] != arrayCompare[lvlsLoop]) {
            compareFlag = 0;
        }
    }
    return compareFlag;
}

function arrays_equal(a, b) {
    return !(a < b || b < a);
}

/*---------------------------------------------------------------------------------------
                                      Error Handling functions
---------------------------------------------------------------------------------------*/


function testPageExists(pageUrl) {
        $.ajax(pageUrl, {
            statusCode: {
                404: function () {
                    return
                    false;
                    $("#result1").html("not working");
                },
                200: function () {
                    return
                    true;
                    $("#result1").html("working");
                }
            }
        });
    }
/*---------------------------------------------------------------------------------------
                                      TIMELINE & Local
---------------------------------------------------------------------------------------*/	

    //GENERATE TIMELINE
function generateTimeline(subArray, index) {
        var percent = 100 / (subArray.length + 1),
            width;
		var style="";
        var subHtml = "",
            subClass = "";
        var preFlag = 0;
        for (subLoop = 0; subLoop < subArray.length; subLoop++) {
            if (subLoop == index) {
                preFlag = 1;
            }
            width = (subLoop == index) ? percent * 2 : percent;
            subClass = (subLoop == index) ? "peg current" : "peg";
            subClass += (preFlag == 0) ? " pre" : "";
            subGotoText = labels.vocab.goTo+ " " + subArray[subLoop].title;
            subLink = subArray[subLoop].sPosition;
            subHtml += "\n<a href='#' class='" + subClass + "' style='width:" + width + "%' ";
			subHtml += " onkeyup='timelinekeypress(event)';"
			subHtml+=" tabindex='-1' onClick='fNav(\"" + subLink + "\");return false;' title='" + subGotoText + "' >";
			subHtml+="<span>Page </span>" + (subLoop+1) + "</a>";
        }
        return subHtml;
    }
    //pass an object and a maximum depth. get a list of matching objects and an index
    //permissive it to allow multi-level acceptance.
function getLocalList(thisObj, targetDepth, permissive) {
        var thisDepth = thisObj.aPosition.length - 1;
        var returnList = new Array();
        var returnIndex, listCounter = 0;
        //loop through flatIndex and check the aPosition
        for (flatLoop = 0; flatLoop < masterStructure.flatList.length; flatLoop++) {
            foundFlag = 1;
            //go through all the levels and compare
            for (lvlLoop = 0; lvlLoop < targetDepth; lvlLoop++) {
                if (thisObj.aPosition[lvlLoop] != masterStructure.flatList[flatLoop].aPosition[lvlLoop]) {
                    foundFlag = 0;
                }
            }
            if (foundFlag == 1) {
                if (permissive || (masterStructure.flatList[flatLoop].aPosition.length == thisObj.aPosition.length)) {
                    if (masterStructure.flatList[flatLoop].aPosition == thisObj.aPosition) {
                        returnIndex = listCounter;
                    }
                    returnList[returnList.length] = masterStructure.flatList[flatLoop];
                    listCounter++;
                }
            }
        } //end flatloop
        return [returnList, returnIndex];
        //}
    }
/*---------------------------------------------------------------------------------------
                                      NAVIGATION
---------------------------------------------------------------------------------------*/	
    // clicked on a menu item
function fNav(itemID) {
	if (fIsLocked()){return false};//Intercept if page is locked
    if (itemID.indexOf("lvl") == -1) {
        //this is a SUB
        var aPosition = getArrayFromString(itemID);
        masterStructure.targetNav = aPosition;
        masterStructure.loadTarget();
		// verify if we are loading content
		
		if(masterStructure.findSub(aPosition).isPage){
			pushPage(itemID); // CSPS add page to history sc		
		}
    }
    else {
        //this is a LEVEL
        //should there even be something like this?
    }
    return false;
}



// replace history
function replacePage(page){
	if(browser == "lt-ie10")	History.replaceState(null,null,page) ;
	else	History.replaceState(null,null,"index_"+lang+".html?state="+page);
}
// clicked browser back forward button
function popPage(itemID){	
		var aPosition = getArrayFromString(itemID);	
		
		masterStructure.targetNav = aPosition;
		masterStructure.loadTarget();	
}
function pushPage(itemID){
	if(browser == "lt-ie10"){
		History.pushState({_index:History.getCurrentIndex()}, null, itemID);
	}else{		
		History.pushState({_index:History.getCurrentIndex()}, null, "index_"+lang+".html?state="+itemID);	
	}
	
}
function changeLang(otherLang){
	if (fIsLocked()){return false};//Intercept if page is locked
	amINavigating = true;
	mycurrentPageVar = History.getState().cleanUrl.substr(History.getState().cleanUrl.lastIndexOf("/")+1);		
	
	// log the current state language page	
	if(browser == "lt-ie10"){				
		window.location.href = "index_" + otherLang + ".html#./"+ mycurrentPageVar;			
	}else{		
		window.location.href = "index_" + otherLang + ".html?state=" + mycurrentPageVar;	
		History.replaceState(null,null,"index_"+otherLang+".html?state=" + mycurrentPageVar);
	}	
		
	return false;
	
}

function fClickedOutsideMenuNav() {
    //Clicked outside , so set the target as current
    masterStructure.targetNav = masterStructure.currentNav;

}

function goToNextPage() {
	if (fIsLocked()){return false};//Intercept if page is locked
	if(!$(".next").hasClass("disabled")){ //had to add this so that IE would stop causing errors.
		var nextObj = masterStructure.nextPage();
		masterStructure.targetNav = nextObj.aPosition;
		masterStructure.loadTarget();
		pushPage("m"+masterStructure.currentNav.join("-"));
	}
}

function goToPrevPage() {
	if (fIsLocked()){return false};//Intercept if page is locked
	if(!$(".back").hasClass("disabled")){ //had to add this so that IE would stop causing errors.
		var prevObj = masterStructure.prevPage();
		masterStructure.targetNav = prevObj.aPosition;
		masterStructure.loadTarget();
		pushPage("m"+masterStructure.currentNav.join("-"));
	}
}

function loadHome(){
	fNav(masterStructure.flatList[0].sPosition);
}

function loadLast(){
	fNav(masterStructure.flatList[masterStructure.flatList.length-1].sPosition);
}

function quitNav() {
    window.opener.quitCourse();
}

 function timelinekeypress(e){
	var keyCode = e.keyCode ? e.keyCode : e.which;
    var rightarrow = 39, leftarrow=37;
	var thisObj=$(".peg.current");
        if (keyCode == rightarrow){
			goToNextPage();
			masterStructure.isTimelineBrowsing=true;
        }else if (keyCode ==leftarrow){
			goToPrevPage();
			masterStructure.isTimelineBrowsing=true;
		}
 }

function showTopMenu(){

		 if (showLangSwitch == false ) $("#wb-lng>ul.text-right").find(".lang").parent().remove();
		 if (showHome == false ) $("#wb-lng>ul.text-right").find(".home").parent().remove();
		 if (showHelp == false ) $("#wb-lng>ul.text-right").find(".help").parent().remove();
		 if (showToolbox == false ) $("#wb-lng>ul.text-right").find(".toolbox").parent().remove();
			 if (showGlossary == false ) $("#wb-lng>ul.text-right").find(".glossary").parent().remove();
		 	if (showResources == false ) $("#wb-lng>ul.text-right").find(".resources").parent().remove();
		 if (showExit == false ) $("#wb-lng>ul.text-right").find(".quit").parent().remove();

	
	
	}
/*---------------------------------------------------------------------------------------
                                      DEVELOPMENT
---------------------------------------------------------------------------------------*/

function isIE( version, comparison ){
    var $div = $('<div style="display:none;"/>').appendTo($('body'));
    $div.html('<!--[if '+(comparison||'')+' IE '+(version||'')+']><a>&nbsp;</a><![endif]-->');
    var ieTest = $div.find('a').length;
    $div.remove();
    return ieTest;
}

//temporary function, remember to delete systemMSG from the files
function msg(message) {
    $(".systemMSG").css("color", "white");
    $(".systemMSG").css("float", "right");
    $(".systemMSG").prev().css("float", "left");
    $(".systemMSG").text(message);
}


// ON WINDOW RESIZE (CSPS TD)
//Attribute a max-height to the menu so it can scroll
function fAttributeMenuMaxHeight() {
	tOffset = $("nav#wb-sm").offset();
	tMaxh = $(window).height()-(tOffset.top+$("nav#wb-sm .nvbar div.row").height());
	if (!isIE(8)){
		$("#wb-sm .active .sm").css('max-height',tMaxh+'px');//CSPS SJ this causes a BUG (white menu) in IE8
	}
}
$(window).resize(function() {
	fAttributeMenuMaxHeight();
});
//Initial
fAttributeMenuMaxHeight();
/*---------------------------------------------------------------------------------------
                                      CONSOLE LOG FIX
---------------------------------------------------------------------------------------*/

// <<THANK YOU SO MUCH IE8 FOR NOT SUPPORTING THE CONSOLE CORRECTLY>> FIX
var alertFallback = false;
   if (typeof console === "undefined" || typeof console.log === "undefined") {
     console = {};
     if (alertFallback) {
         console.log = function(msg) {
              alert(msg);
         };
		 console.error = function(msg) {
              alert(msg);
         };
     } else {
         console.log = function() {};
		 console.error = function() {};
     }
   }
/*---------------------------------------------------------------------------------------
                                      PADALICIOUS SWIPE
---------------------------------------------------------------------------------------*/

	var triggerElementID = null; // this variable is used to identity the triggering element
	var fingerCount = 0;
	var startX = 0;
	var startY = 0;
	var curX = 0;
	var curY = 0;
	var deltaX = 0;
	var deltaY = 0;
	var horzDiff = 0;
	var vertDiff = 0;
	var minLength = 72; // the shortest distance the user may swipe
	var swipeLength = 0;
	var swipeAngle = null;
	var swipeDirection = null;
	


	function touchStart(event,passedName) {
		// disable the standard ability to select the touched object
		//event.preventDefault();
		// get the total number of fingers touching the screen
		fingerCount = event.touches.length;
		// since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
		// check that only one finger was used
		if ( fingerCount == 1 ) {
			// get the coordinates of the touch
			startX = event.touches[0].pageX;
			startY = event.touches[0].pageY;
			// store the triggering element ID
			triggerElementID = passedName;
		} else {
			// more than one finger touched so cancel
			touchCancel(event);
		}
	}

	function touchMove(event) {
		//event.preventDefault();
		if ( event.touches.length == 1 ) {
			curX = event.touches[0].pageX;
			curY = event.touches[0].pageY;
		} else {
			touchCancel(event);
		}
	}
	
	function touchEnd(event) {
		//event.preventDefault();
		// check to see if more than one finger was used and that there is an ending coordinate
		if ( fingerCount == 1 && curX != 0 ) {
			// use the Distance Formula to determine the length of the swipe
			swipeLength = Math.round(Math.sqrt(Math.pow(curX - startX,2) + Math.pow(curY - startY,2)));
			// if the user swiped more than the minimum length, perform the appropriate action
			if ( swipeLength >= minLength ) {
				//caluculateAngle();
				//determineSwipeDirection();
				processingRoutine();
				touchCancel(event); // reset the variables
			} else {
				touchCancel(event);
			}	
		} else {
			touchCancel(event);
		}
	}

	function touchCancel(event) {
		// reset the variables back to default values
		fingerCount = 0;
		startX = 0;
		startY = 0;
		curX = 0;
		curY = 0;
		deltaX = 0;
		deltaY = 0;
		horzDiff = 0;
		vertDiff = 0;
		swipeLength = 0;
		swipeAngle = null;
		swipeDirection = null;
		triggerElementID = null;
	}
	
	function caluculateAngle() {
		var X = startX-curX;
		var Y = curY-startY;
		var Z = Math.round(Math.sqrt(Math.pow(X,2)+Math.pow(Y,2))); //the distance - rounded - in pixels
		var r = Math.atan2(Y,X); //angle in radians (Cartesian system)
		var swipeAngle = Math.round(r*180/Math.PI); //angle in degrees
		if ( swipeAngle < 0 ) { swipeAngle =  360 - Math.abs(swipeAngle); }
		return swipeAngle
	}

	
	function determineSwipeDirection() {
		var swipeDirection;
		var swipeAngle=caluculateAngle();
		if ( (swipeAngle <= 45) && (swipeAngle >= 0) ) {
			swipeDirection = 'left';
		} else if ( (swipeAngle <= 360) && (swipeAngle >= 315) ) {
			swipeDirection = 'left';
		} else if ( (swipeAngle >= 135) && (swipeAngle <= 225) ) {
			swipeDirection = 'right';
		} else if ( (swipeAngle > 45) && (swipeAngle < 135) ) {
			swipeDirection = 'down';
		} else {
			swipeDirection = 'up';
		}
		return  swipeDirection;
	}
	
	function processingRoutine() {
		var swipedElement = document.getElementById(triggerElementID);
		var swipeDirection=determineSwipeDirection();
		if ( swipeDirection == 'left' ) {
			event.preventDefault();
			// REPLACE WITH YOUR ROUTINES
			//swipedElement.style.backgroundColor = 'orange';
			goToNextPage()
		} else if ( swipeDirection == 'right' ) {event.preventDefault();
			// REPLACE WITH YOUR ROUTINES
			//swipedElement.style.backgroundColor = 'green';
			goToPrevPage();
		}
	}

function initWbAdd(obj){
	if($("#dynamic_content").find(obj).length >0){wb.add(obj);}
	}

 function callInit(){
	 if(typeof masterStructure === 'undefined'){
			masterStructure=new navStructure();

			
		}else{
			masterStructure.populate();
			//Init saveObj
			trackingObj = new saveObj();
			if(trackViewedSubs)	masterStructure.getViewedSubs();
			//some weird bug about tabindex.... 
			$(".backnext").children("a").attr("tabindex", "0")
			
		}
 }

/*TD-16/09/15*/
function fIsLocked(){ //Check if locked, confirm if user really wants leave
    if (masterStructure.isPageLocked){
		var lockCheck = confirm(labels.nav.isPageLockedMessage);
		masterStructure.isPageLocked = !lockCheck;
	}
	return masterStructure.isPageLocked;
}
function lockPage(){masterStructure.isPageLocked=true;} //Call to lock page
function unlockPage(){masterStructure.isPageLocked=false;} //Call to unlock page