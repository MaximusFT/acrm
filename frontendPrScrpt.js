/* jshint ignore:start */
jQuery(document).ready(function($) {

    if (!$.sessionStorage('url_local'))
        $.sessionStorage('url_local', window.location.href);
    if (!$.sessionStorage('url_referer'))
        $.sessionStorage('url_referer', document.referrer);
    var params = window.location.search.substring(1).split('&');
    $($.map(params, function(pair) {
        var temp = pair.split('=');
        if (['utm_source', 'utm_medium', 'utm_term', 'utm_content', 'utm_campaign'].indexOf(temp[0]) !== -1) {
            $.sessionStorage(temp[0], temp[1]);
        }
    }));

    $.sendUserRequest = function() {
        $.ajax({
            url: 'http://dev.mapqo.com/api/getDocumentFields',
            type: 'GET',
            dataType: 'jsonp',
            data: {
                href: window.location.protocol + '//' + window.location.host + window.location.pathname
            },
            success: function(response) {
                console.log('response getDocumentFields', response);
                var formData = [];
                $($.map(response.fields, function(id) {
                    var val = $('#' + id).attr('type') !== 'checkbox' ? $('#' + id).val() : $('#' + id).prop('checked');
                    if (val) {
                        formData.push({
                            htmlId: id,
                            value: $('#' + id).val()
                        });
                    } else {
                        if (response.form.indexOf('fc') === 0) {
                            var val = $("[name='" + id + "']").val();
                            if (val) {
                                formData.push({
                                    htmlId: id,
                                    value: val
                                });
                            }
                        } else {
                            var form = $('#' + response.form);
                            var val = $("[name='" + id + "']", form).val();
                            if (val) {
                                formData.push({
                                    htmlId: id,
                                    value: val
                                });
                            }
                        }
                    }
                }));
                //preparing data for analytics
                var analyticsData = {};
                if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
                else xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
                xmlhttp.open('GET', 'http://api.hostip.info/get_html.php', false);
                xmlhttp.send();
                hostipInfo = xmlhttp.responseText.split(':');
                analyticsData.ip = hostipInfo[hostipInfo.length - 1].trim();
                if ($.sessionStorage('url_local'))
                    analyticsData.url_local = $.sessionStorage('url_local');
                if ($.sessionStorage('url_referer'))
                    analyticsData.url_referer = $.sessionStorage('url_referer');
                analyticsData.url_form = window.location.protocol + '//' + window.location.host + window.location.pathname;
                if ($.sessionStorage('utm_source'))
                    analyticsData.utm_source = $.sessionStorage('utm_source');
                if ($.sessionStorage('utm_medium'))
                    analyticsData.utm_medium = $.sessionStorage('utm_medium');
                if ($.sessionStorage('utm_term'))
                    analyticsData.utm_term = $.sessionStorage('utm_term');
                if ($.sessionStorage('utm_content'))
                    analyticsData.utm_content = $.sessionStorage('utm_content');
                if ($.sessionStorage('utm_campaign'))
                    analyticsData.utm_campaign = $.sessionStorage('utm_campaign');
                //console.log(analyticsData);
                $.ajax({
                    type: 'POST',
                    url: 'http://dev.mapqo.com/api/sendUserRequest',
                    crossDomain: true,
                    data: {
                        formData: formData,
                        href: window.location.href,
                        analyticsData: analyticsData
                    },
                    dataType: 'json',
                    success: function(responseData) {
                        console.log(responseData);
                    },
                    error: function(responseData) {
                        console.log(responseData);
                    }
                });
            }
        });
        return false;
    }
});
/* jshint ignore:end */
