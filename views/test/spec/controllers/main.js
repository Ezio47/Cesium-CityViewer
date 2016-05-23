'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('viewsApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('render cesium main viewer', function () {
    expect(MainCtrl.proxyUrl).toBe('http://localhost:3000/proxy/?url=');
    expect()
  });
});
