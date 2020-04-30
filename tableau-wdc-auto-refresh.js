var countdown =  $("#countdown").countdown360({
    onComplete  : function () {  
        //getCurrentViz().refreshDataAsync();

			let dataSourceFetchPromises = [];
			let dashboardDataSources = {};
			const dashboard = tableau.extensions.dashboardContent.dashboard;

			dashboard.worksheets.forEach(function (worksheet) {
					dataSourceFetchPromises.push(worksheet.getDataSourcesAsync());
			});

			Promise.all(dataSourceFetchPromises).then(function (fetchResults) {
					fetchResults.forEach(function (dataSourcesForWorksheet) {
							dataSourcesForWorksheet.forEach(function (dataSource) {
									if (!dashboardDataSources[dataSource.id]) {
											dashboardDataSources[dataSource.id] = dataSource;
											dataSource.refreshAsync();
									}
							});
					});
					countdown.start();
			});

      /*
        var target = window.parent.document.getElementById("loadingSpinner");
        if (!$(target).is(':visible')) {
            countdown.start();
        } else {
            var observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutationRecord) {
                if (!$(target).is(':visible')) {
                  observer.disconnect();
                  countdown.start();
                }
              });    
            });
            var observerConfig = {
              attributes: true, 
              attributeFilter: ['style'],
              childList: false, 
              subtree: false 
            };
            observer.observe(target, observerConfig);
        }
     */
    }
});
$('#countdown').click(function(e){
    countdown.getStatus() ? countdown.pause() : countdown.cont();
});

$('#countdown').on("mouseover", function(e) {countdown.showControls(true);});
$('#countdown').on("mouseout", function(e) {countdown.showControls(false);});

$(document).ready(function() {

  // Hook up an event handler for the load button click.
  // Wait to initialize until the button is clicked.
  $("#initializeButton").click(function() {

    // Disable the button after it's been clicked
    $("#initializeButton").prop('disabled', true);

    tableau.extensions.initializeAsync().then(function() {

      // Initialization succeeded! Get the dashboard
      var dashboard = tableau.extensions.dashboardContent.dashboard;
      initAutoRefresh();



      // Display the name of dashboard in the UI
      $("#resultBox").html("I'm running in a dashboard named <strong>" + dashboard.name + "</strong>");
    }, function(err) {

      // something went wrong in initialization
      $("#resultBox").html("Error while Initializing: " + err.toString());
    });
  });
});


/*
(function () {
	$(document).ready(function () {
		tableau.extensions.initializeAsync().then(function () {

    } function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
});
})();
*/


