var countdown =  $("#countdown").countdown360({
    onComplete  : function () {  
        getCurrentViz().refreshDataAsync();
        
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
    }
});
$('#countdown').click(function(e){
    countdown.getStatus() ? countdown.pause() : countdown.cont();
});

$('#countdown').on("mouseover", function(e) {countdown.showControls(true);});
$('#countdown').on("mouseout", function(e) {countdown.showControls(false);});

$(document).ready(function() { 
  tableau.extensions.initializeAsync().then(function () {
    appApi.initAutoRefresh();
  } 
 )});
