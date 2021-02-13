// ==UserScript==
// @name         Hide UI
// @namespace    http://tampermonkey.net/
// @version      1.0.0.0
// @description  Hides/shows all elements of the UI
// @author       Krzysztof Kruk
// @match        https://*.eyewire.org/*
// @exclude      https://*.eyewire.org/1.0/*
// @downloadURL  https://raw.githubusercontent.com/ChrisRaven/EyeWire-HideUI/main/hideui.user.js
// ==/UserScript==

/*jshint esversion: 6 */
/*globals $, account, tomni */

var LOCAL = false;
if (LOCAL) {
  console.log('%c--== TURN OFF "LOCAL" BEFORE RELEASING!!! ==--', "color: red; font-style: italic; font-weight: bold;");
}


(function() {
  'use strict';
  'esversion: 6';

  var K = {
    gid: function (id) {
      return document.getElementById(id);
    },

    qS: function (sel) {
      return document.querySelector(sel);
    },

    qSa: function (sel) {
      return document.querySelectorAll(sel);
    },


    addCSSFile: function (path) {
      $("head").append('<link href="' + path + '" rel="stylesheet" type="text/css">');
    },


    // localStorage
    ls: {
      get: function (key) {
        return localStorage.getItem(account.account.uid + '-ews-' + key);
      },

      set: function (key, val) {
        localStorage.setItem(account.account.uid + '-ews-' + key, val);
      },

      remove: function (key) {
        localStorage.removeItem(account.account.uid + '-ews-' + key);
      }
    }
  };


  function main() {
    if (LOCAL) {
      K.addCSSFile('http://127.0.0.1:8887/styles.css');
    }
    else {
      K.addCSSFile('https://chrisraven.github.io/EyeWire-HideUI/styles.css?v=1');
    }


    if (account.can('scout scythe mystic admin')) {
      hideUI();
    }
  }

  let intv = setInterval(function () {
    if (typeof account === 'undefined' || !account.account.uid) {
      return;
    }

    clearInterval(intv);
    main();
  }, 100);

  let states = {
    topBar: false,
    chat: false,
    celSelector: false,
    leaderboard: false,
    bottomBar: false,
    scoutsLog: false,
    cubes: false
  }

  function readSettings() {
    let settings = K.ls.get('hideui');

    if (!settings) {
      return;
    }

    states = JSON.parse(settings);

    
    K.gid('hideui-top-bar').checked = states.topBar;
    K.gid('hideui-chat').checked = states.chat;
    K.gid('hideui-cell-selector').checked = states.celSelector;
    K.gid('hideui-leaderboard').checked = states.leaderBoard;
    K.gid('hideui-bottom-bar').checked = states.bottomBar;
    K.gid('hideui-cubes').checked = states.cubes;

    changeTopBar(states.topBar);
    changeChat(states.chat);
    changeCellSelector(states.celSelector);
    changeLeaderboard(states.leaderboard);
    changeBottomBar(states.bottomBar);
    changeCubes(states.cubes);

    let waitForSL = setInterval(function () {
      let sl = K.gid('scoutsLogFloatingControls');

      if (sl) {
        clearInterval(waitForSL);
        K.gid('hideui-scoutslog').checked = states.scoutsLog;
        changeScoutsLog(states.scoutsLog);
        checkAllIfAllChecked();
      }
    }, 100);

    let waitforLeaderboard = setInterval(function () {
      let leaderboard = K.gid('ovlbContainer');

      if (leaderboard) {
        clearInterval(waitforLeaderboard);
        changeLeaderboard(states.scoutsLog);
        checkAllIfAllChecked();
      }
    }, 100);

    let accuracyContainerCounter = 100; // if someone doesn't use my version of the Accuracy History
    let waitForAccuracyContainer = setInterval(function () {
      let accuracyContainer = K.gid('accuracy-container');

      if (!--accuracyContainerCounter) {
        clearInterval(waitForAccuracyContainer);
      }

      if (accuracyContainer) {
        clearInterval(waitForAccuracyContainer);
        changeTopBar(states.topBar);
        checkAllIfAllChecked();
      }
    }, 100);

    let cubesCounter = 100; // if someone doesn't use Cubes
    let waitForCubes = setInterval(function () {
      let cubes = K.gid('ews-cubes-panel');

      if (!--cubesCounter) {
        clearInterval(waitForCubes);
      }

      if (cubes) {
        clearInterval(waitForCubes);
        changeCubes(states.cubes);
        checkAllIfAllChecked();
      }
    }, 100);


  }

  function saveSettings() {
    K.ls.set('hideui', JSON.stringify(states));
  }


  function hideUI() {
    createPanel();
    readSettings();

    $(document).on('keypress', function (e) {
      if (e.key == '.') {
        changeOptionsPanelVisibility();
      }
    });

    K.gid('hideui-top-bar').addEventListener('change', function () {
      changeTopBar(this.checked);
      saveSettings();
    });

    K.gid('hideui-chat').addEventListener('change', function () {
      changeChat(this.checked);
    });

    K.gid('hideui-cell-selector').addEventListener('change', function () {
      changeCellSelector(this.checked);
    });

    K.gid('hideui-leaderboard').addEventListener('change', function () {
      changeLeaderboard(this.checked);
    });

    K.gid('hideui-bottom-bar').addEventListener('change', function () {
      changeBottomBar(this.checked);
    });

    K.gid('hideui-scoutslog').addEventListener('change', function () {
      changeScoutsLog(this.checked);
    });

    K.gid('hideui-cubes').addEventListener('change', function () {
      changeCubes(this.checked);
    });

    K.gid('hideui-all').addEventListener('change', function () {
      // state stored in a variable, because the bottom function modify it during checking if all checked
      // and it lead to a situation, where only the changeTopBar() function was run with "true"
      let state = this.checked;

      K.gid('hideui-top-bar').checked = state;
      K.gid('hideui-chat').checked = state;
      K.gid('hideui-cell-selector').checked = state;
      K.gid('hideui-leaderboard').checked = state;
      K.gid('hideui-bottom-bar').checked = state;
      K.gid('hideui-scoutslog').checked = state;
      K.gid('hideui-cubes').checked = state;

      changeTopBar(state);
      changeChat(state);
      changeCellSelector(state);
      changeLeaderboard(state);
      changeBottomBar(state);
      changeScoutsLog(state);
      changeCubes(state);
    });
  }

    function createPanel() {
    $('body').append(`<div id=hideui-options-panel>
      <label><input type=checkbox id=hideui-top-bar> hide top bar</label><br>
      <label><input type=checkbox id=hideui-chat> hide chat</label><br>
      <label><input type=checkbox id=hideui-cell-selector> hide cell selector</label><br>
      <label><input type=checkbox id=hideui-leaderboard> hide leaderboard</label><br>
      <label><input type=checkbox id=hideui-bottom-bar> hide bottom bar</label><br>
      <label><input type=checkbox id=hideui-scoutslog> hide Scouts' Log Controls</label></br>
      <label><input type=checkbox id=hideui-cubes> hide Cubes (if installed)</label><br>
      <br>
      <label><input type=checkbox id=hideui-all> hide all</label><br>
    </div>`);
  }

  function changeTopBar(state) {
    K.gid('pageHeader').style.display = state ? 'none' : 'flex';

    let accuracyBar = K.gid('accuracy-container');

    if (accuracyBar) {
      accuracyBar.style.display = state ? 'none' : 'block';
    }

    states.topBar = state;

    checkAllIfAllChecked();
    saveSettings();
  }

  function changeChat(state) {
    K.gid('chatContainer').style.display = state ? 'none' : 'block';

    states.chat = state;

    checkAllIfAllChecked();
    saveSettings();
  }

  function changeCellSelector(state) {
    K.gid('overviewCell').style.visibility = state ? 'hidden' : 'visible';
    K.gid('specialBar').style.visibility = state ? 'hidden' : 'visible';

    states.celSelector = state;

    checkAllIfAllChecked();
    saveSettings();
  }

  function changeLeaderboard(state) {
    K.gid('recall-leaderboard').style.display = state ? 'none' : 'block';
    K.gid('ovlbContainer').style.visibility = state ? 'hidden' : 'visible';

    states.leaderboard = state;

    checkAllIfAllChecked();
    saveSettings();
  }

  function changeBottomBar(state) {
    K.qS('.gameBar').style.display = state ? 'none' : 'block';
    K.gid('gameControls').style.visibility = state ? 'hidden' : 'visible';
    K.gid('cubeInspector').style.visibility = state ? 'hidden' : 'visible';

    states.bottomBar = state;

    checkAllIfAllChecked();
    saveSettings();
  }

  function changeScoutsLog(state) {
    K.gid('scoutsLogFloatingControls').style.display = state ? 'none' : 'block';

    states.scoutsLog = state;

    checkAllIfAllChecked();
    saveSettings();
  }

  function changeCubes(state) {
    let cubesPanel = K.gid('ews-cubes-panel');

    if (cubesPanel) {
      cubesPanel.style.display = state ? 'none' : 'block';
    }

    states.cubes = state;

    checkAllIfAllChecked();
    saveSettings();
  }

  function checkAllIfAllChecked() {
    for (const prop in states) {
      if (!states[prop]) {
        K.gid('hideui-all').checked = false;
        return;
      }
    }

    K.gid('hideui-all').checked = true;
  }


  let optionsPanelVisibility = false;
  function changeOptionsPanelVisibility() {
    let optionsPanel = K.gid('hideui-options-panel');

    if (optionsPanelVisibility) {
      optionsPanel.style.display = 'none';
    }
    else {
      optionsPanel.style.display = 'block';
    }

    optionsPanelVisibility = !optionsPanelVisibility;
  }


})();
