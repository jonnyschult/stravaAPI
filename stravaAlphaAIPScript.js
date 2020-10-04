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
    let day = (parseInt(dateVals[2])-1);
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
    let unixEndDate = epochTimeConverter(endDate.value)
    console.log(unixStartDate, unixEndDate)
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
        activites: activitiesInfo,
    }

    console.log(userData)

    //Initial DOM work

    let userPic = document.getElementById('userPic')
    let sheetContainer = document.getElementById('sheetContainer');
    let sheetTable = document.getElementById('sheetTable');
    let dynamicRows = document.getElementById('dynamicRows');
    let tfootTotals = document.querySelectorAll('.tfootTotals');
    console.log(tfootTotals);
    let tfootAverages = document.querySelectorAll('.tfootAverages');
    console.log(tfootAverages)

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

    for(let i = 0; i < userData.activites.length; i++){  
        let tableRow = document.createElement('tr');
        tableRow.setAttribute('class', 'tableRows')

        if(i >= userData.activites.length){
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
                    dataVal = userData.activites[i].start_date_local.substr(0, 10);
                    break;
                case 2:
                    dataVal = (userData.activites[i].distance / 1000).toFixed(2);
                    break;
                case 3:
                    dataVal = ((userData.activites[i].distance / 1000) * 0.621).toFixed(2);
                    break;
                case 4:
                    dataVal = timeConverter(userData.activites[i].moving_time);
                    break;
                case 5:
                    dataVal = userData.activites[i].total_elevation_gain;
                    break;
                case 6:
                    dataVal = (userData.activites[i].total_elevation_gain * 3.28084).toFixed(2);
                    break;
                case 7:
                    dataVal = minutesPer(userData.activites[i].moving_time, userData.activites[i].distance);
                    break;
                case 8:
                    dataVal = minutesPer(userData.activites[i].moving_time, (userData.activites[i].distance * 0.621371));
                    break;
                case 9:
                    if(userData.activites[i].average_heartrate === undefined){
                        dataVal = `– – –`
                    }else{
                        dataVal = userData.activites[i].average_heartrate;
                    }
                    break;
                case 10:
                    if(userData.activites[i].max_heartrate === undefined){
                        dataVal = `– – –`
                    }else{
                        dataVal = userData.activites[i].max_heartrate;
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
                ttlsData = `${userData.activites[0].start_date_local.substr(0, 10)} – ${userData.activites[userData.activites.length-1].start_date_local.substr(0, 10)}`;
                break;
            case 2:
                totalDistance = 0;
                userData.activites.forEach(activity => {
                    totalDistance += activity.distance/1000;                    
                })
                ttlsData = totalDistance.toFixed(2)
                avgData = (totalDistance/userData.activites.length).toFixed(2)
                break;
            case 3:
                totalDistance = 0;
                userData.activites.forEach(activity => {
                    totalDistance += activity.distance/1000;                    
                })
                totalDistanceMiles = totalDistance * 0.621
                ttlsData = totalDistanceMiles.toFixed(2)
                avgData = (totalDistanceMiles/userData.activites.length).toFixed(2)
                break;
            case 4:
                totalTime = 0;
                userData.activites.forEach(activity => {
                    totalTime += activity.moving_time;                    
                })
                ttlsData = timeConverter(totalTime);
                avgData = timeConverter(totalTime/userData.activites.length)
                break;
            case 5:
                totalElevation = 0;
                userData.activites.forEach(activity => {
                    totalElevation += activity.total_elevation_gain;
                })
                ttlsData = totalElevation.toFixed(2);
                avgData = (totalElevation/userData.activites.length).toFixed(2);
                break;
            case 6:
                totalElevation = 0;
                userData.activites.forEach(activity => {
                    totalElevation += activity.total_elevation_gain;
                })
                ttlsData = (totalElevation * 3.28084).toFixed(2);
                avgData = ((totalElevation * 3.28084)/userData.activites.length).toFixed(2);
                break;
            case 7:
                totalTime = 0;
                totalDistance = 0;
                userData.activites.forEach(activity => {
                    totalTime += activity.moving_time;
                    totalDistance += activity.distance;
                })
                avgData = minutesPer(totalTime, totalDistance)
                ttlsData = 'N/A'
                break;
            case 8:
                totalTime = 0;
                totalDistance = 0;
                userData.activites.forEach(activity => {
                    totalTime += activity.moving_time;
                    totalDistance += activity.distance;
                })
                avgData = minutesPer(totalTime, (totalDistance * 0.621371));
                ttlsData = 'N/A';
                break;
            case 9:
                totalAvgHR = 0;
                missedHR = 0;
                userData.activites.forEach(activity => {
                    if(activity.average_heartrate === undefined){
                        missedHR++
                    }else{
                        totalAvgHR += activity.average_heartrate;
                    }
                });
                avgData = (totalAvgHR / (userData.activites.length - missedHR)).toFixed(2);
                ttlsData = 'N/A';
                break;
            case 10:
                totalAvgHR = 0;
                missedHR = 0;
                userData.activites.forEach(activity => {
                    if(activity.max_heartrate === undefined){
                        missedHR++
                    }else{
                        totalAvgHR += activity.max_heartrate;
                    }
                });
                avgData = (totalAvgHR / (userData.activites.length - missedHR)).toFixed(2);
                ttlsData = 'N/A';
                break;

        }

        tfootTotals[i].innerText = ttlsData;
        tfootAverages[i].innerText = avgData;
    }
    
    
};

let header = document.getElementById('header')

window.onscroll = function() {headerStyle()};

function headerStyle() {
    if (window.scrollY > 150) {
      header.style.backgroundColor = 'rgba(255, 155, 0, .98)';
      header.style.transition = 'all .3s';
    } else {
      header.style.backgroundColor = 'transparent';
      header.style.transition = 'all .3s';

    }
    console.log('window.scrollY')
}