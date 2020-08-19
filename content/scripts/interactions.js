//Javascript document
/* is called on every page load, great for adding custom code to all pages*/
function pageLoaded(){
		if(debugMode){$("html").addClass("debug")}
		updateModule()
	}




/* list All pages */	
function listAllPages(){
		var sitemap=masterStructure.flatList;
		var returnHtml="";
	for(i=0;i<sitemap.length;i++){
		returnHtml+="<p> #"+sitemap[i].flatID+" "+sitemap[i].sPosition +" - <a href='#' onClick=\"fNav('"+sitemap[i].sPosition+"')\">"+sitemap[i].title+"</a></p>"
	}


	
	return returnHtml;
	}
	
/* switch the css theme */
function toggleCss(file, timelineDestination){

			 $("link.theme").attr("href", "./theme/"+file+".css") ;
	}
	
$(document).ready(function() {

		$("#wb-sttl").append("<p id='module-text' class='num-mod-pos breadcrumb'></p>")
});

function updateModule(){
		var dParent=$(masterStructure.findSub(masterStructure.currentNav).obj).attr("data-parent")
		var moduleName=(!(typeof(dParent) == 'undefined'))?dParent:"";
		
		$("#module-text").html(moduleName)
	}
	
	function printAll(){ 
$("#dynamic_content").html("<div id='printall'></div>"); 
masterStructure.loadAll("#printall") 
 
$("html").addClass("print") 
} 
 
function beforePrint(){ 
$("html").addClass("print") 
$('details').attr("open", "true") 
$("input[type='radio'].ra").parent().css("border", "1px green solid"); 
$(".btn").hide() 
} 
 
function afterPrint(){ 
$("html").removeClass("print") 
$('details').removeAttr("open"); 
$("input[type='radio'].ra").parent().css("border", "none"); 
$(".btn").show(); 
} 
 
(function() { 
    if (window.matchMedia) { 
        var mediaQueryList = window.matchMedia('print'); 
        mediaQueryList.addListener(function(mql) { 
            if (mql.matches) { 
                beforePrint(); 
            } else { 
                afterPrint(); 
            } 
        }); 
    } 
 
    window.onbeforeprint = beforePrint; 
    window.onafterprint = afterPrint; 
}()); 