$(document).ready(function () {
    processData();
    getPublisherList();
    drawChart();

    $("#searchPublisher").on("keyup", function () {
        searchPublisher();
    });

    $("#filterPublisher").on("change", function () {
        const selectedPublisher = $(this).val();
        const table = document.getElementById("data");
        const tr = table.getElementsByTagName("tr");

        for (let i = 0; i < tr.length; i++) {
            const td = tr[i].getElementsByTagName("td")[1];
            if (td) {
                const txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(selectedPublisher.toUpperCase()) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    });
});

async function processData() {
    try {
      const csvData = await fetchCSV();
      const parsedData = parseCSV(csvData);
      let strHtml = "";
  
      for (let i = 0; i < parsedData.length; i++) {
          strHtml += "<tr>";
          strHtml += "<td>" + parsedData[i]["Manga series"] + "</td>";
          strHtml += "<td>" + parsedData[i]["Publisher"] + "</td>";
          strHtml += "<td>" + parsedData[i]["Approximate sales in million(s)"] + " " + "M" + "</td>";
          strHtml += "<tr>";
  
          $("#data").html(strHtml);
      }
    } catch (error) {
      console.error("Error fetching or parsing CSV:", error);
    }
  }
  
  async function searchPublisher() {
    const input = document.getElementById("searchPublisher");
    const filter = input.value.toUpperCase();
    const table = document.getElementById("data");
    const tr = table.getElementsByTagName("tr");
  
    for (let i = 0; i < tr.length; i++) {
      const td = tr[i].getElementsByTagName("td")[1];
      if (td) {
        const txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }
  
  async function getPublisherList() {
    const csvData = await fetchCSV();
    const parsedData = parseCSV(csvData);
    const publisherList = parsedData.map((data) => data["Publisher"]);
  
    const uniquePublisher = publisherList.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    
    let strHtml = "<option value=''>Select Publisher</option>";
    for (let i = 0; i < uniquePublisher.length; i++) {
      strHtml += "<option value='" + uniquePublisher[i] + "'" + "id='" + i + "'>" + uniquePublisher[i] + "</option>";
    }
  
    $("#filterPublisher").html(strHtml);
  }