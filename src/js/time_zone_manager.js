(function($) {

    var TimeZoneManager = {
        fetchTimeZones : function(completion) {
            $.ajax({
                url     : "http://localhost:3000/clock/time_zones",
                headers : { Accept: "application/json" },
                success : function(data) {
                    completion(data);
                }
            });
        }
    };

    $.app.register("managers.TimeZoneManager", TimeZoneManager);

})(jQuery);

