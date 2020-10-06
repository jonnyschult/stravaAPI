BUGS TO FIX
    * FIXED Conflicting dates between UTC and local time (see July 1 as an example)
    * FIXED Show multi-run days in histogram 
    * FIXED Address bargraph display for small date ranges (probably related to multi-run day issue)
    * FIXED Bar height not always right (longest hidden by multi-run bug?)

API METHOD
    * Generate Sheet button fires reAuthorize() when date parameters are entered
    * ReAuthorize() initiates oauth flow
    * Oauth flow makes API post (I used Postman to get some of the information needed after authorization)
    * Reauthorize posts credentials to security server via API post call with client secret and refresh key. (fuzzy knowledge here)
    * Had to log into Strava and give permission for my app to access my data
    * If permission given security server returns temporary authentication key
    * Authentication key is passed via functions to the data server in two API calls, one for athlete profile info, another for their activities 
    * Activities API call takes in date parameters, runs timeConverter() (see more under functions descriptions) to set date to Epoch/Unix time, which is what the API expects for date parameters.
    * Both json()ify the information and pass it as arguments to the accessibleData().

MAIN FUNCTION
    1 accessibleData() is the overarching function which generates the information in the table and histogram.
    2 It combines the arguments passed to it, json()ified athlete and activities data, into an object, 'userData', that is then accessed throughout the function
    3 index.html contains a stubbed out <thead> and <tfoot>
    4 <thead> already has column head values. Athlete profile picture is insterted to first <thead> <td> 
    5 Two while loops remove generated data when new API call is made
    6 Table is generated via for loop with switch
    7 For loop loops over the activities creating <tr>s for each activity
    8 Second for loop then creates <td>s for each <tr> generated in the parent loop. The number of <tds> is determined by what data I decided to show, which, index value of run for list created, date, distance/km,	distance/mi, duration elevation gain/m elevation gain/ft pace/km pace/mi average HR max HR
    9 To assign values to <td>s, I used a switch which checks value of for loop index 'j'. When j = n, then the <td> n which is created in that loop interation, is assigned a value via innerText which corresponds to that data column type. For instance, the third <td> created is to display distance in km. So, when index j = three, it creates the third <td> and then goes into switch, if j === 3, which in this case it does, it assigns the distance values from userData.activities for at the index of i, the current parent iteration which is the <tr> for a specific activity, and then converts that distance into km. 
    10 <td>s are appended to <tr>
    11 <tr>s are appended to dynamicRows tbody
    12 End fo <tr> making for loop
    13 <tfoot> is stubbed out and ready to receive values. 
    14 values are assigned via for loop over each <td> in the <tfoot> 
    15 each loop enters a switch, which dynamically assigns <td> values by ranging over values entered for <tbody> data, averages or totals as applicable, then insterts data to that particular <td>. Similar to other switch, but more complicated.
    16 accessibleData then calls histogramMaker function which creates a histogram out of userData activities (bit buggy).
    17 histogramMaker() checks the number of days spanning the dates entered by user, creates a div and a span for each day, sets the divs height to 1px and their width to (1/numberOfDays * 100)% so that each div takes up equal space and can be dynamically resized with browser. It then as assigns span value to display none and visibility hidden. It set span innerText to 'No Activity Recorded' as the default value for each day. It then appends each span to the div, and each div to histogram container div. 
    18 a forEach() is called to check which activity had the longest run and sets a variable to that value. 
    19 A loop is then called which goes over each activity. dayChecker() is called to get the value of the day. That day value is then used to index into the array of day divs created before. It resets the height value to the activities ((distance/longestRun) * 100)%. This enables the longest run to be set to 100%, and every other run distance height is set relative to that height. So, say the longest run is 10k, then that run's corresponding div height will be set to 100%, another run which was 6.5 will then have it's div set to 65%. This allows the user to see the frequency of runs as well as relative distance. (this can be improved upon later to include a coordinate system which will give precise ranges of distance). 
    20 The span inside the div is then given an innerText value which is the date and distance of the run. With css, when the user hover over the bar (div), it highlights it to a themed color and displays the span content.

UNIQUE FUNCTION DESCRIPTIONS 