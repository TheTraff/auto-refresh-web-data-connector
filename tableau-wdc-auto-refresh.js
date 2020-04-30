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

(function () {
	$(document).ready(function () {
		tableau.extensions.initializeAsync().then(function () {
		/* body of function  */
    /* controls what the extension does */
    /* extension calls other functions here */ 

    } function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
});
/*  extension can define other functions here as needed */
})();


