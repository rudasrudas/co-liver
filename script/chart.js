function setupCategoryChart(elementQuery, data){
    const element = document.querySelector(elementQuery);

    anychart.onDocumentReady(() => {
        const chart = anychart.bar();
        chart.data = data;
        chart.title("The deadliest earthquakes in the XXth century");
        chart.container('chart');
        chart.draw();
    });
}