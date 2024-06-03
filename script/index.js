document.addEventListener('DOMContentLoaded', async () => {

    // Elemen filter
    const machineFilter = document.getElementById('machineFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const monthFilter = document.getElementById('monthFilter');

    // Context untuk setiap chart
    const ctxCategory = document.getElementById('salesByCategoryChart')?.getContext('2d');
    const ctxMonth = document.getElementById('salesPerMonthChart')?.getContext('2d');
    const ctxQuarter = document.getElementById('salesPerQuarterChart')?.getContext('2d');
    const ctxLocation = document.getElementById('salesByLocationChart')?.getContext('2d');
    const ctxPayment = document.getElementById('salesByPaymentChart')?.getContext('2d');

    // Fungsi untuk fetch data dari file JSON
    const fetchData = async () => {
        try {
            const response = await fetch('data/data.json');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    };

    const data = await fetchData();

    // Fungsi untuk parsing nilai mata uang
    const parseCurrency = (value) => parseFloat(value.replace('$', ''));

    // Menambahkan informasi kuartal ke data
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

    // Fungsi untuk mengisi filter dengan opsi dari data
    const populateFilters = (data) => {
        const machines = [...new Set(data.map(item => item.machine))];
        const categories = [...new Set(data.map(item => item.category))];
        const months = [...new Set(data.map(item => item.month))];

        if (machineFilter) {
            machines.forEach(machine => {
                const option = document.createElement('option');
                option.value = machine;
                option.text = machine;
                machineFilter.appendChild(option);
            });
        }

        if (categoryFilter) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.text = category;
                categoryFilter.appendChild(option);
            });
        }

        if (monthFilter) {
            months.forEach((month) => {
                const option = document.createElement('option');
                option.value = month;
                option.text = new Date(0, month - 1).toLocaleString('default', { month: 'long' });
                monthFilter.appendChild(option);
            });
        }
    };
    

    populateFilters(enhancedData);

    const calculateAndDisplayTotals = (data) => {
        const totalSales = data.reduce((sum, item) => sum + parseCurrency(item.linetotal), 0);
        const totalQuantity = data.reduce((sum, item) => sum + item.rqty, 0);
        const totalProducts = new Set(data.map(item => item.product)).size;

        const totalSalesElement = document.getElementById('totalSales');
        const quantitySoldElement = document.getElementById('quantitySold');
        const totalProductElement = document.getElementById('totalProduct');

        if (totalSalesElement) {
            totalSalesElement.innerText = `$${totalSales.toFixed(2)}`;
        }
        if (quantitySoldElement) {
            quantitySoldElement.innerText = totalQuantity;
        }
        if (totalProductElement) {
            totalProductElement.innerText = totalProducts;
        }
    };

    calculateAndDisplayTotals(enhancedData);

    // Fungsi untuk memformat angka dalam satuan ribuan
    const formatThousands = (value) => {
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
        }
        return value;
    };

    // Fungsi untuk membuat line chart 
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
                        borderWidth: 2,
                        pointRadius: 0 // Clear line chart
                    },
                    {
                        label: label2,
                        data: data2,
                        borderColor: '#114266',
                        backgroundColor: '#114266',
                        borderWidth: 2,
                        pointRadius: 0 // Clear line chart
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: formatThousands // Menggunakan fungsi untuk format ribuan
                        }
                    }
                }
            }
        });
    };

    // Fungsi untuk membuat bar chart
    const createHorizontalBarChart = (ctx, labels, data1, data2, label1, label2, horizontal = false) => {
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
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: formatThousands // Menggunakan fungsi untuk format ribuan
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    // Fungsi untuk membuat bar chart
    const createVerticalBarChart = (ctx, labels, data1, data2, label1, label2, horizontal = false) => {
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
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: formatThousands // Menggunakan fungsi untuk format ribuan
                        }
                    }
                }
            }
        });
    };

    // Fungsi untuk membuat pie chart
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

    // Fungsi untuk menyiapkan data chart berdasarkan kunci tertentu
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
    const monthLabels = salesPerMonthData.labels.map(month => new Date(0, month - 1).toLocaleString('default', { month: 'short' }));
    const salesPerQuarterData = prepareChartData(enhancedData, 'quarter');
    const salesByCategoryData = prepareChartData(enhancedData, 'category');
    const salesByLocationData = prepareChartData(enhancedData, 'location');
    const salesByPaymentData = prepareChartData(enhancedData, 'type');

    // Buat chart berdasarkan context yang tersedia
    const salesPerMonthChart = ctxMonth ? createLineChart(ctxMonth, monthLabels, salesPerMonthData.totalSales, salesPerMonthData.itemSales, 'Total Sales', 'Item Sales') : null;
    const salesPerQuarterChart = ctxQuarter ? createLineChart(ctxQuarter, salesPerQuarterData.labels, salesPerQuarterData.totalSales, salesPerQuarterData.itemSales, 'Total Sales', 'Item Sales') : null;
    const salesByCategoryChart = ctxCategory ? createVerticalBarChart(ctxCategory, salesByCategoryData.labels, salesByCategoryData.totalSales, salesByCategoryData.itemSales, 'Total Sales', 'Item Sales') : null;
    const salesByLocationChart = ctxLocation ? createHorizontalBarChart(ctxLocation, salesByLocationData.labels, salesByLocationData.totalSales, salesByLocationData.itemSales, 'Total Sales', 'Item Sales', true) : null;
    const salesByPaymentChart = ctxPayment ? createPieChart(ctxPayment, salesByPaymentData.labels, salesByPaymentData.totalSales, 'Total Sales') : null;

    // Fungsi untuk menerapkan filter
    const applyFilters = () => {
        let filteredData = enhancedData;
        const machine = machineFilter.value;
        const category = categoryFilter.value;
        const month = monthFilter.value;

        if (machine) {
            filteredData = filteredData.filter(item => item.machine === machine);
        }
        if (category) {
            filteredData = filteredData.filter(item => item.category === category);
        }
        if (month) {
            filteredData = filteredData.filter(item => item.month == month);
        }

        calculateAndDisplayTotals(filteredData);

        const salesPerMonthData = prepareChartData(filteredData, 'month');
        const salesPerQuarterData = prepareChartData(filteredData, 'quarter');
        const salesByCategoryData = prepareChartData(filteredData, 'category');
        const salesByLocationData = prepareChartData(filteredData, 'location');
        const salesByPaymentData = prepareChartData(filteredData, 'type');

        if (salesPerMonthChart) {
            const monthLabels = salesPerMonthData.labels.map(month => {
                return new Date(0, month - 1).toLocaleString('default', { month: 'short' });
            });
            salesPerMonthChart.data.labels = monthLabels;
            salesPerMonthChart.data.datasets[0].data = salesPerMonthData.totalSales;
            salesPerMonthChart.data.datasets[1].data = salesPerMonthData.itemSales;
            salesPerMonthChart.update();
        }

        if (salesPerQuarterChart) {
            salesPerQuarterChart.data.labels = salesPerQuarterData.labels;
            salesPerQuarterChart.data.datasets[0].data = salesPerQuarterData.totalSales;
            salesPerQuarterChart.data.datasets[1].data = salesPerQuarterData.itemSales;
            salesPerQuarterChart.update();
        }

        if (salesByCategoryChart) {
            salesByCategoryChart.data.labels = salesByCategoryData.labels;
            salesByCategoryChart.data.datasets[0].data = salesByCategoryData.totalSales;
            salesByCategoryChart.data.datasets[1].data = salesByCategoryData.itemSales;
            salesByCategoryChart.update();
        }

        if (salesByLocationChart) {
            salesByLocationChart.data.labels = salesByLocationData.labels;
            salesByLocationChart.data.datasets[0].data = salesByLocationData.totalSales;
            salesByLocationChart.data.datasets[1].data = salesByLocationData.itemSales;
            salesByLocationChart.update();
        }

        if (salesByPaymentChart) {
            salesByPaymentChart.data.labels = salesByPaymentData.labels.map((label, index) => {
                return salesByPaymentData.percentages && salesByPaymentData.percentages[index] !== undefined ? 
                `${label} (${salesByPaymentData.percentages[index]}%)` : label;
            });
            salesByPaymentChart.data.datasets[0].data = salesByPaymentData.totalSales;
            salesByPaymentChart.update();
        }
    };

    // Fungsi untuk mereset filter
    const resetFilters = () => {
        machineFilter.selectedIndex = 0;
        categoryFilter.selectedIndex = 0;
        monthFilter.selectedIndex = 0;
        applyFilters();
    };

    // Event listener untuk filter
    if (machineFilter) {
        machineFilter.addEventListener('change', applyFilters);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (monthFilter) {
        monthFilter.addEventListener('change', applyFilters);
    }

    // Event listener untuk mereset filter jika nilai kosong dipilih
    if (machineFilter) {
        machineFilter.addEventListener('change', () => {
            if (machineFilter.value === '') resetFilters();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            if (categoryFilter.value === '') resetFilters();
        });
    }

    if (monthFilter) {
        monthFilter.addEventListener('change', () => {
            if (monthFilter.value === '') resetFilters();
        });
    }
});
