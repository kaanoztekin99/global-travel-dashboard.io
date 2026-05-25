function parseCityTemperatureStats(city) {
  let monthlyTemps;

  try {
    monthlyTemps = JSON.parse(city.avg_temp_monthly);
  } catch {
    return null;
  }

  const monthKeys = Object.keys(monthlyTemps)
    .filter((key) => Number.isFinite(Number(key)))
    .sort((a, b) => Number(a) - Number(b));

  const monthlyValues = monthKeys.map((key) => {
    const month = monthlyTemps[key] || {};
    return {
      month: Number(key),
      monthName: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ][Number(key) - 1] || key,
      avg: Number(month.avg)
    };
  }).filter((item) => Number.isFinite(item.avg));

  if (!monthlyValues.length) return null;

  const avgValues = monthlyValues.map((item) => item.avg);
  const minValues = monthlyValues.map((item) => Number(monthlyTemps[item.month]?.min)).filter(Number.isFinite);
  const maxValues = monthlyValues.map((item) => Number(monthlyTemps[item.month]?.max)).filter(Number.isFinite);

  if (!minValues.length || !maxValues.length) return null;

  const mean = avgValues.reduce((total, value) => total + value, 0) / avgValues.length;

  return {
    city: city.city,
    country: city.country,
    latitude: Number(city.latitude),
    longitude: Number(city.longitude),
    monthlyValues,
    min: Math.min(...minValues),
    max: Math.max(...maxValues),
    mean
  };
}

class CityTemperatureHorizonChart {
  constructor(containerId) {
    this.containerId = containerId;
    this.margin = { top: 28, right: 22, bottom: 80, left: 118 };
    this.width = 760;
    this.height = 520;
    this.selectedCity = null;
  }

  async initChart(data) {
    const containerElement = document.getElementById(this.containerId);

    if (!containerElement || typeof d3 === "undefined") return;

    d3.select(`#${this.containerId}`).selectAll("*").remove();

    const { sampleRandomItems } = window.chartUtils;
    const cityStats = sampleRandomItems(
      data.cities.filter(d=>d.active).map(parseCityTemperatureStats).filter(Boolean),
      12
    );

    this.render(cityStats);
  }

  render(cityStats) {
    this.clear();

    if (!cityStats.length) return;

    const container = d3.select(`#${this.containerId}`);
    const margin = this.margin;
    const innerWidth = this.width - margin.left - margin.right;
    const rowHeight = 34;
    const cityAreaHeight = cityStats.length * rowHeight;
    const innerHeight = cityAreaHeight;
    const temperatures = cityStats.flatMap((city) => city.monthlyValues.map((m) => m.avg));
    const minTemperature = Math.floor(Math.min(...temperatures) - 2);
    const maxTemperature = Math.ceil(Math.max(...temperatures) + 2);
    const bandCount = 5;
    const bandSize = (maxTemperature - minTemperature) / bandCount;
    const bandColors = d3.schemeRdYlBu[5].reverse();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const svgHeight = margin.top + innerHeight + margin.bottom;

    const svg = container
      .append("svg")
      .attr("viewBox", `0 0 ${this.width} ${svgHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "100%");

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(monthNames)
      .range([0, innerWidth])
      .padding(0.5);

    const yAxisScale = d3.scaleLinear()
      .domain([minTemperature, maxTemperature])
      .range([innerHeight, 0]);

    const tooltip = container
      .append("div")
      .attr("class", "tooltip city-temperature-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden");

    chart.append("g")
      .attr("transform", `translate(0,${innerHeight + 12})`)
      .call(d3.axisBottom(x))
      .call((g) => g.selectAll("text")
        .attr("transform", "rotate(-35)")
        .style("text-anchor", "end")
        .style("font-size", "12px")
        .style("font-weight", "700"))
      .call((g) => g.select(".domain").attr("stroke", "#9ca3af"));

    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -96)
      .attr("text-anchor", "middle")
      .attr("fill", "#374151")
      .attr("font-size", 14)
      .attr("font-weight", 800)
      .text("Bands (Low to High Temp)");

    chart.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + margin.bottom - 18)
      .attr("text-anchor", "middle")
      .attr("fill", "#374151")
      .attr("font-size", 14)
      .attr("font-weight", 800)
      .text("Months");

    const monthBandWidth = (innerWidth / monthNames.length) * 0.72;

    const cityRows = chart.selectAll("g.city-row")
      .data(cityStats)
      .enter()
      .append("g")
      .attr("class", "city-row")
      .attr("transform", (city, index) => `translate(0, ${index * rowHeight})`)
      .style("cursor", "pointer")
      .on("click", (event, city) => {
        const isSelectedCity = this.selectedCity === city.city;
        this.selectedCity = isSelectedCity ? null : city.city;

        cityRows.selectAll("text.city-label")
          .attr("fill", (rowCity) => rowCity.city === this.selectedCity ? "#dc2626" : "#111827")
          .attr("font-weight", (rowCity) => rowCity.city === this.selectedCity ? 900 : 700);

        cityRows.selectAll("rect.city-row-selection")
          .attr("stroke", (rowCity) => rowCity.city === this.selectedCity ? "#000000" : "transparent")
          .attr("stroke-width", (rowCity) => rowCity.city === this.selectedCity ? 3 : 0);

        if (isSelectedCity) {
          if (typeof window.clearFocusedCityMarker === "function") {
            window.clearFocusedCityMarker();
          }

          return;
        }

        if (typeof window.focusMapCity === "function") {
          window.focusMapCity(city);
        } else if (typeof window.focusMapCountry === "function") {
          window.focusMapCountry(city.country);
        }
      });

    cityRows.append("text")
      .attr("class", "city-label")
      .attr("x", -14)
      .attr("y", rowHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", (city) => city.city === this.selectedCity ? "#dc2626" : "#111827")
      .attr("font-size", 11)
      .attr("font-weight", (city) => city.city === this.selectedCity ? 900 : 700)
      .text((city) => city.city.length > 16 ? `${city.city.slice(0, 16)}...` : city.city);

    cityRows.each((city, cityIndex, nodes) => {
      const row = d3.select(nodes[cityIndex]);

      for (let bandIndex = 0; bandIndex < bandCount; bandIndex++) {
        const bandStart = minTemperature + bandIndex * bandSize;
        const bandEnd = bandStart + bandSize;
        const y0 = 0;

        const area = d3.area()
          .x((d) => d.x)
          .y0((d) => rowHeight - d.y)
          .y1(rowHeight)
          .curve(d3.curveCatmullRom.alpha(0.5));

        const areaData = city.monthlyValues.map((monthData) => {
          const temp = monthData.avg;
          const clippedTemp = Math.max(bandStart, Math.min(bandEnd, temp));
          const yPos = ((clippedTemp - bandStart) / bandSize) * rowHeight;
          return { x: x(monthData.monthName), y: yPos };
        });

        row.append("path")
          .datum(areaData)
          .attr("d", area)
          .attr("fill", bandColors[bandIndex])
          .attr("opacity", 0.95);
      }

      city.monthlyValues.forEach((monthData) => {
        const monthName = monthData.monthName;
        const xPos = x(monthName) - monthBandWidth / 2;

        row.append("rect")
          .attr("x", xPos)
          .attr("y", 0)
          .attr("width", monthBandWidth)
          .attr("height", rowHeight)
          .attr("fill", "transparent")
          .style("cursor", "pointer")
          .on("mouseover", (event) => {
            tooltip
              .style("visibility", "visible")
              .html(
                `<strong>${city.city}, ${city.country}</strong><br>` +
                `${monthName}: ${monthData.avg.toFixed(1)}°C`
              );

            row.selectAll("path")
              .attr("opacity", 1);
          })
          .on("mousemove", (event) => {
            window.chartUtils.positionTooltip(
              event,
              tooltip,
              d3.select(`#${this.containerId}`).node()
            );
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
            row.selectAll("path")
              .attr("opacity", 0.95);
          });
      });

      row.append("rect")
        .attr("class", "city-row-selection")
        .attr("x", 0)
        .attr("y", 1)
        .attr("width", innerWidth)
        .attr("height", rowHeight - 2)
        .attr("fill", "none")
        .attr("stroke", city.city === this.selectedCity ? "#000000" : "transparent")
        .attr("stroke-width", city.city === this.selectedCity ? 3 : 0)
        .attr("rx", 3)
        .attr("pointer-events", "none");
    });

    chart.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", innerHeight)
      .attr("y2", innerHeight)
      .attr("stroke", "#9ca3af")
      .attr("stroke-width", 1);
  }

  updateChart(data){
    this.clear();
    this.initChart(data);
  }

  clear() {
    d3.select(`#${this.containerId}`).selectAll("*").remove();
  }

  destroy() {
    this.clear();
  }
}
