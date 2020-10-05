function epochTimeConverter(date){
    let dateVals = date.split('-')
    let epochYear = 1970;
    let year = parseInt(dateVals[0]);
    let month = (parseInt(dateVals[1])-1);
    let day = (parseInt(dateVals[2]));
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

console.log(epochTimeConverter(`2020-10-04`))
