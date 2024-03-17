var idx = 0;
var margin = { top: 40, right: 40, bottom: 200, left: 40 };

$(document).ready(function () {
  getMangaData();
  genPublisherDropdown();
  drawChart();

  $(window).on("resize", function () {
    clearChart();
    drawChart();
  });

  $("#filterPublisher").on("change", function () {
    clearChart();
    
    const selectedPublisher = $(this).children("option:selected").attr("id");
    idx = selectedPublisher;

    drawChart();
  });

});

async function fetchCSV() {
  let response = await fetch("./data/manga.csv");
  let data = await response.text();
  return data;
}

function parseCSV(csvData) {
  let lines = csvData.split("\n");
  let headers = lines[0].split(",");
  let result = [];

  for (let i = 1; i < lines.length; i++) {
    let line = lines[i].split(",");
    if (line.length === headers.length) {
      let obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = line[j];
      }
      result.push(obj);
    }
  }

  return result;
}

async function getMangaData() {
  let csvData = await fetchCSV();
  let parsedData = parseCSV(csvData);
  let data = parsedData.map((data) => {
    return {
      title: data["Manga series"],
      publisher: data["Publisher"],
      sales: data["Approximate sales in million(s)"],
    };
  });

  return data;
}

async function genPublisherDropdown() {
  const publisherList = await changeMangaQty();

  let strHtml = "";
  for (let i = 0; i < publisherList.length; i++) {
    strHtml += "<option value='" + publisherList[i]['publisher'] + "'" + "id='" + i + "'>" + publisherList[i]['publisher'] + "</option>";
  }
  
  $("#filterPublisher").html(strHtml);
} 

async function drawChart() {
  let data = await getMangaData();
  let mangaQty = await changeMangaQty();
  let publisherList = await objectToArray(mangaQty);

  let publisherSales = publisherList.map((publisher) => {
    let sales = data
      .filter((data) => data.publisher === publisher)
      .map((data) => data.sales);

    let title = data
      .filter((data) => data.publisher === publisher)
      .map((data) => data.title);

    return {
      publisher: publisher,
      mangaSaleList: {
        title: title,
        sales: sales,
      }
    };
  });

  let barWidth = 20;
  let numBars = publisherSales[idx].mangaSaleList.title.length;

  let responsiveSvgWidth = window.innerWidth / 1.25;
  let maxSvgWidth = numBars * barWidth + margin.left + margin.right;

  let svgWidth = 0;

  if ($(window).width() >= 1400) {
    svgWidth = maxSvgWidth * 1.5;
  } else {
    svgWidth = responsiveSvgWidth;
  }

  if (numBars >= 15) {
    svgWidth = responsiveSvgWidth;
  }

  let svgHeight = window.innerHeight / 1.5;
  let innerWidth = svgWidth - margin.left - margin.right;
  let innerHeight = svgHeight - margin.top - margin.bottom;

  let salesData = publisherSales[idx].mangaSaleList.sales.map(parseFloat);

  let svg = d3.select("#chart")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  let xScale = d3.scaleBand()
  .domain(d3.range(publisherSales[idx].mangaSaleList.title.length))
  .range([margin.left, innerWidth + margin.left])
  .padding(0.1);

  let yScale = d3.scaleLinear()
  .domain([0, d3.max(salesData)])
  .nice()
  .range([innerHeight + margin.top, margin.top]);

  svg.selectAll("rect")
  .data(publisherSales[idx].mangaSaleList.sales)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", (d, i) => xScale(i))
  .attr("y", innerHeight + margin.top)
  .attr("width", xScale.bandwidth())
  .transition()
  .duration(1000)
  .ease(d3.easeCubicInOut)
  .delay((d, i) => i * 15)
  .attr("y", d => yScale(d))
  .attr("height", d => innerHeight + margin.top - yScale(d));

  let xAxis = d3.axisBottom(xScale);
  let yAxis = d3.axisLeft(yScale);

  svg.append("g")
  .attr("class", "axis")
  .attr("transform", `translate(0, ${innerHeight + margin.top})`)
  .call(xAxis)
  .selectAll("text")
  .attr("transform", "rotate(-70)")
  .attr("x", - 20)
  .attr("y", 0)
  .style("text-anchor", "end")
  .html((d, i) => publisherSales[idx].mangaSaleList.title[i]);

  svg.append("g")
  .attr("class", "axis")
  .attr("transform", `translate(${margin.left}, 0)`)
  .call(yAxis)
  .append("text")
  .attr("y", margin.top - 25)
  .style("font-size", "16px")
  .style("text-anchor", "middle")
  .style("fill", "black")
  .text("Sales (Million)");

  svg.append("text")
  .attr("class", "axis")
  .attr("x", svgWidth / 2)
  .attr("y", svgHeight - 20)
  .style("text-anchor", "middle")
  .style("font-size", "26px")
  .text("Publisher:" + " " + publisherSales[idx].publisher);
}

async function clearChart() {
  d3.select("#chart").selectAll("*").remove();
}

async function changeMangaQty() {
  const csvData = await fetchCSV();
  const parsedData = parseCSV(csvData);
  const publisherCountMap = {};

  parsedData.forEach(data => {
    const publisher = data["Publisher"];
    publisherCountMap[publisher] = (publisherCountMap[publisher] || 0) + 1;
  });

  let publisherCount = Object.keys(publisherCountMap).map((key) => {
    return {
      publisher: key,
      count: publisherCountMap[key],
    };
  });
  
  const mangaQty = publisherCount.filter((data) => data.count >= 1);

  return mangaQty;
}

async function objectToArray(obj) {
  let arr = [];

  for (let i = 0; i < obj.length; i++) {
    let publisher = obj[i]['publisher'];
    let publisherStr = publisher.toString();
    arr.push(publisherStr);
  }

  return arr;
}