const authLink = 'https://www.strava.com/oauth/token';
let perPage = ''
let startDate = document.getElementById('start');
let endDate = document.getElementById('end');

//UNIX (EPOCH) TIME CONVERTER FOR DATE ENTRY

function epochTimeConverter(date){
    let dateVals = date.split('-')
    let epochYear = 1970;
    let year = parseInt(dateVals[0]);
    let month = (parseInt(dateVals[1])-1);
    let day = parseInt(dateVals[2]);
    let leapDay = 0;
    let monthDays = 0;

    //LEAP DAY COUNTER

    for(let i = 2; i < (year - epochYear); i += 4){
        leapDay++
    }

    for(let i = 1; i <= month; i++){
        if(i === 2){
            monthDays += 28
        } else if (i === 4 || i === 6 || i === 9 || i === 11) {
            monthDays += 30
        } else {
            monthDays += 31;
        }
    }


    let epochTime = ((((year - epochYear) * 365) + monthDays + (day) + leapDay) * 86400)

    return epochTime
}

function getAthlete(authInfo){
    const atheleteLink = `https://www.strava.com/api/v3/athlete?&access_token=${authInfo}`
    fetch(atheleteLink)
        .then(function(r){
            return r.json();
        })
        .then(function(json){
            getActivities(authInfo, json);
        })
        
}


function getActivities(authInfo, athleteInfo){
    let unixStartDate = epochTimeConverter(startDate.value);
    console.log(unixStartDate)
    let unixEndDate = (epochTimeConverter(endDate.value) + 86400)
    let activitiesLink = `https://www.strava.com/api/v3/athlete/activities?before=${unixEndDate}&after=${unixStartDate}&per_page=200&access_token=${authInfo}`
    ; //max activities = 200  
    fetch(activitiesLink)
        .then(function(r){
            return r.json();
        })
        .then(function(json){
            accessibleData(athleteInfo, json)
        })

}


function reAuthorize(){
    fetch(authLink,{
        method: 'post', 
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            client_id: '54325',
            client_secret: '35b087d68f75bbd16da2ee7ad1cb586aceaa5a3c',
            refresh_token: 'a53922d0167b1f29bbb4a5c15c41f1435faabd74',
            grant_type: 'refresh_token'

        })

    }).then(function(response){
        return response.json();
    })
    .then(function(json){
        access = json.access_token;
        getAthlete(access);
    })
}

let genBtn = document.getElementById('genBtn')
genBtn.addEventListener('click', e => {
    reAuthorize()
})

function accessibleData(athleteInfo, activitiesInfo){
    let userData = {
        profileData: athleteInfo,
        activities: activitiesInfo,
    }

    console.log(userData)

    let tbody = document.getElementById('dynamicRows')
    let histogram = document.getElementById('histogram')

    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    while (histogram.firstChild){
        histogram.removeChild(histogram.firstChild);
    }

    //Initial DOM work

    let userPic = document.getElementById('userPic')
    let sheetContainer = document.getElementById('sheetContainer');
    let sheetTable = document.getElementById('sheetTable');
    let dynamicRows = document.getElementById('dynamicRows');
    let tfootTotals = document.querySelectorAll('.tfootTotals');
    let tfootAverages = document.querySelectorAll('.tfootAverages');

    userPic.src = userData.profileData.profile_medium;

//VANILLA SHEETS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function timeConverter(seconds){
        let remainingSecs = seconds % 60;
        let minutes = Math.floor(seconds /60);
        let time = minutes+(remainingSecs/100);
        return time.toFixed(2);
    }

    function minutesPer(time, distance){
        let secondsPer = time / (distance/1000);
        let minutes = timeConverter(secondsPer);
        return (Math.floor(minutes * 100) / 100).toFixed(2);
    }

    //SETTING UP ROWS

    for(let i = 0; i < userData.activities.length; i++){  
        let tableRow = document.createElement('tr');
        tableRow.setAttribute('class', 'tableRows')

        if(i >= userData.activities.length){
            tableRow.setAttribute('class', 'tableRows tfooters')
        }

        //FILLING OUT TD DATA

        for(let j = 0; j < 11; j++){
            let tableData = document.createElement('td');
            let dataVal = null;
            
            switch (j) {
                case 0:
                    dataVal = i + 1;
                    break;
                case 1:
                    dataVal = userData.activities[i].start_date_local.substr(0, 10);
                    break;
                case 2:
                    dataVal = (userData.activities[i].distance / 1000).toFixed(2);
                    break;
                case 3:
                    dataVal = ((userData.activities[i].distance / 1000) * 0.621).toFixed(2);
                    break;
                case 4:
                    dataVal = timeConverter(userData.activities[i].moving_time);
                    break;
                case 5:
                    dataVal = userData.activities[i].total_elevation_gain;
                    break;
                case 6:
                    dataVal = (userData.activities[i].total_elevation_gain * 3.28084).toFixed(2);
                    break;
                case 7:
                    dataVal = minutesPer(userData.activities[i].moving_time, userData.activities[i].distance);
                    break;
                case 8:
                    dataVal = minutesPer(userData.activities[i].moving_time, (userData.activities[i].distance * 0.621371));
                    break;
                case 9:
                    if(userData.activities[i].average_heartrate === undefined){
                        dataVal = `– – –`
                    }else{
                        dataVal = userData.activities[i].average_heartrate;
                    }
                    break;
                case 10:
                    if(userData.activities[i].max_heartrate === undefined){
                        dataVal = `– – –`
                    }else{
                        dataVal = userData.activities[i].max_heartrate;
                    }                    break;

            }

            tableData.innerText = dataVal; 
            tableRow.appendChild(tableData)
        }

        dynamicRows.appendChild(tableRow);
    }
       
    //FILLING OUT AVERAGES AND TOTALS FOR TFOOTER

    for (let i = 0; i < tfootAverages.length; i++){

        let avgData = null;
        let ttlsData = null;

        switch (i) {
            case 0:
                avgData = 'Avgs';
                ttlsData = 'Ttls';
                break;
            case 1:
                avgData = '– – – – – –';
                ttlsData = `${userData.activities[0].start_date_local.substr(0, 10)} – ${userData.activities[userData.activities.length-1].start_date_local.substr(0, 10)}`;
                break;
            case 2:
                totalDistance = 0;
                userData.activities.forEach(activity => {
                    totalDistance += activity.distance/1000;                    
                })
                ttlsData = totalDistance.toFixed(2)
                avgData = (totalDistance/userData.activities.length).toFixed(2)
                break;
            case 3:
                totalDistance = 0;
                userData.activities.forEach(activity => {
                    totalDistance += activity.distance/1000;                    
                })
                totalDistanceMiles = totalDistance * 0.621
                ttlsData = totalDistanceMiles.toFixed(2)
                avgData = (totalDistanceMiles/userData.activities.length).toFixed(2)
                break;
            case 4:
                totalTime = 0;
                userData.activities.forEach(activity => {
                    totalTime += activity.moving_time;                    
                })
                ttlsData = timeConverter(totalTime);
                avgData = timeConverter(totalTime/userData.activities.length)
                break;
            case 5:
                totalElevation = 0;
                userData.activities.forEach(activity => {
                    totalElevation += activity.total_elevation_gain;
                })
                ttlsData = totalElevation.toFixed(2);
                avgData = (totalElevation/userData.activities.length).toFixed(2);
                break;
            case 6:
                totalElevation = 0;
                userData.activities.forEach(activity => {
                    totalElevation += activity.total_elevation_gain;
                })
                ttlsData = (totalElevation * 3.28084).toFixed(2);
                avgData = ((totalElevation * 3.28084)/userData.activities.length).toFixed(2);
                break;
            case 7:
                totalTime = 0;
                totalDistance = 0;
                userData.activities.forEach(activity => {
                    totalTime += activity.moving_time;
                    totalDistance += activity.distance;
                })
                avgData = minutesPer(totalTime, totalDistance)
                ttlsData = 'N/A'
                break;
            case 8:
                totalTime = 0;
                totalDistance = 0;
                userData.activities.forEach(activity => {
                    totalTime += activity.moving_time;
                    totalDistance += activity.distance;
                })
                avgData = minutesPer(totalTime, (totalDistance * 0.621371));
                ttlsData = 'N/A';
                break;
            case 9:
                totalAvgHR = 0;
                missedHR = 0;
                userData.activities.forEach(activity => {
                    if(activity.average_heartrate === undefined){
                        missedHR++
                    }else{
                        totalAvgHR += activity.average_heartrate;
                    }
                });
                avgData = (totalAvgHR / (userData.activities.length - missedHR)).toFixed(2);
                ttlsData = 'N/A';
                break;
            case 10:
                totalAvgHR = 0;
                missedHR = 0;
                userData.activities.forEach(activity => {
                    if(activity.max_heartrate === undefined){
                        missedHR++
                    }else{
                        totalAvgHR += activity.max_heartrate;
                    }
                });
                avgData = (totalAvgHR / (userData.activities.length - missedHR)).toFixed(2);
                ttlsData = 'N/A';
                break;

        }

        tfootTotals[i].innerText = ttlsData;
        tfootAverages[i].innerText = avgData;
    }
    
    //HISTOGRAM DRIP!!!

    function histogramMaker(activities){
        let firstDay = epochTimeConverter(startDate.value);
        let lastDay = (epochTimeConverter(endDate.value) + 86400)
        let numberOfDays = (lastDay - firstDay) /86400
        console.log(numberOfDays)

        // let widthPercent = activities.length;
        for(let i = 0; i < numberOfDays; i++){
            let divBar = document.createElement('div');
            let divBarSpan = document.createElement('span');

            divBar.setAttribute('class', 'divBar');
            divBarSpan.setAttribute('class', 'divBarSpan');
            divBarSpan.style.display = 'none';
            divBarSpan.style.visibility = 'hidden';

            divBar.style.width = `${(1/activities.length) * 100}%`;
            divBar.style.height = `1px`;
            divBar.style.backgroundColor = "rgb(41, 43, 44)";

            divBarSpan.innerText = 'No Activity Recorded';

            divBar.appendChild(divBarSpan);
            histogram.appendChild(divBar);
        }

        let divBars = document.querySelectorAll('.divBar');
        let divBarSpans = document.querySelectorAll('.divBarSpan')

        let longestRun = 0;
        userData.activities.forEach(activity => {
            if(activity.distance > longestRun){
                longestRun = activity.distance;
            }
        })

        function dayChecker(date){
            let thisDay = epochTimeConverter(date);
            return ((thisDay + 86400) - firstDay) / 86400;
        }

        for(let i = 0; i < activities.length; i++){
            let dayNumber = dayChecker(activities[i].start_date.substr(0, 10));
            divBars[dayNumber-1].style.height = `${(activities[i].distance / longestRun)*100}%`;
            divBarSpans[dayNumber-1].innerText = `Date: ${activities[i].start_date.substr(0, 10)} Distance: ${(activities[i].distance/1000).toFixed(2)} km`;
        }
    }
    histogramMaker(userData.activities)
};

let header = document.getElementById('header')

window.onscroll = function() {headerStyle()};

function headerStyle() {
    if (window.scrollY > 100) {
      header.style.backgroundColor = 'rgba(255, 155, 0, 1)';
      header.style.transition = 'all .3s';
    } else {
      header.style.backgroundColor = 'transparent';
      header.style.transition = 'all .3s';

    }
}