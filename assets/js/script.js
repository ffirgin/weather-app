//Declare a variable to store the searched city
let city="";
// variable declaration
let searchCity = $("#search-city");
let searchButton = $("#search-button");
let clearButton = $("#clear-history");
let currentCity = $("#current-city");
let currentTemperature = $("#temperature");
let currentHumidity= $("#humidity");
let currentWSpeed=$("#wind-speed");
let currentUvIndex= $("#uv-index");
let sCity=[];
// searches the city to see if it exists in the entries from the storage
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}
//Set up the API key
let APIKey="071cd2c4562bcbc21319f59ac6f628f9";
// Display the current and future weather to the user after grabbing the city from the input text box.
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}
// Here we create the AJAX call
function currentWeather(city){
    // Here we build the URL so we can get a data from server side.
    const queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        // parse the response to display the current weather including the City name. the Date and the weather icon. 
        console.log(response);
        //Dta object from server side Api for icon property.
        const weatherIcon= response.weather[0].icon;
        const iconUrl="https://openweathermap.org/img/wn/"+weatherIcon +"@2x.png";
        // The date format method is taken from the  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        const date=new Date(response.dt*1000).toLocaleDateString();
        //parse the response for name of city and conc. the date and icon.
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconUrl+">");
        // parse the response to display the current temperature.
        // Convert the temp to fahrenheit

        const tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
        // Display the Humidity
        $(currentHumidity).html(response.main.humidity+"%");
        //Display Wind speed and convert to MPH
        const ws=response.wind.speed;
        const windsMph=(ws*2.237).toFixed(1);
        $(currentWSpeed).html(windsMph+"MPH");
        // Display UVIndex.
        //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityName"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityName",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityName",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}
    // This function returns the UVIIndex response.
function UVIndex(ln,lt){
    const uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currentUvIndex).html(response.value);
            });
}
    
// Here we display the 5 days forecast for the current city.
function forecast(cityId){
    const dayOver= false;
    const forecastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityId+"&appid="+APIKey;
    $.ajax({
        url: forecastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            const date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            const iconCode= response.list[((i+1)*8)-1].weather[0].icon;
            const iconUrl="https://openweathermap.org/img/wn/"+iconCode+".png";
            const tempK= response.list[((i+1)*8)-1].main.temp;
            const tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            const windMph = response.list[((i+1)*8)-1].wind.speed*2.237.toFixed(1);
            const humidity= response.list[((i+1)*8)-1].main.humidity;
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconUrl+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fWind"+i).html(windMph+"MPH");
            $("#fHumidity"+i).html(humidity+"%");
        }
        
    });
}

//Dynamically add the passed city on the search history
function addToList(c){
    const listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}
// display the past search again when the list group item is clicked in search history
function invokePastSearch(event){
    const liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

// render function
function loadLastCity(){
    $("ul").empty();
    let sCity = JSON.parse(localStorage.getItem("cityName"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityName"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}
//Clear the search history from the page
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityName");
    document.location.reload();

}
//Click Handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadLastCity);
$("#clear-history").on("click",clearHistory);


