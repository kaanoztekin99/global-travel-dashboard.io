function destroyCountryLevelCharts() {
  // Clear country-level D3 DOM before switching views.
  const charts = window.interactionManager && window.interactionManager.charts;

  if (!charts) return;

  if (charts.countryHeritageScatter && typeof charts.countryHeritageScatter.destroy === "function") {
    charts.countryHeritageScatter.destroy();
  }

  if (charts.budgetLevelBar && typeof charts.budgetLevelBar.destroy === "function") {
    charts.budgetLevelBar.destroy();
  }
}

function destroyCityLevelCharts() {
  // Clear city-level D3 DOM before switching views.
  const charts = window.interactionManager && window.interactionManager.charts;

  if (!charts) return;

  if (charts.cityTemperatureHorizon && typeof charts.cityTemperatureHorizon.clear === "function") {
    charts.cityTemperatureHorizon.clear();
  }

  if (charts.cityDurationBudgetStackedBar && typeof charts.cityDurationBudgetStackedBar.clear === "function") {
    charts.cityDurationBudgetStackedBar.clear();
  }
}

window.destroyCountryLevelCharts = destroyCountryLevelCharts;
window.destroyCityLevelCharts = destroyCityLevelCharts;
