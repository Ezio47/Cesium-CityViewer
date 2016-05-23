'use strict';

describe('Service: CameraControl', function () {

  // load the service's module
  beforeEach(module('viewsApp'));

  // instantiate service
  var CameraControl;
  beforeEach(inject(function (_CameraControl_) {
    CameraControl = _CameraControl_;
  }));

  it('should do something', function () {
    expect(!!CameraControl).toBe(true);
  });

});
