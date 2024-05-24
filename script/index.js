document.addEventListener('DOMContentLoaded', async () => {
    const machineFilter = document.getElementById('machineFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const monthFilter = document.getElementById('monthFilter');
    const ctxCategory = document.getElementById('salesByCategoryChart')?.getContext('2d');

    if (ctxCategory) {
    // Fetch data from JSON file
    const fetchData = async () => {
        const response = await fetch('data/data.json');
        return response.json();
    };

    const data = await fetchData();

    // Helper function to parse currency values
    const parseCurrency = (value) => parseFloat(value.replace('$', ''));

    // Add quarter information to the data
    const addQuarterToData = (data) => {
        return data.map(item => {
            const month = item.month;
            let quarter;
            if (month <= 3) quarter = 'Q1';
            else if (month <= 6) quarter = 'Q2';
            else if (month <= 9) quarter = 'Q3';
            else quarter = 'Q4';
            return { ...item, quarter };
        });
    };

    const enhancedData = addQuarterToData(data);

    // Populate filters
    const populateFilters = (data) => {
        const machines = [...new Set(data.map(item => item.machine))];
        const categories = [...new Set(data.map(item => item.category))];
        const months = [...new Set(data.map(item => item.month))];

        machines.forEach(machine => {
            const option = document.createElement('option');
            option.value = machine;
            option.text = machine;
            machineFilter.appendChild(option);
        });

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.text = category;
            categoryFilter.appendChild(option);
        });

        months.forEach((month) => {
            const option = document.createElement('option');
            option.value = month;
            option.text = new Date(0, month - 1).toLocaleString('default', { month: 'long' });
            monthFilter.appendChild(option);
        });
    };

    populateFilters(enhancedData);

    // Calculate and display totals
    const calculateAndDisplayTotals = (data) => {
        const totalSales = data.reduce((sum, item) => sum + parseCurrency(item.linetotal), 0);
        const totalQuantity = data.reduce((sum, item) => sum + item.rqty, 0);
        const totalProducts = new Set(data.map(item => item.product)).size;

        document.getElementById('totalSales').innerText = `$${totalSales.toFixed(2)}`;
        document.getElementById('quantitySold').innerText = totalQuantity;
        document.getElementById('totalProduct').innerText = totalProducts;
    };

    calculateAndDisplayTotals(enhancedData);

    // Chart.js configurations
    const createLineChart = (ctx, labels, data1, data2, label1, label2) => {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: label1,
                        data: data1,
                        borderColor: '#61AEE7',
                        backgroundColor: '#61AEE7',
                        borderWidth: 2
                    },
                    {
                        label: label2,
                        data: data2,
                        borderColor: '#114266',
                        backgroundColor: '#114266',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    const createBarChart = (ctx, labels, data1, data2, label1, label2, horizontal = false) => {
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: label1,
                        data: data1,
                        backgroundColor: '#61AEE7',
                        borderColor: '#61AEE7',
                        borderWidth: 2
                    },
                    {
                        label: label2,
                        data: data2,
                        backgroundColor: '#114266',
                        borderColor: '#114266',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                indexAxis: horizontal ? 'y' : 'x',
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    const createPieChart = (ctx, labels, data, label) => {
        const total = data.reduce((sum, value) => sum + value, 0);
        const percentages = data.map(value => ((value / total) * 100).toFixed(2));

        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels.map((label, index) => `${label} (${percentages[index]}%)`),
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: [
                        '#114266',
                        '#61AEE7'
                    ],
                    borderColor: [
                        '#114266',
                        '#61AEE7'
                    ],
                    borderWidth: 2
                }]
            }
        });
    };

    // Extract and prepare data for charts
    const prepareChartData = (data, key) => {
        const labels = [...new Set(data.map(item => item[key]))];
        const itemSales = labels.map(label => {
            return data.filter(item => item[key] === label).reduce((sum, item) => sum + item.rqty, 0);
        });
        const totalSales = labels.map(label => {
            return data.filter(item => item[key] === label).reduce((sum, item) => sum + parseCurrency(item.linetotal), 0);
        });

        return { labels, itemSales, totalSales };
    };

    const salesPerMonthData = prepareChartData(enhancedData, 'month');
    const salesPerQuarterData = prepareChartData(enhancedData, 'quarter');
    const salesByCategoryData = prepareChartData(enhancedData, 'category');
    const salesByLocationData = prepareChartData(enhancedData, 'location');
    const salesByPaymentData = prepareChartData(enhancedData, 'type');

    // Initialize charts
    const ctxMonth = document.getElementById('salesPerMonthChart').getContext('2d');
    const ctxQuarter = document.getElementById('salesPerQuarterChart').getContext('2d');
    const ctxCategory = document.getElementById('salesByCategoryChart').getContext('2d');
    const ctxLocation = document.getElementById('salesByLocationChart').getContext('2d');
    const ctxPayment = document.getElementById('salesByPaymentChart').getContext('2d');

    const salesPerMonthChart = createLineChart(ctxMonth, salesPerMonthData.labels, salesPerMonthData.totalSales, salesPerMonthData.itemSales, 'Total Sales', 'Item Sales');
    const salesPerQuarterChart = createLineChart(ctxQuarter, salesPerQuarterData.labels, salesPerQuarterData.totalSales, salesPerQuarterData.itemSales, 'Total Sales', 'Item Sales');
    const salesByCategoryChart = createBarChart(ctxCategory, salesByCategoryData.labels, salesByCategoryData.totalSales, salesByCategoryData.itemSales, 'Total Sales', 'Item Sales');
    const salesByLocationChart = createBarChart(ctxLocation, salesByLocationData.labels, salesByLocationData.totalSales, salesByLocationData.itemSales, 'Total Sales', 'Item Sales', true);
    const salesByPaymentChart = createPieChart(ctxPayment, salesByPaymentData.labels, salesByPaymentData.totalSales, 'Sales by Payment Method');

    // Apply filters
    const applyFilters = () => {
        const machine = machineFilter.value;
        const category = categoryFilter.value;
        const month = monthFilter.value;

        let filteredData = enhancedData;

        if (machine) filteredData = filteredData.filter(item => item.machine === machine);
        if (category) filteredData = filteredData.filter(item => item.category === category);
        if (month) filteredData = filteredData.filter(item => item.month === parseInt(month));

        calculateAndDisplayTotals(filteredData);

        const salesPerMonthData = prepareChartData(filteredData, 'month');
        const salesPerQuarterData = prepareChartData(filteredData, 'quarter');
        const salesByCategoryData = prepareChartData(filteredData, 'category');
        const salesByLocationData = prepareChartData(filteredData, 'location');
        const salesByPaymentData = prepareChartData(filteredData, 'type');

        salesPerMonthChart.data.labels = salesPerMonthData.labels;
        salesPerMonthChart.data.datasets[0].data = salesPerMonthData.totalSales;
        salesPerMonthChart.data.datasets[1].data = salesPerMonthData.itemSales;
        salesPerMonthChart.update();

        salesPerQuarterChart.data.labels = salesPerQuarterData.labels;
        salesPerQuarterChart.data.datasets[0].data = salesPerQuarterData.totalSales;
        salesPerQuarterChart.data.datasets[1].data = salesPerQuarterData.itemSales;
        salesPerQuarterChart.update();

        salesByCategoryChart.data.labels = salesByCategoryData.labels;
        salesByCategoryChart.data.datasets[0].data = salesByCategoryData.totalSales;
        salesByCategoryChart.data.datasets[1].data = salesByCategoryData.itemSales;
        salesByCategoryChart.update();

        salesByLocationChart.data.labels = salesByLocationData.labels;
        salesByLocationChart.data.datasets[0].data = salesByLocationData.totalSales;
        salesByLocationChart.data.datasets[1].data = salesByLocationData.itemSales;
        salesByLocationChart.update();

        salesByPaymentChart.data.labels = salesByPaymentData.labels.map((label, index) => `${label} (${((salesByPaymentData.totalSales[index] / salesByPaymentData.totalSales.reduce((sum, value) => sum + value, 0)) * 100).toFixed(2)}%)`);
        salesByPaymentChart.data.datasets[0].data = salesByPaymentData.totalSales;
        salesByPaymentChart.update();
    };

    machineFilter.addEventListener('change', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    monthFilter.addEventListener('change', applyFilters);
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (document.getElementById('category-sales-chart')) {
            createCategorySalesChart();
        } else if (document.getElementById('quarter-sales-chart')) {
            createQuarterSalesChart();
        } else if (document.getElementById('location-sales-chart')) {
            createQuarterSalesChart();
        }else if (document.getElementById('payment-sales-chart')) {
            createQuarterSalesChart();
        }else if (document.getElementById('month-sales-chart')) {
            createQuarterSalesChart();
        }
        // Add conditions for month, location, and payment charts
    });
    
  
});
