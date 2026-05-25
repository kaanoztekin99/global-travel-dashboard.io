class InteractionManager{
    constructor(data, charts) {
        this.data = data;
        this.activations = {
            map: new Set(),
            parallelCoordinates: new Set(),
            durationBudget: new Set()
        }
        this.data.cities.forEach(city => {
            city.active = true;
            this.activations.parallelCoordinates.add(city);
        });
        this.data.countries.forEach(country => {
            country.active = true;
        });
        

        this.charts = charts;

        this.pubSub = new Map();
        this.linkCharts();
    }

    linkCharts(){
        this.subscribe(
            "mapCountrySelected",
            [(data) => this.charts.parallelCoordinates.updateChart(data),
            (data) => this.charts.budgetLevelBar.updateChart(data),
            (data) => this.charts.cityDurationBudgetStackedBar.updateChart(data),
            (data) => this.charts.cityTemperatureHorizon.updateChart(data),
            (data) => this.charts.countryHeritageScatter.updateChart(data)]
        )
        this.subscribe(
            this.charts.parallelCoordinates.events.brush, 
            [(data) => this.charts.cityDurationBudgetStackedBar.updateChart(data),
            (data) => this.charts.budgetLevelBar.updateChart(data),
            (data) => this.charts.cityTemperatureHorizon.updateChart(data)]
        );
        this.subscribe(
            this.charts.cityDurationBudgetStackedBar.events.click,
            [(data) => this.charts.cityTemperatureHorizon.updateChart(data)]
        )
    }

    subscribe(event, callbacks) {
        for(const callback of callbacks){
            if (!this.pubSub.has(event)) {
                this.pubSub.set(event, []);
            }
            this.pubSub.get(event).push(callback);
        }        
    }

    publish(event, data) {
        this.handleEventData(event, data);
        if (this.pubSub.has(event)) {
            this.pubSub.get(event).forEach(
                callback => callback(this.data)
            );
        }
    }

    handleEventData(event, data) {
        switch(event) {
            case this.charts.budgetLevelBar.events.countrySelected:
                this.handleBudgetLevelBarCountrySelected(data);
                break;
            case this.charts.budgetLevelBar.events.countryDeselected:
                this.handleBudgetLevelBarCountryDeselected(data);
                break;
            case this.charts.parallelCoordinates.events.brush:
                this.handleParallelCoordinatesBrush(data);
                break;
            case this.charts.cityDurationBudgetStackedBar.events.click:
                this.handleCityDurationBudgetStackedBarClick(data);
                break
            case "mapCountrySelected":
                this.handleMapCountrySelected(data);
                break;
            default:
                break;
        }

        this.data.countries.forEach((country) => {
            country.active = this.activations.map.size == 0 || this.activations.map.has(country.iso_code);
        })
        
        const active_countries = this.data.countries.filter((country) => country.active);
        this.data.cities.forEach(city => {
            const match = active_countries.find(c => c.name === city.country);
            city.active = match ? match.active : false; // is corresponding country active
            city.active &= this.activations.parallelCoordinates.has(city); // is brushed
            city.active &= this.activations.durationBudget.size == 0 || this.activations.durationBudget.has(city); // is in selected duration/budget
        });   
        
        console.log(this.data.cities.filter((c) => c.active));
        
    }

    handleBudgetLevelBarCountrySelected(countryData) {
        const {country, budgetLevel} = countryData;
        console.log("Selected ", countryData);
    }

    handleBudgetLevelBarCountryDeselected(countryData) {
        const {country, budgetLevel} = countryData;
        console.log("Deselected ", countryData);
    }

    handleParallelCoordinatesBrush(data) {
        this.activations.parallelCoordinates.clear();
        this.activations.durationBudget.clear();

        const {cities} = data;        
        cities.forEach((city) => {
            this.activations.parallelCoordinates.add(city);
        })
    }

    handleMapCountrySelected(selectedCountryCodes) {
        this.activations.map.clear();
        this.activations.durationBudget.clear();
        this.data.cities.forEach(city => {
            city.active = true;
            this.activations.parallelCoordinates.add(city);
        });

        if(selectedCountryCodes.length !== 0)
            selectedCountryCodes.forEach(country_code => this.activations.map.add(country_code));        
    }

    handleCityDurationBudgetStackedBarClick(data){
        this.activations.durationBudget.clear();
        if(data === null) return;
        
        const {duration, budgetLevel} = data;
        console.log(duration, budgetLevel);
        this.data.cities.forEach(city => {            
            if(city.budget_level === budgetLevel && city.ideal_durations.includes(duration))
                this.activations.durationBudget.add(city)
        })

        console.log(this.activations.durationBudget)
    }

}