'use strict'

var app = angular.module("app", ['ui.router']);

Parse.initialize("adGxf6fBJLo5yQRuHRrvXIWCEo4Qc0858i9vhyMt", "NSx581KmqhNmqov3TRmpEI6s6V5k9L3GQrbawrXd");

app.filter("reverse", function() {
    return function(items) {
        return items.slice().reverse();
    };
});

/* try to get this working */
$('input').focus( function() {
    $('.navbar-bottom-fixed').hide();
    console.log("SWAG");
});

function goBack() {
    //woopra.track("go_back");
    window.history.go(-1);
};

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
        .state("login", {
            abstract: 'true',
            url: '/',
            templateUrl: "partials/login.html"
        })
        .state("login.login", {
            url: '',
            templateUrl: "partials/login.login.html",
            controller: "UserCtrl"
        })
        .state("login.register", {
            url: 'register',
            templateUrl: "partials/login.register.html",
            controller: "UserCtrl"
        })
        .state("login.about", {
            url: 'about',
            templateUrl: "partials/login.about.html"
        })
        .state("home", {
            abstract: true,
            url: '/home',
            templateUrl: "partials/home.html",
            controller: 'UserCtrl'
        })
        .state("home.groups", {
            url: '',
            templateUrl: "partials/home.groups.html",
            controller: "GroupsCtrl"
        })
        .state("home.group", {
            url: '/:class/:owner',
            templateUrl: "partials/home.group.html",
            controller: "GroupCtrl"
        })
        .state("home.buddies", {
            url: '/buddies',
            templateUrl: "partials/home.buddies.html",
            controller: 'BuddiesCtrl'
        })
        .state("class", {
            url: '/:class',
            templateUrl: "partials/class.html",
            controller: "ClassCtrl"
        })
        .state("home.profile", {
            url: '/profile',
            templateUrl: "partials/home.profile.html",
            controller: "UserCtrl"
        })
        .state("home.add", {
            url: '/add',
            templateUrl: "partials/home.add.html"
        })
        .state("home.add.create", {
            url: '/create',
            templateUrl: "partials/home.add.create.html",
            controller: "GroupsCtrl"
        })
        .state("home.add.join", {
            url: '/join',
            templateUrl: "partials/home.add.join.html",
            controller: "GroupsCtrl"
        })
        .state("home.buddy", {
            url: '/:username',
            templateUrl: "partials/home.buddy.html",
            controller: 'BuddyCtrl'
        });
    $urlRouterProvider.otherwise("/");
});

app.config(function($locationProvider) {
    $locationProvider.html5Mode(true);
});

app.controller('ClassCtrl', function($http, $scope, $state, $stateParams) {
    $scope.class = $stateParams.class;

    $scope.buddies = [];

    $scope.temp = null;

    $scope.groups = [];

    var query = new Parse.Query("Buddies");
    query.find({
        success: function (results) {
            for (var i = 0; i < results.length; i++) {
                $scope.buddies.push(results[i].attributes);
                $scope.$apply();
            }
        },
        error: function (error) {

        }
    });

    var query1 = new Parse.Query("Groups");
    query1.find({
        success: function (results) {
            for (var i = 0; i < results.length; i++) {
                $scope.groups.push(results[i].attributes);
                $scope.$apply();
            }
        },
        error: function (error) {

        }
    });
});

app.controller('UserCtrl', function($http, $scope, $state) {

    $scope.user = Parse.User.current();

    $scope.update = function(form) {
        if(form.password === form.new) {
            var user = Parse.User.current();
            var query1 = new Parse.Query("Groups");
            query1.equalTo("owner", $scope.user.getUsername());
            query1.first({
                success: function(object) {
                    object.set("owner", form.username);
                    object.save();
                }, error: function(error) {

                }
            });

            var query2 = new Parse.Query("Buddies");
            query2.equalTo("username", $scope.user.getUsername());
            query2.first({
                success: function(object) {
                    object.set("username", form.username);
                    object.save();
                    if(form.username === $scope.user.getUsername()) {
                        object.set("group", form.username);
                        object.save();
                    }
                }, error: function(error) {

                }
            });

            user.set("username", form.username);
            user.set("password", form.password);
            user.save();
            $scope.user = user;
            $.sticky("<p>You have successfully updated your profile.</p><br/>");
            $state.go($state.current, {}, {reload: true});
        }
        else {
            $.sticky("Passwords do not match.");
        }
    };

    $scope.deleteAccount = function() {
        if(confirm("Are you sure you want to delete your account?")) {
            var query1 = new Parse.Query('User');
            query1.equalTo("username", $scope.user.getUsername());
            query1.first({
                success: function(object) {
                    object.destroy();
                },
                error: function() {
                    alert("Could not delete account");
                }
            });

            var query2 = new Parse.Query('Buddies');
            query2.equalTo("username", $scope.user.getUsername());
            query2.first({
                success: function(object) {
                    object.destroy();
                    $state.go('login.login');
                },
                error: function() {
                    alert("Could not delete account");
                }
            });
        }
    }

    $scope.logIn = function(form) {
        Parse.User.logIn(form.username, form.password, {
            success: function(user) {
                $scope.user = user;
                $scope.$apply();
                $state.go("home.groups");
            },
            error: function(user, error) {
                $.sticky("<p>username/password incorrect.</p><br/>");
            }
        });
    };

    $scope.signUp = function(form) {
        if(form.password === form.retype) {
            var user = new Parse.User();
            var buddy = new Parse.Object("Buddies");
            user.set("username", form.username);
            user.set("password", form.password);
            user.set("email", form.email);
            buddy.set("username", form.username);
            buddy.set("buddy", 0);

            user.signUp(null, {
                success: function (user) {
                    $scope.user = user;
                    $scope.$apply();
                    buddy.save();
                    $.sticky("<p>You have successfully registered!</p><br/>");
                    $state.go("login.login");
                },
                error: function (user, error) {
                    alert("Unable to sign up:  " + error.code + " " + error.message);
                }
            });
        }
        else {
            $.sticky("<p>Passwords do not match. Please try again.</p><br/>");
        }
    };

    $scope.logOut = function(form) {
        if(confirm("Are you sure you want to log out?") == true) {
            Parse.User.logOut();
            $scope.user = null;
            $state.go("login.login");
            $.sticky("<p>You logged out.</p><br/>");
        }
    };
});

app.controller('GroupsCtrl', function($scope, $http, $state) {

    $scope.user = Parse.User.current();

    $scope.groups = [];

    var query = new Parse.Query("Groups");
    query.find({
        success: function(results) {
            for(var i = 0; i < results.length; i++) {
                $scope.groups.push(results[i].attributes);
                $scope.$apply();
            }
        },
        error: function(error) {

        }
    });

    $scope.addGroup = function(data) {
        if (confirm("Warning: Adding a new group will result in deleting" +
            " the group you are currently hosting. Do you wish to continue?")) {
            var query = new Parse.Query('Groups');
            query.equalTo("owner", $scope.user.getUsername());
            query.first({
                success: function (object) {
                    if (typeof object !== "undefined") {
                        object.destroy({
                            success: function () {

                            },
                            error: function () {

                            }
                        });
                    }
                },
                error: function () {

                }
            });

            var query2 = new Parse.Query('Groups');
            query2.equalTo("current", 1);
            query2.first({
                success: function(object) {
                    object.set("current", 0);
                    object.save();
                },
                error: function() {

                }
            });

            var query3 = new Parse.Query("Buddies");
            query3.equalTo("username", $scope.user.getUsername());
            query3.first({
                success: function (object) {
                    object.set("group", $scope.user.getUsername());
                    object.set("class", data.class);
                    object.save();
                },
                error: function (error) {

                }
            });

            var group = new Parse.Object("Groups");
            group.set("owner", $scope.user.getUsername());
            group.set("class", data.class);
            group.set("current", 1);
            group.set("in", 1);
            group.set("members", 1);
            group.set("member_limit", data.member_limit);
            group.set("location", data.location);
            group.set("description", data.description);
            group.set("date", data.date);
            group.set("start_time", data.start_time);
            group.set("end_time", data.end_time);
            group.save(null, {
                success: function () {
                    $.sticky("<p>You created a new group.</p><br/>");
                    $state.go("home.groups");
                },
                error: function () {

                }
            });
        };
    };
});

app.controller('GroupCtrl', function($scope, $http, $state, $stateParams) {

    $scope.user = Parse.User.current();

    $scope.class = $stateParams.class;
    $scope.owner = $stateParams.owner;

    $scope.groups = [];
    $scope.group = null;

    var query = new Parse.Query("Groups");
    query.find({
        success: function(results) {
            for(var i = 0; i < results.length; i++) {
                $scope.groups.push(results[i].attributes);
            }
            $scope.group = getGroup($scope.groups, $scope.class, $scope.owner);
            $scope.$apply();
        },
        error: function(error) {

        }
    });

    function getGroup(data, subject, owner) {
        for(var i = 0; i < data.length; i += 1) {
            if(data[i].class === subject && data[i].owner === owner) {
                return data[i];
            }
        }
        return 0;
    }

    $scope.setCurrent = function(owner) {
        var query1 = new Parse.Query("Groups");
        query1.equalTo("current", 1);
        query1.first({
            success: function (object) {
                object.set("current", 0);
                object.set("members", object.attributes.members - 1);
                object.save();
            },
            error: function (error) {

            }
        });

        var query2 = new Parse.Query("Groups");
        query2.equalTo("owner", owner.owner);
        query2.first({
            success: function (object) {
                object.set("members", object.attributes.members + 1);
                object.set("current", 1);
                object.save();
            },
            error: function (error) {

            }
        });

        var query3 = new Parse.Query("Buddies");
        query3.equalTo("username", $scope.user.getUsername());
        query3.first({
            success: function (object) {
                object.set("group", owner.owner);
                object.set("class", $scope.class);
                object.save();
                $.sticky("<p>You set this group as your current study group</p><br/>");
                $state.go($state.current, {}, {reload: true});
            },
            error: function (error) {

            }
        });
    };

    $scope.leaveCurrent = function(owner) {
        var query1 = new Parse.Query("Groups");
        query1.equalTo("current", 1);
        query1.first({
            success: function (object) {
                object.set("current", 0);
                object.set("members", object.attributes.members - 1);
                object.save();
            },
            error: function (error) {

            }
        });

        var query2 = new Parse.Query("Buddies");
        query2.equalTo("username", $scope.user.getUsername());
        query2.first({
            success: function (object) {
                object.set("class", "");
                object.set("group", "");
                object.save();
                $.sticky("<p>You left the group.</p><br/>");
                $state.go($state.current, {}, {reload: true});
            },
            error: function (error) {

            }
        });
    };

    $scope.addGroup = function(owner) {
        var query1 = new Parse.Query("Groups");
        query1.equalTo("owner", owner.owner);
        query1.first({
            success: function (object) {
                object.set("in", 1);
                object.save();
                $.sticky("<p>Group added.</p><br/>");
                $state.go($state.current, {}, {reload: true});
            },
            error: function (error) {

            }
        });

    };

    $scope.removeGroup = function(owner) {
        var query1 = new Parse.Query("Groups");

        if(confirm("Are you sure you want to remove this group?")) {
            query1.equalTo("owner", owner.owner);
            query1.first({
                success: function (object) {
                    object.set("in", 0);
                    object.save();
                    $.sticky("<p>You removed this group.</p><br/>");
                    $state.go($state.current, {}, {reload: true});
                },
                error: function (error) {

                }
            });
        }
    };

    $scope.deleteGroup = function(owner) {
        if(confirm("Are you sure you want to delete this group permanently?")) {
            var query = new Parse.Query("Groups");
            query.equalTo("owner", owner.owner);
            query.first({
                success: function (object) {
                    object.destroy();
                    object.save();
                },
                error: function (error) {

                }
            });

            var query2 = new Parse.Query("Buddies");
            query2.equalTo("username", $scope.user.getUsername());
            query2.first({
                success: function (object) {
                    object.set("class", "");
                    object.set("group", "");
                    object.save();
                    $state.go($state.current, {}, {reload: true});
                    $state.go("home.groups");
                    $.sticky("<p>Your group has been deleted.</p><br/>");
                },
                error: function (error) {

                }
            });
        }
    }

    $scope.editGroup = function(data) {
        var query = new Parse.Query("Groups");
        query.equalTo("owner", $scope.user.getUsername());
        query.first({
            success: function(group) {
                group.set("class", data.class);
                group.set("member_limit", data.member_limit);
                group.set("location", data.location);
                group.set("description", data.description);
                group.set("date", data.date);
                group.set("start_time", data.start_time);
                group.set("end_time", data.end_time);
                group.save(null, {
                    success: function () {
                        $.sticky("<p>You have successfully updated the groups</p><br/>");
                        $state.go("home.groups");
                    },
                    error: function () {

                    }
                });
            }, error: function(error) {

            }
        });

    };
});

app.controller('BuddiesCtrl', function($http, $scope) {

    $scope.buddies = [];

    var query = new Parse.Query("Buddies");
    query.find({
        success: function(results) {
            for(var i = 0; i < results.length; i++) {
                $scope.buddies.push(results[i].attributes);
                $scope.$apply();
            }
        },
        error: function(error) {

        }
    });
});

app.controller('BuddyCtrl', function($http, $scope, $state, $stateParams) {

    $scope.user = Parse.User.current();

    $scope.name = $stateParams.username;

    $scope.buddies = [];
    $scope.buddy = null;

    var query = new Parse.Query("Buddies");
    query.find({
        success: function(results) {
            for(var i = 0; i < results.length; i++) {
                $scope.buddies.push(results[i].attributes);

            }
            $scope.buddy = getByUsername($scope.buddies, $scope.name);
            $scope.$apply();
        },
        error: function(error) {

        }
    });

    function getByUsername(data, name) {
        for(var i = 0; i < data.length; i += 1) {
            if(data[i].username === name) {
                return data[i];
            }
        }
        return 0;
    }

    $scope.addBuddy = function(buddy) {
        var query = new Parse.Query("Buddies");
        query.equalTo("username", buddy.buddy);
        query.first({
            success: function(object) {
                object.set("buddy", 1);
                object.save();
                $.sticky("<p>You added this buddy.</p><br/>");
                $state.go($state.current, {}, {reload: true});
            },
            error: function(error) {

            }
        });

    }

    $scope.removeBuddy = function(buddy) {
        var query = new Parse.Query("Buddies");
        query.equalTo("username", buddy.buddy);
        query.first({
            success: function(object) {
                object.set("buddy", 0);
                object.save();
                $.sticky("<p>You removed this buddy.</p><br/>");
                $state.go($state.current, {}, {reload: true});
            },
            error: function(error) {

            }
        });
    }
});

app.filter('unique', function () {

    return function (items, filterOn) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var hashCheck = {}, newItems = [];

            var extractValueToCompare = function (item) {
                if (angular.isObject(item) && angular.isString(filterOn)) {
                    return item[filterOn];
                } else {
                    return item;
                }
            };

            angular.forEach(items, function (item) {
                var valueToCheck, isDuplicate = false;

                for (var i = 0; i < newItems.length; i++) {
                    if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    newItems.push(item);
                }

            });
            items = newItems;
        }
        return items;
    };
});