var countdown =  $("#countdown").countdown360({
    onComplete  : function () {  
      //getCurrentViz().refreshDataAsync();

		  let dataSourceFetchPromises = [];
      let dataRefreshPromises = [];

      // Maps dataSource id to dataSource so we can keep track of unique dataSources.
      let dashboardDataSources = {};

      // To get dataSource info, first get the dashboard.
      const dashboard = tableau.extensions.dashboardContent.dashboard;

      // Then loop through each worksheet and get its dataSources, save promise for later.
      dashboard.worksheets.forEach(function (worksheet) {
        dataSourceFetchPromises.push(worksheet.getDataSourcesAsync());
      });

      Promise.all(dataSourceFetchPromises).then(function (fetchResults) {
        fetchResults.forEach(function (dataSourcesForWorksheet) {
          dataSourcesForWorksheet.forEach(function (dataSource) {
            if (!dashboardDataSources[dataSource.id]) { // We've already seen it, skip it.
              console.log("Found data source: " + dataSource.id);
              dashboardDataSources[dataSource.id] = dataSource;
              console.log("calling refresh async and adding promise to list");
              dataRefreshPromises.push(dataSource.refreshAsync());
            }
          });
        });
        console.log("The length of dataSourceFetchPromises is " + dataSourceFetchPromises.length + " and the length of dataRefreshPromises is " + dataRefreshPromises.length);

        Promise.all(dataRefreshPromises).then(fetchResults => {
          console.log("executing code after all data sources have refreshed...");
          console.log("starting countdown...");
          countdown.start();
        });

      });
    }

      /*
      Promise.all(dataRefreshPromises).then(fetchResults => {
        console.log("Now doing stuff after the dataRefreshPromises have been fulfilled...");
        var target = $("#loading");
        if (!$(target).is(':visible')) {
          console.log("starting the countdown... (because the loading indicator is not visible)");
          countdown.start();
        } else {
          var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutationRecord) {
              if (!$(target).is(':visible')) {
                observer.disconnect();
                console.log("starting countdown... (in the mutation observer)");
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
          console.log("starting loading icon observer...");
          observer.observe(target, observerConfig);
        }

        console.log("refreshed all data sources");
        countdown.start();
      });
      */
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


