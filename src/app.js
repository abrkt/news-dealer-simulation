'use strict';

function demand(demand, good, fair, poor) {
  return {
    demand: demand,
    good: good,
    fair: fair,
    poor: poor
  };
}

var defaults = {
  cost: 33,
  price: 50,
  scrapPrice: 5,
  dailyCount: 70,
  noOfDays: 100,
  days: {
    good: .35,
    fair: .45,
    poor: .2,
    valid: function() {
      return this.good + this.fair + this.poor === 1;
    }
  },
  demands: [
    demand(40, .03, .1, .44),
    demand(50, .05, .18, .22),
    demand(60, .15, .4, .16),
    demand(70, .2, .2, .12),
    demand(80, .35, .08, .06),
    demand(90, .15, .04, 0),
    demand(100, .07, 0, 0)
  ]
}

function randomDayType(days) {
  var r = Math.random();
  if (r <= days.good) {
    return {
      v: 'good',
      r: Math.floor(r * 100) / 100
    };
  } else if (r <= (days.good + days.fair)) {
    return {
      v: 'fair',
      r: Math.floor(r * 100) / 100
    };
  } else {
    return {
      v: 'poor',
      r: Math.floor(r * 100) / 100
    };
  }
}

function randomDemand(demands, dayType) {
  var r = Math.random();
  var c = 0;
  for (var i = 0; i < demands.length; i++) {
    c += demands[i][dayType];
    if (r <= c) {
      return {
        v: demands[i].demand,
        r: Math.floor(r * 100) / 100
      };
    }
  }
}

function dayResult(i, type, demand, cost, price, scrapPrice, dailyCount) {

  return {
    i: i,
    typeRandom: type.r,
    type: type.v,
    demandRandom: demand.r,
    demand: demand.v,
    revenue: function() {
      return demand.v * price;
    },
    loss: function() {
      return demand.v > dailyCount ? (demand.v - dailyCount) * (price - cost) : 0;
    },
    salvage: function() {
      return demand.v < dailyCount ? (dailyCount - demand.v) * scrapPrice : 0;
    },
    cost: function() {
      return dailyCount * cost;
    },
    profit: function() {
      return this.revenue() + this.salvage() - this.loss() - this.cost();
    }
  }
}


var app = angular.module('NewsDealer', ['ngMaterial', "chart.js"]);
app.controller('NewsDealerContorller', function($scope, $filter) {
  $scope.labels = [];
  $scope.data = [[]];
  $scope.series = ['Profit']
  $scope.options = {
    responsive: true,
    maintainAspectRatio: true
}
  this.model = defaults;
  this.demandsF = function(day, n) {
    var total = 0;
    while (n >= 0) {
      total += this.model.demands[n--][day];
    }
    return Math.round(total * 100) / 100;
  }
  this.valid = function() {
    return this.model.days.valid() && this.model.demands.map(function(i) {
      return i.good
    }).reduce(function(a, b) {
      return a + b
    }) == 1 && this.model.demands.map(function(i) {
      return i.fair
    }).reduce(function(a, b) {
      return a + b
    }) == 1 && this.model.demands.map(function(i) {
      return i.poor
    }).reduce(function(a, b) {
      return a + b
    }) == 1
  }

  this.calculateDailyProfitFrequency = function() {
    var profits = this.results.map(function(r) {
      return r.profit();
    });
    var min = Math.ceil(Math.min.apply(null, profits) / 200) * 200 - 200;
    var max = Math.ceil(Math.max.apply(null, profits) / 200) * 200 + 200;
    $scope.labels.splice(0, $scope.labels.length);
    $scope.data[0].splice(0, $scope.data[0].length)
    this.frequencies = [];
    while (min <= max) {
      var label = $filter('number')(min / 100, 2);
      var data = profits.filter(function(p) {
        return p <= min && p > min - 200;
      }).length;
      this.frequencies.push({
        label: label,
        data: data
      })
      $scope.labels.push(label);
      $scope.data[0].push(data);
      min += 200;
    }
  };

  this.simulate = function() {
    this.results = [];
    for (var i = 1; i <= this.model.noOfDays; i++) {
      var day = randomDayType(this.model.days)
      var demand = randomDemand(this.model.demands, day.v);
      this.results.push(dayResult(i, day, demand, this.model.cost, this.model.price, this.model.scrapPrice, this.model.dailyCount));
    }
    this.calculateDailyProfitFrequency();
    this.showResults = true;
  }
});
