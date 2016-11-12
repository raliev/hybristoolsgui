chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('guieditor.html', {
    'outerBounds': {
      'width': 800,
      'height': 600
    },
    state: 'maximized'
  });
});
