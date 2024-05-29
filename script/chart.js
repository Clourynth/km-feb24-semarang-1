document.addEventListener('DOMContentLoaded', function() {
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
                        backgroundColor: 'rgba(97, 174, 231, 0.2)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: label2,
                        data: data2,
                        borderColor: '#114266',
                        backgroundColor: 'rgba(17, 66, 102, 0.2)',
                        borderWidth: 2,
                        fill: false
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
                        '#61AEE7',
                        '#8FC9E8',
                        '#D1ECF5'
                    ],
                    borderColor: [
                        '#114266',
                        '#61AEE7',
                        '#8FC9E8',
                        '#D1ECF5'
                    ],
                    borderWidth: 2
                }]
            }
        });
    };

    const createCharts = async () => {
        // Fetch data from JSON files based on the current page
        const fetchData = async (file) => {
            const response = await fetch(`data/${file}`);
            return response.json();
        };

        const createCategorySalesChart = async () => {
            const data = await fetchData('sales_by_category.json');
            const ctx = document.getElementById('category-sales-chart').getContext('2d');
            const labels = data.map(item => item.category);
            const totalSales = data.map(item => item.total_sales);
            const itemSales = data.map(item => item.item_sales);

            createBarChart(ctx, labels, totalSales, itemSales, 'Total Sales', 'Item Sales');
        };

        const createQuarterSalesChart = async () => {
            const data = await fetchData('sales_per_quarter.json');
            const ctx = document.getElementById('quarter-sales-chart').getContext('2d');
            const labels = data.map(item => `Q${item.quarter}`);
            const totalSales = data.map(item => parseFloat(item.total_sales));
            const itemSales = data.map(item => parseFloat(item.item_sales));

            createLineChart(ctx, labels, totalSales, itemSales, 'Total Sales', 'Item Sales');
        };

        const createMonthSalesChart = async () => {
            const data = await fetchData('sales_per_month.json');
            const ctx = document.getElementById('month-sales-chart').getContext('2d');
            const labels = data.map(item =>  item.nama_bulan);
            const totalSales = data.map(item => parseFloat(item.total_sales));
            const itemSales = data.map(item => parseFloat(item.items_sales));

            createLineChart(ctx, labels, totalSales, itemSales, 'Total Sales', 'Item Sales');
        };

        const createLocationSalesChart = async () => {
            const data = await fetchData('sales_by_location.json');
            const ctx = document.getElementById('location-sales-chart').getContext('2d');
            const labels = data.map(item => item.location);
            const totalSales = data.map(item => parseFloat(item.total_sales));
            const itemSales = data.map(item => parseFloat(item.items_sales));

            createBarChart(ctx, labels, totalSales, itemSales, 'Total Sales', 'Item Sales', true);
        };

        const createPaymentSalesChart = async () => {
            const data = await fetchData('sales_by_payment_method.json');
            const ctx = document.getElementById('payment-sales-chart').getContext('2d');
            const labels = data.map(item => item.type);
            const totalSales = data.map(item => parseFloat(item.total_sales));

            createPieChart(ctx, labels, totalSales, 'Cash','Credit');
        };

        // Check and create charts based on the current page
        if (document.getElementById('category-sales-chart')) {
            createCategorySalesChart();
        } else if (document.getElementById('quarter-sales-chart')) {
            createQuarterSalesChart();
        } else if (document.getElementById('month-sales-chart')) {
            createMonthSalesChart();
        } else if (document.getElementById('location-sales-chart')) {
            createLocationSalesChart();
        } else if (document.getElementById('payment-sales-chart')) {
            createPaymentSalesChart();
        }
    };

    createCharts();
});
