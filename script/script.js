$(document).ready(function () {
  const vendingMachineData = []; // Array to store fetched data

  // Fetch JSON data
  fetch('data/data.json')
      .then(response => response.json())
      .then(data => {
          vendingMachineData.push(...data); // Add data to array

          // Initialize DataTables
          const table = $('#vendingMachineTable').DataTable({
              data: vendingMachineData.slice(0, 150), // Initial 150 rows
              columns: [
                  { data: 'status' },
                  { data: 'device_id' },
                  { data: 'location' },
                  { data: 'machine' },
                  { data: 'product' },
                  { data: 'category' },
                  { data: 'transaction' },
                  { data: 'trans_date' },
                  { data: 'month' },
                  { data: 'year' },
                  { data: 'type' },
                  { data: 'rcoil' },
                  { data: 'rprice' },
                  { data: 'rqty' },
                  { data: 'mcoil' },
                  { data: 'mprice' },
                  { data: 'mqty' },
                  { data: 'linetotal' },
                  { data: 'transtotal' },
                  { data: 'prcd_date' }
              ],
              dom: '<"top"lf>rt<"bottom"ip><"clear">', // Positioning elements
              initComplete: function () {
                  $('#search').on('keyup', function () {
                      table.search(this.value).draw();
                  });
              }
          });

          // Filter functionality
          $('#rowsToShow').on('change', function () {
              const rowsToShow = parseInt($(this).val(), 10);
              table.clear();
              table.rows.add(vendingMachineData.slice(0, rowsToShow)).draw();
          });
      });
});
