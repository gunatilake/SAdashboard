app.controller('eventAll', function($scope, $firebaseArray) {
	
	//references
	var firebaseRefEvent = firebase.database().ref("event");
	
	var list = $firebaseArray(firebaseRefEvent);
	//references end
	
	//create event
	//other inits
	
	$scope.eventTitle = "";
	
	$scope.rel = {
		event: 'general'
	};
	
	$scope.eventNote = false;
	$scope.eventDesc = "";
	$scope.eventLocation = "";
	$scope.choose = {
		selectedEventId: "general"
	};
	
	//event relation to unit or club selection
	$scope.onEventRelSelect = function(selec)
	{
		if($scope.rel.event != 'general')
		{
			$scope.sel = $firebaseArray(firebase.database().ref($scope.rel.event));
		}
	};
	//other init end
	
	//guide init
	$scope.listGuide = $firebaseArray(firebase.database().ref("guides"));
	
	$scope.chooseGuide = {
		selectedGuideId: "none"	
	};
	
	//guide init
	
	//date init start
	$scope.activeDate = null;
	$scope.selectedDates = [];
	//$scope.eventDate = "";
	$scope.eventDatealt = "";
	$scope.eventTimestart = "";
	$scope.pickMode = "indi";
	
	$scope.dateOptions = {
		startingDay: 1,
		customClass: function(data) {
			if($scope.selectedDates.indexOf(data.date.setHours(0, 0, 0, 0)) > -1) {
				return 'selected';
			}
			return '';
		}
	};
	
	$scope.removeSelected = function(dt)
	{
		$scope.selectedDates.splice($scope.selectedDates.indexOf(dt), 1);
		$scope.activeDate = dt;
	};
	//date init end
	
	//timepicker init
	
	$scope.eventTimeRange = {
		start: new Date(),
		end: new Date()
	};
	$scope.duration = false;
	
	$scope.toggleDuration = function()
	{
		$scope.duration = !$scope.duration;
	};
	
	//timepicker init end
	
	$scope.createEvent = function()
	{
		var valid = true;
		var errMsg = "";
		
		//needed for validation purposes
		var relrel = $scope.choose.selectedEventId.$id;
		var relrelguide = $scope.chooseGuide.selectedGuideId.$id;
		
		if($scope.eventTitle == "")
		{
			valid = false;
			errMsg = errMsg + "missing title\n"
		}
		
		if($scope.rel.event == 'general' || $scope.rel.event == undefined || $scope.rel.event == null)
		{
			relrel = 'general';
		}
		
		if(relrel === undefined)
		{
			valid = false;
			errMsg = errMsg + "choose a related club or unit\n"
		}
		
		if($scope.eventGuideRelCheck)
		{
			window.alert("true?")
			if(relrelguide == "none" || relrelguide == undefined || relrelguide == null)
			{
				errMsg = errMsg + "click on the related guide\n"
			}
		}
		else
		{
			window.alert("false")
			relrelguide = "none";
		}
		/*
		
		** date from miliseconds to string to object
		
		*** eventDate need to get values from selectedDate everytime button is pressed
		*** because eventDate needs to be reset just in case, it will be reassigned anyways
		  
		*/
		
		//no point running this code if there is no date selected
		var tempDate = "";
		if($scope.selectedDates.length > 0)
		{
			var selectedDateStrRep = "{";
			var i;
			
			for(i in $scope.selectedDates)
			{
				if(!(i == $scope.selectedDates.length - 1))
				{
					selectedDateStrRep = selectedDateStrRep + '\"' + $scope.selectedDates[i] + '\"' + ':' + 'true,';
					$scope.eventDatealt = $scope.eventDatealt + $scope.selectedDates[i] + "-";
				}
				else
				{
					selectedDateStrRep = selectedDateStrRep +'\"' + $scope.selectedDates[i] + '\"' + ':' + 'true';
					$scope.eventDatealt = $scope.eventDatealt + $scope.selectedDates[i];
				}
			}
			
			selectedDateStrRep = selectedDateStrRep + '}';
			
			$scope.eventDate = JSON.parse(selectedDateStrRep);
			
		}
		else
		{
			valid = false;
			errMsg = errMsg + "date not selected\n"
		}
		
		
		//time to string
		//for addition of the 0 in time with minutes below 10
		var tempO = "";
		var tempO2 = "";
		
		//time reassignment later to keep the variable of type date time
		var timeStart = $scope.eventTimeRange.start;
		var timeEnd = $scope.eventTimeRange.end;
		
		
		if(timeStart.getMinutes() < 10)
		{
			tempO = "0";
		}
		
		$scope.eventTimestart = timeStart.getHours().toString() + ":" + tempO + timeStart.getMinutes().toString();
		
		
		if($scope.duration)
		{
			errMsg = errMsg + timeStart + "\n" + timeEnd;
			
			if(timeEnd < timeStart)
			{
				valid = false;
				errMsg = errMsg + "end time cannot be earlier that start time\n";
			}
			
			if(timeEnd.getMinutes() < 10)
			{
				tempO2 = "0";
			}
			
			$scope.eventTime = timeStart.getHours().toString() + ":" + tempO + timeStart.getMinutes().toString() + "-" + 
								timeEnd.getHours().toString() + ":" + tempO2 + timeEnd.getMinutes().toString();
		}
		else
		{
			$scope.eventTime = $scope.eventTimestart;
		}
		
		console.log($scope.eventTimestart);
		
		if($scope.eventLocation == "")
		{
			$scope.eventLocation = "<no location given>";
		}
		
		if($scope.eventDesc == "")
		{
			$scope.eventDesc = "<no description given>";
		}
		
		if(valid)
		{
			list.$add({
				date: $scope.eventDate,
				datealt: $scope.eventDatealt,
				desc: $scope.eventDesc,
				guiderel: relrelguide,
				location: $scope.eventLocation,
				note: $scope.eventNote,
				relateTo: $scope.rel.event + "/" + relrel,
				time: $scope.eventTime,
				timestart: $scope.eventTimestart,
				title: $scope.eventTitle
			}).then(function(ref) {
				var id = ref.key;
				//console.log("added record with id " + id);
				window.alert("added record with id " + id);
				list.$indexFor(id); // returns location in the array
				
				//try to clear the field after addition
			});
		}
		else
		{
			window.alert(errMsg);
			console.log($scope.selectedDates);
			console.log($scope.eventDate);
		}
		
		$scope.eventDate = null;
		$scope.eventDatealt = "";
		$scope.eventTimestart = "";
	};
	
	
	//read event
	//https://stackoverflow.com/questions/42615092/angularjs-filter-in-nested-ng-repeats
	$scope.viewEvent = list;
	
	$scope.eventChecked = {
		events: []
	};
	
	$scope.chgMiliToDate = function(mili)
	{
		var arrayDates = mili.split("-");
		var i;
		var date = "";
		for(i in arrayDates)
		{
			var dateTem = new Date(arrayDates[i]);
			date = date + dateTem + " , ";
		}
		return date;
	};
	
	//edit event
	$scope.onEventEditClick = function()
	{
		if($scope.eventChecked.events.length == 1)
		{
			console.log("later");
		}
	}
	
	//delete event
	$scope.deleteEvent = function()
	{
		if($scope.eventChecked.events.length > 0)
		{
			var i;
		
			for(i = 0; i < $scope.eventChecked.events.length; i++)
			{
				firebase.database().ref().child("event/" + $scope.eventChecked.events[i]).remove();
			}
			
			$scope.eventChecked = {
				events: []
			};
		}
		else
		{
			window.alert("no selection");
		}
	};
	
});