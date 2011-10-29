---
---
;{% include js/jquery-1.6.4.min.js %}
;{% include js/underscore.js %}
;

(function(context) {

var longneck = {};

longneck.githubWatcherProject = function(resp) {
    var watcherProject = $('.follower-project');
    var i = 0;
    var max = 4; // Make a maximum of five requests before giving up.
    var shuffled = _(resp).shuffle();

    var getProjects = function(u) {
        $.ajax({
            url: 'https://api.github.com/users/' + u.login + '/repos',
            dataType: 'json',
            success: function(resp) {
                var repo = _(resp)
                    .chain()
                    .shuffle()
                    .detect(function(r) { return r.language === '{{site.github_lanaguage}}' })
                    .value();

                if (!repo) {
                    getProjects(shuffled[i++]);
                } else {
                    var template =
                        "<a target='_blank' href='<%=html_url%>'>"
                        + "<span class='thumb' style='background-image:url(<%=owner.avatar_url%>)'></span>"
                        + "</a>"
                        + "<a target='_blank' href='<%=html_url%>'>"
                        + "<span class='title'><%=owner.login%></span>"
                        + "</a>"
                        + "<span class='title'><%=name%></span>"
                        + "<span class='title'><%=description%></span>"
                        + "";
                    var t = _(template).template(repo);
                    watcherProject.html(t).addClass('loaded');
                }

            }
        });
    };
    getProjects(shuffled[i]);
};

longneck.githubWatchers = function() {
    var watchers = $('.followers');
    $.ajax({
        // TODO: this endpoint only returns maximum 30 users. Implement random
        // pagination so we see different groups of people.
        url: 'https://api.github.com/repos/{{site.github_login}}/{{site.github_repo}}/watchers',
        dataType: 'json',
        success: function(resp) {
            if (!resp.length) return;
            longneck.githubWatcherProject(resp);
            var template =
                "<a class='github-user' target='_blank' href='http://github.com/<%=login%>'>"
                + "<span style='background-image:url(<%=avatar_url%>)' class='thumb' /></span>"
                + "</a>";
            var t = _(resp)
                .map(function(i) { return _(template).template(i); })
                .join('');
            watchers.html(t);
        }
    });
};
$(longneck.githubWatchers);


longneck.setup = function() {
    var tweets = $('.tweets');

    $.ajax({
        url: 'http://search.twitter.com/search.json',
        data: { q: '{{site.hashtag}}', rpp:100 },
        dataType: 'jsonp',
        success: function(resp) {
            if (!resp.results.length) return;
            var template =
                "<a target='_blank' href='http://twitter.com/<%=from_user%>/status/<%=id_str%>' class='tweet'>"
                + "<span class='thumb' style='background-image:url(<%=profile_image_url%>)'></span>"
                + "<span class='popup'>"
                + "<span class='title'>@<%=from_user%></span>"
                + "<small><%=text%></small>"
                + "</span>"
                + "<span class='caret'></span>"
                + "</a>";
            var t = _(resp.results.slice(0,30))
                .map(function(i) { return _(template).template(i); })
                .join('');
            tweets.html(t).addClass('loaded');
        }
    });
}
$(longneck.setup);

context.longneck = longneck;
})(window);
