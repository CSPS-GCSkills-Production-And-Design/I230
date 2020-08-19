

//unescape(encodeURIComponent(str)).length NO MAX THAN 4096

//SAVE OBJ; use it to save/load stuff
function saveObj(){
	//ASSUMES doLMSGetValue(X); and doLMSSetValue(X,Y); exists (STANDARD SCORM FUNCTIONS)
	/*
	IMPORTANT
		cmi.comments = 
	USEFULL; eventually maybe
		cmi.core.lesson_location = 
		cmi.core.lesson_status = 
	USELESS; for now
		cmi.core.student_id = 
		cmi.core.student_name = 
		cmi.launch_data = 
		cmi.suspend_data = 
		cmi.core.score.raw = 
		cmi.core.score.min = 
		cmi.core.score.max = 
		cmi.core.total_time = 
		cmi.student_data.mastery_score = 
		cmi.student_data.max_time_allowed = 
		cmi.student_data.time_limit_action = 
		cmi.student_preference.audio = 
		cmi.student_preference.text = 
		cmi.student_preference.language = 
		cmi.student_preference.speed = 
	*/
	
	//jQuery.parseJSON
	//JSON.parse()
	//JSON.stringify() 
	//OLD BROWSERS USE EVAL(terrible idea)
	
	//DATA CONTAINS DATA IN OBJ FORMAT; used for everything...
	this.data = {};
	
	//IS LOADED? (BOOL) THAT SIGNIFIES IF INITIAL TRACKING HAS BEEN RETRIEVED FROM iLMS
	this.isLoaded = false;
	
	//IS SYNCHRONIZE? (BOOL) THAT SPECIFIES IF this.data{} IS SYNCHRONIZED WITH (THE SAME AS) WHATS IN THE iLMS
	this.isSynchronized = false;
	
	//PURE STRING OF WHATS IN THE CMI.COMMENTS; it's what the iLMS gives and takes when loading/saving
	this.stringData = "";
	
	//SYNC MODE: ("agressive" || "passive")
	//  -AGRESSIVE = SAVE AS SOON AS SOMETHING IS MODIFIED IN this.data{}
	//  -PASSIVE = SAVE WHEN NECESSARY (ON CALL?)
	var syncMode = "agressive";
	
	//INITIALIZE SAVE OBJ; preparing the thing to work
	this.fInit = function (){
		
		//LOAD 
		this.stringData = this.fGetLMSData();
		if(this.stringData === undefined || typeof this.stringData != "string" || this.stringData === ""){
			//EMPTY STRING DATA
			this.stringData = "";
			//console.log("saveObj.fInit: seems like there's nothing to load right now.");
		}else{
			//CONVERT TO OBJECT
			//console.log("|"+this.stringData+"|");
			this.data = JSON.parse(this.stringData);
			
		}
		
		//ONCE LOADED...
		this.isLoaded = true;
		this.isSynchronized = true;
	};
	
	
	//SAVE DATA; you know, save stuff
	this.saveData = function (id,dat){
		
		//NOT SYNCHRONIZED NO MORE
		this.isSynchronized = false;
		
		if(!this.fValidateData(dat,-1)){
			//console.error('cannot save, failed basic data validation.');
			return false;
		}
		
		if(this.data[id]===undefined){
			//create new entry
			//console.log('saveObj.data: creating new entry: '+id+' --->\n'+dat+'\n<---');
			this.data[id] = dat;
		}else{
			//update existing entry
			//console.log('saveObj.data: updating entry: '+id+' --->\n'+dat+'\n<---');
			this.data[id] = dat;
		}

		//READY JSON STRING
		this.stringData = JSON.stringify(this.data);
		
		
		//SAVE DATA TO iLMS
		if(syncMode == "agressive"){
			this.syncData();
		}
		
	};
	
	//RETRIEVE DATA; you know, return stuff you asked for
	this.getData = function (id){
		if(this.data[id] === undefined){
			//console.log('saveObj.getData('+id+'): trying to retrieve data that doesnt exist.');
			return undefined;
		}else{
			return this.data[id];
		}		
	};
	
	//SYNCHRONIZE DATA; take current this.data{} and save it in iLMS
	this.syncData = function (){
		//window.opener.doLMSSetValue("cmi.comments",JSON.stringify(this.data));
		//scorm.saveCommentsData(JSON.stringify(this.data));
		//console.log('saveObj.syncData: Im not actually saving anything, but dont tell anyone:'+JSON.stringify(this.data));
		scorm.saveSuspendData(JSON.stringify(this.data));
		this.isSynchronized = true;
	};
	
	//GET TRACKING STRING FROM iLMS
	this.fGetLMSData = function (){
		//console.log('saveObj.fGetLMSData: I may return a valid JSON string but, its actually fake content');
		//return '{"var_1":"somestuffiwanttosave","var_2":{"asd":"asda","awqw":"awweweqw"},"var_3":["1","324","asd3"]}'; //FAKE STRING (*TMP)
		//return scorm.getComments();
		return scorm.getSuspendData();
		return false;
		/* tmp = scorm.getComments();
		console.log(tmp);
		
		 return tmp; */
		//return  tmp;//MIGHT WANNA ADD SOME CONDITIONS HERE...*TMP
		/*try{
		}
		catch(err){
			//return err;
		}*/
		//return false;
		
	};
	
	//VALIDATE DATA
	this.fValidateData = function (dat, mode){
		var isValid = true;
		//IMPERATIVELY CHANGE UNDEFINEDs TO NULLs (JSON DOESNT LIKE UNDEFINED)
		dat = (dat === undefined) ? null : dat ;
		
		//*TMP, should also crawl through objects & arrays to get rid of undefineds, unefinedes, undefinds...we
		
		mode = (isNaN(mode))?0:mode;
		switch(mode){
			case -1:
				//Loose - don't care
				//obvious passthrough *TMP
				isValid = true;
				break;
			case 0:
				//Strict - Check if String
				if(typeof dat != "string"){
					isValid = false;
				}
				break;
			default:
			//console.error('saveObj.fValidateData: validation mode does not exist');
		}
		return isValid;
	};
	
	//REPLACE DATA IF NECESSARY (2ND PARAM FOR JSON.stringify())
	this.fReplaceData = function (chk){
		//ESCAPES AND ENCODES...*TMP
		return chk; //obvious passthrough is *TMP
	};
	
	//INITIALIZE SELF INITIALIZATION
	this.fInit();
}


//
// *TMP, GOES SOMEWHERE ELSE OF COURSE
//
/*
$(document).ready(function() {
	//AUTO-INIT
	trackingObj = new saveObj();
	
	
	//TESTING
	
	// SAVE STUFF
	// trackingObj.saveData("unestring","textestextes"); //String
	// trackingObj.saveData("unarray",{"array pos0","array pos1":"array pos2","array pos3":"array pos4"}); //Obj
	// trackingObj.saveData("unobj",["132423","3asda24","a4353sd3",true,false,0]) //Array
	
	
	// GET STUFF
	// trackingObj.getData("myvar2");
	// trackingObj.getData("myvar2342"); //Should return undefined + throw error
	
});*/