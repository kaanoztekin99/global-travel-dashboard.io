const chartUtils = {
  normalizeCountryName(name) {
    return (name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  },

  getBudgetLevelColor(level) {
    if (level === "Budget") return "#fde0ef";
    if (level === "Mid-range") return "#BC71B3";
    return "#7a0177";
  },

  getBudgetLevelLabel(level) {
    return level === "Budget" ? "Budget-Friendly" : level;
  },

  sampleRandomItems(items, sampleSize) {
    // Shuffle a copy so the original parsed dataset is not mutated.
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled.slice(0, sampleSize);
  },

  parseIdealDurations(value) {
    try {
      // ideal_durations is encoded as JSON in the CSV.
      const durations = JSON.parse(value);
      return Array.isArray(durations) ? durations : [];
    } catch {
      return [];
    }
  },

  positionTooltip(event, tooltip, containerElement, offset = 12) {
    const [pointerX, pointerY] = d3.pointer(event, containerElement);
    const tooltipNode = tooltip.node();
    const containerWidth = containerElement.clientWidth || 0;
    const containerHeight = containerElement.clientHeight || 0;
    const tooltipWidth = tooltipNode?.offsetWidth || 0;
    const tooltipHeight = tooltipNode?.offsetHeight || 0;
    let left = pointerX + offset;
    let top = pointerY + offset;

    if (left + tooltipWidth > containerWidth) {
      left = pointerX - tooltipWidth - offset;
    }

    if (top + tooltipHeight > containerHeight) {
      top = pointerY - tooltipHeight - offset;
    }

    tooltip
      .style("left", `${Math.max(offset, left)}px`)
      .style("top", `${Math.max(offset, top)}px`);
  }
};

window.chartUtils = chartUtils;
