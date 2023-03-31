var tarteaucitron = (function () {
  var scripts = document.getElementsByTagName("script"),
    path = scripts[scripts.length - 1].src.split("?")[0],
   /* ?? tarteaucitronForceCDN =
      tarteaucitronForceCDN === undefined ? "" : tarteaucitronForceCDN,*/
   /* cdn =
      tarteaucitronForceCDN === ""
        ? path.split("/").slice(0, -1).join("/") + "/"
        : tarteaucitronForceCDN,*/
    /*alreadyLaunch = alreadyLaunch === undefined ? 0 : alreadyLaunch,*/
    /*tarteaucitronForceLanguage =
      tarteaucitronForceLanguage === undefined
        ? ""
        : tarteaucitronForceLanguage,*/
    tarteaucitronForceExpire = "",
    tarteaucitronCustomText = "",
    // tarteaucitronExpireInDay: true for day(s) value - false for hour(s) value
    tarteaucitronExpireInDay =  true,
    timeExpire = 31536000000,
    tarteaucitronProLoadServices,
    tarteaucitronNoAdBlocker = false;

  let t = {
    version: 20230203,
    cdn: path.split("/").slice(0, -1).join("/") + "/",
    user: {},
    lang: {},
    services: {},
    added: [],
    idprocessed: [],
    state: [],
    launch: [],
    parameters: {},
    isAjax: false,
    reloadThePage: false,
    availableLanguages:  "ar,bg,ca,cn,cs,da,de,et,el,en,es,fi,fr,hu,it,ja,lt,lv,nl,no,oc,pl,pt,ro,ru,se,sk,sv,tr,uk,vi,zh",
    defaultLanguage: "en",
    tarteaucitronForceLanguage: '',
    alreadyLaunch: false,

    events: {
      init: function () {},
      load: function () {},
    },
    eventListeners: [
        "load","scroll","keydown","hashchange", "resize",
    ],
    init: function (params) {
      "use strict";
      var origOpen;

      t.parameters = params;
      if ( !t.alreadyLaunch ) {
        t.alreadyLaunch = true;
        if (window.addEventListener) {
            for ( let i in t.eventListeners) {                      
                window.addEventListener(
                    t.eventListeners[i],
                    function (evt) {
                      t.initEvents[t.eventListeners[i]+'Event'](false, evt);
                    },
                    false
                  );
            }                
        } else {  
            for ( let i in t.eventListeners) {
                window.attachEvent("on"+t.eventListeners[i], function (evt) {
                    t.initEvents[t.eventListeners[i]+'Event'](true, evt);
                });
            }   
        }    

        if (typeof XMLHttpRequest !== "undefined") {
          origOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function () {
            if (window.addEventListener) {
              this.addEventListener(
                "load",
                function () {
                  if (typeof tarteaucitronProLoadServices === "function") {
                    tarteaucitronProLoadServices();
                  }
                },
                false
              );
            } else if (typeof this.attachEvent !== "undefined") {
              this.attachEvent("onload", function () {
                if (typeof tarteaucitronProLoadServices === "function") {
                  tarteaucitronProLoadServices();
                }
              });
            } else {
              if (typeof tarteaucitronProLoadServices === "function") {
                setTimeout(tarteaucitronProLoadServices, 1000);
              }
            }

            try {
              origOpen.apply(this, arguments);
            } catch (err) {}
          };
        }
      }

      if (t.events.init) {
        t.events.init();
      }
    },
    initEvents: {
      loadEvent: function (isOldBrowser) {
        t.load();
        t.fallback(
          ["tarteaucitronOpenPanel"],
          function (elem) {
            if (isOldBrowser) {
              elem.attachEvent("onclick", function (event) {
                t.userInterface.openPanel();
                event.preventDefault();
              });
            } else {
              elem.addEventListener(
                "click",
                function (event) {
                  t.userInterface.openPanel();
                  event.preventDefault();
                },
                false
              );
            }
          },
          true
        );
      },
      keydownEvent: function (isOldBrowser, evt) {
        if (evt.keyCode === 27) {
          t.userInterface.closePanel();
        }

        if (isOldBrowser) {
          if (evt.keyCode === 9 && focusableEls.indexOf(evt.target) >= 0) {
            if (evt.shiftKey) {
              /* shift + tab */ if (
                document.activeElement === firstFocusableEl
              ) {
                lastFocusableEl.focus();
                evt.preventDefault();
              }
            } /* tab */ else {
              if (document.activeElement === lastFocusableEl) {
                firstFocusableEl.focus();
                evt.preventDefault();
              }
            }
          }
        }
      },
      hashchangeEvent: function () {
        if (
          document.location.hash === t.hashtag &&
          t.hashtag !== ""
        ) {
          t.userInterface.openPanel();
        }
      },
      resizeEvent: function () {
        var tacElem = document.getElementById("tarteaucitron");
        var tacCookieContainer = document.getElementById(
          "tarteaucitronCookiesListContainer"
        );

        if (tacElem && tacElem.style.display === "block") {
          t.userInterface.jsSizing("main");
        }

        if (
          tacCookieContainer &&
          tacCookieContainer.style.display === "block"
        ) {
          t.userInterface.jsSizing("cookie");
        }
      },
      scrollEvent: function () {
        var scrollPos =
          window.pageYOffset || document.documentElement.scrollTop;
        var heightPosition;
        var tacPercentage = document.getElementById("tarteaucitronPercentage");
        var tacAlertBig = document.getElementById("tarteaucitronAlertBig");

        if (tacAlertBig && !t.highPrivacy) {
          if (tacAlertBig.style.display === "block") {
            heightPosition = tacAlertBig.offsetHeight + "px";

            if (scrollPos > screen.height * 2) {
              t.userInterface.respondAll(true);
            } else if (scrollPos > screen.height / 2) {
              document.getElementById(
                "tarteaucitronDisclaimerAlert"
              ).innerHTML =
                "<strong>" +
                t.lang.alertBigScroll +
                "</strong> " +
                t.lang.alertBig;
            }

            if (tacPercentage) {
              if (t.orientation === "top") {
                tacPercentage.style.top = heightPosition;
              } else {
                tacPercentage.style.bottom = heightPosition;
              }
              tacPercentage.style.width =
                (100 / (screen.height * 2)) * scrollPos + "%";
            }
          }
        }
      },
    },
    load: function () {
      "use strict";
      var cdn = t.cdn,
        language = t.getLanguage(),
        useJSDelivrMinifiedJS = cdn.indexOf("cdn.jsdelivr.net") >= 0,
        pathToLang =
          cdn +
          "lang/t." +
          language +
          (useJSDelivrMinifiedJS ? ".min" : "") +
          ".js?v=" +
          t.version,
        pathToServices =
          cdn +
          "t.services" +
          (useJSDelivrMinifiedJS ? ".min" : "") +
          ".js?v=" +
          t.version,
        linkElement = document.createElement("link"),
        defaults = {
          adblocker: false,
          hashtag: "#tarteaucitron",
          cookieName: "tarteaucitron",
          highPrivacy: true,
          orientation: "middle",
          bodyPosition: "bottom",
          removeCredit: false,
          showAlertSmall: false,
          showIcon: true,
          iconPosition: "BottomRight",
          cookieslist: false,
          handleBrowserDNTRequest: false,
          DenyAllCta: true,
          AcceptAllCta: true,
          moreInfoLink: true,
          privacyUrl: "",
          useExternalCss: false,
          useExternalJs: false,
          mandatory: true,
          mandatoryCta: true,
          closePopup: false,
          groupServices: false,
          serviceDefaultState: "wait",
        },
        params = t.parameters;

      // Don't show the middle bar if we are on the privacy policy or more page
      if (
        ((t.parameters.readmoreLink !== undefined &&
          window.location.href == t.parameters.readmoreLink) ||
          window.location.href == t.parameters.privacyUrl) &&
        t.parameters.orientation == "middle"
      ) {
        t.parameters.orientation = "bottom";
      }

      // Step -1
      if (typeof tarteaucitronCustomPremium !== "undefined") {
        tarteaucitronCustomPremium();
      }

      // Step 0: get params
      if (params !== undefined) {
        for (var k in defaults) {
          if (!t.parameters.hasOwnProperty(k)) {
            t.parameters[k] = defaults[k];
          }
        }
      }

      // global
      t.orientation = t.parameters.orientation;
      t.hashtag = t.parameters.hashtag;
      t.highPrivacy = t.parameters.highPrivacy;
      t.handleBrowserDNTRequest =
        t.parameters.handleBrowserDNTRequest;
      t.customCloserId = t.parameters.customCloserId;

      // Step 1: load css
      if (!t.parameters.useExternalCss) {
        linkElement.rel = "stylesheet";
        linkElement.type = "text/css";
        linkElement.href =
          cdn +
          "css/tarteaucitron" +
          (useJSDelivrMinifiedJS ? ".min" : "") +
          ".css?v=" +
          t.version;
        document.getElementsByTagName("head")[0].appendChild(linkElement);
      }
      // Step 2: load language and services
      t.addInternalScript(pathToLang, "", function () {
        if (tarteaucitronCustomText !== "") {
          t.lang = t.AddOrUpdate(
            t.lang,
            tarteaucitronCustomText
          );
        }
        t.addInternalScript(pathToServices, "", function () {
          // css for the middle bar TODO: add it on the css file
          if (t.orientation === "middle") {
            var customThemeMiddle = document.createElement("style"),
              cssRuleMiddle =
                "div#tarteaucitronRoot.tarteaucitronBeforeVisible:before {content: '';position: fixed;width: 100%;height: 100%;background: white;top: 0;left: 0;z-index: 999;opacity: 0.5;}div#tarteaucitronAlertBig:before {content: '" +
                t.lang.middleBarHead +
                "';font-size: 35px;}body #tarteaucitronRoot div#tarteaucitronAlertBig {width: 60%;min-width: 285px;height: auto;margin: auto;left: 50%;top: 50%;transform: translate(-50%, -50%);box-shadow: 0 0 9000px #000;border-radius: 20px;padding: 35px 25px;}span#tarteaucitronDisclaimerAlert {padding: 0 30px;}#tarteaucitronRoot span#tarteaucitronDisclaimerAlert {margin: 10px 0 30px;display: block;text-align: center;font-size: 21px;}@media screen and (max-width: 900px) {div#tarteaucitronAlertBig button {margin: 0 auto 10px!important;display: block!important;}}";

            customThemeMiddle.type = "text/css";
            if (customThemeMiddle.styleSheet) {
              customThemeMiddle.styleSheet.cssText = cssRuleMiddle;
            } else {
              customThemeMiddle.appendChild(
                document.createTextNode(cssRuleMiddle)
              );
            }
            document
              .getElementsByTagName("head")[0]
              .appendChild(customThemeMiddle);
          }

          // css for the popup bar TODO: add it on the css file
          if (t.orientation === "popup") {
            var customThemePopup = document.createElement("style"),
              cssRulePopup =
                "div#tarteaucitronAlertBig:before {content: '" +
                t.lang.middleBarHead +
                "';font-size: 22px;}body #tarteaucitronRoot div#tarteaucitronAlertBig {bottom: 0;top: auto!important;left: 8px!important;right: auto!important;transform: initial!important;border-radius: 5px 5px 0 0!important;max-width: 250px!important;width: Calc(100% - 16px)!important;min-width: 0!important;padding: 25px 0;}span#tarteaucitronDisclaimerAlert {padding: 0 30px;font-size: 15px!important;}#tarteaucitronRoot span#tarteaucitronDisclaimerAlert {margin: 10px 0 30px;display: block;text-align: center;font-size: 21px;}div#tarteaucitronAlertBig button {margin: 0 auto 10px!important;display: block!important;width: Calc(100% - 60px);box-sizing: border-box;}";

            customThemePopup.type = "text/css";
            if (customThemePopup.styleSheet) {
              customThemePopup.styleSheet.cssText = cssRulePopup;
            } else {
              customThemePopup.appendChild(
                document.createTextNode(cssRulePopup)
              );
            }
            document
              .getElementsByTagName("head")[0]
              .appendChild(customThemePopup);
          }

          var body = document.body,
            div = document.createElement("div"),
            html = "",
            index,
            orientation = "Top",
            cat = [
              "ads",
              "analytic",
              "api",
              "comment",
              "social",
              "support",
              "video",
              "other",
            ],
            i;

          cat = cat.sort(function (a, b) {
            if (t.lang[a].title > t.lang[b].title) {
              return 1;
            }
            if (t.lang[a].title < t.lang[b].title) {
              return -1;
            }
            return 0;
          });

          // Step 3: prepare the html
          html +=
            '<div role="heading" aria-level="1" id="tac_title" class="tac_visually-hidden">' +
            t.lang.title +
            "</div>";
          html += '<div id="tarteaucitronPremium"></div>';
          if (t.reloadThePage) {
            html +=
              '<button type="button" id="tarteaucitronBack" aria-label="' +
              t.lang.close +
              " (" +
              t.lang.reload +
              ')" title="' +
              t.lang.close +
              " (" +
              t.lang.reload +
              ')"></button>';
          } else {
            html +=
              '<button type="button" id="tarteaucitronBack" aria-label="' +
              t.lang.close +
              '" title="' +
              t.lang.close +
              '"></button>';
          }
          html +=
            '<div id="tarteaucitron" role="dialog" aria-modal="true" aria-labelledby="dialogTitle" tabindex="-1">';
          if (t.reloadThePage) {
            html +=
              '   <button type="button" id="tarteaucitronClosePanel" aria-label="' +
              t.lang.close +
              " (" +
              t.lang.reload +
              ')" title="' +
              t.lang.close +
              " (" +
              t.lang.reload +
              ')">';
          } else {
            html += '   <button type="button" id="tarteaucitronClosePanel">';
          }
          html += "       " + t.lang.close;
          html += "   </button>";
          html += '   <div id="tarteaucitronServices">';
          html +=
            '      <div class="tarteaucitronLine tarteaucitronMainLine" id="tarteaucitronMainLineOffset">';
          html +=
            '         <span class="tarteaucitronH1" role="heading" aria-level="1" id="dialogTitle">' +
            t.lang.title +
            "</span>";
          html += '         <div id="tarteaucitronInfo">';
          html += "         " + t.lang.disclaimer;
          if (t.parameters.privacyUrl !== "") {
            html += "   <br/><br/>";
            html +=
              '   <button type="button" id="tarteaucitronPrivacyUrlDialog" role="link">';
            html += "       " + t.lang.privacyUrl;
            html += "   </button>";
          }
          html += "         </div>";
          html += '         <div class="tarteaucitronName">';
          html +=
            '            <span class="tarteaucitronH2" role="heading" aria-level="2">' +
            t.lang.all +
            "</span>";
          html += "         </div>";
          html +=
            '         <div class="tarteaucitronAsk" id="tarteaucitronScrollbarAdjust">';
          html +=
            '            <button type="button" id="tarteaucitronAllAllowed" class="tarteaucitronAllow">';
          html +=
            '               <span class="tarteaucitronCheck" aria-hidden="true"></span> ' +
            t.lang.allowAll;
          html += "            </button> ";
          html +=
            '            <button type="button" id="tarteaucitronAllDenied" class="tarteaucitronDeny">';
          html +=
            '               <span class="tarteaucitronCross" aria-hidden="true"></span> ' +
            t.lang.denyAll;
          html += "            </button>";
          html += "         </div>";
          html += "      </div>";
          html += '      <div class="tarteaucitronBorder">';
          html += '         <div class="clear"></div><ul>';

          if (t.parameters.mandatory == true) {
            html += '<li id="tarteaucitronServicesTitle_mandatory">';
            html += '<div class="tarteaucitronTitle">';
            html +=
              '   <button type="button" tabindex="-1"><span class="tarteaucitronPlus" aria-hidden="true"></span> ' +
              t.lang.mandatoryTitle +
              "</button>";
            html += "</div>";
            html += '<ul id="tarteaucitronServices_mandatory">';
            html += '<li class="tarteaucitronLine">';
            html += '   <div class="tarteaucitronName">';
            html +=
              '       <span class="tarteaucitronH3" role="heading" aria-level="3">' +
              t.lang.mandatoryText +
              "</span>";
            html +=
              '       <span class="tarteaucitronListCookies" aria-hidden="true"></span><br/>';
            html += "   </div>";
            if (t.parameters.mandatoryCta == true) {
              html += '   <div class="tarteaucitronAsk">';
              html +=
                '       <button type="button" class="tarteaucitronAllow" tabindex="-1" disabled>';
              html +=
                '           <span class="tarteaucitronCheck" aria-hidden="true"></span> ' +
                t.lang.allow;
              html += "       </button> ";
              html +=
                '       <button type="button" class="tarteaucitronDeny" style="visibility:hidden" tabindex="-1">';
              html +=
                '           <span class="tarteaucitronCross" aria-hidden="true"></span> ' +
                t.lang.deny;
              html += "       </button> ";
              html += "   </div>";
            }
            html += "</li>";
            html += "</ul></li>";
          }

          for (i = 0; i < cat.length; i += 1) {
            html +=
              '         <li id="tarteaucitronServicesTitle_' +
              cat[i] +
              '" class="tarteaucitronHidden">';
            html +=
              '            <div class="tarteaucitronTitle" role="heading" aria-level="2">';
            html +=
              '               <button type="button" class="catToggleBtn" aria-expanded="false" data-cat="tarteaucitronDetails' +
              cat[i] +
              '"><span class="tarteaucitronPlus" aria-hidden="true"></span> ' +
              t.lang[cat[i]].title +
              "</button>";
            html += "            </div>";
            html +=
              '            <div id="tarteaucitronDetails' +
              cat[i] +
              '" class="tarteaucitronDetails tarteaucitronInfoBox">';
            html += "               " + t.lang[cat[i]].details;
            html += "            </div>";
            html +=
              '         <ul id="tarteaucitronServices_' +
              cat[i] +
              '"></ul></li>';
          }
          html +=
            '             <li id="tarteaucitronNoServicesTitle" class="tarteaucitronLine">' +
            t.lang.noServices +
            "</li>";
          html += "         </ul>";
          html +=
            '         <div class="tarteaucitronHidden tarteaucitron-spacer-20" id="tarteaucitronScrollbarChild"></div>';
          if (t.parameters.removeCredit === false) {
            html +=
              '     <a class="tarteaucitronSelfLink" href="https://t.io/" rel="nofollow noreferrer noopener" target="_blank" title="tarteaucitron ' +
              t.lang.newWindow +
              '"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHcAAAAeCAYAAAAWwoEYAAADl0lEQVRoge1Y0W3bQAx9CjKARlC+9GVUmqDJBHEmiDyB6wkcTxBngtgTxJ0gzgQW4C/9aYOmE6g4lTQo+k6y3Rb94QOERNQd+cjj8XiGwWAwGAwGg8FgMBgMBoPB8F8RNRXe+whEKe7c36ZCAeCRxC9Rig2PUd8kPgAsoxSfQ3YAzAA8D/HwYYCb05kBKKO0teFkmbC1jlKsAnq/Abjn+QBqAIsoRS30ttwG/HNz1wH/XIxWTicLdvtW7xTAGEAMtP685CNsBTe2d/BLydfXAG57SEnMAST0zgYZSUCPk02bCvkJduIzuJzDLfPolbY+tLKmar+/8+IRePy4qdpE03qHuH8fipFb4N2+XdA3AJ/0vaQxt7s9FvkIS2XvtqnwM0rxpOQfbnE5G2LhTCmUO2fHIngOmcv+KG3HafDchB6ntwjYqenR2PqC7sOZ3E7FXHB0vqxoFyUyLh7OEH7LOGouvhhN3eIBeKXv0n5MsufdHqXcwYR5U2EbpV35lSspVPJmQj4TcgRK7jTg5IzmPUhhwM5a2WHUFCx+NgiDucmgh7idikLovHFlL0pxQ9xzX+IIP9Y6FrJsqhjlQpZRAkFVDCjZfcCHt6bqJDmuh5ylCWx0RVnk3oumaknqTH5sqrY0fBWyULaHUIgAgxb46MxV3DbieAhxOxUxjSuljig9lMQ/Bcfoi9BTEv9aLORSndVxYOH525sUDC6u2gWxcNzBNRxPanyh3ktKinOgy3WoxPbtUM0t6RkbQnzBnFPgi9GCOEubY9UffIryz9iKRe8s/FUfEWosJJGxagp85bpUO3VywQ46lOtAWfNxKwa4JXQ+628+bpxYGXXMzp5rXH401VEyXwIdowXFaKWSMFHvMTVmGnc+P3oXV2QOiBCfgex8QtcQCbcQE/H+eoHzrkFo1KM7zVO4jVVj5s6lRiWF7zyXyfRMc97J3tzj87mYqZ7E2YjzUct9GUi4tjHLR8dVkBLjQcuHFleWvQfRNEhFR7uX7pkctOwvZXsft7sAtyldEUIN2UTeLxnEfxKYswzdi88BdbZ8hifUoSMftQvP+muRwN6+Q3DeqqRExP9QmTtcheiHh0Ot1x2i2km1bP9pbufw5zZdyWsOrh7vQae5OZWbsMv30pi7cd/CKj3coPEVaCP4Zhx4eQWhOZ1Y9MTXGyP8/iGjEyfa1T4fO/4Lea9vBoPBYDAYDAaDwWAwGAwGwz8GgF8siXCCbrSRhgAAAABJRU5ErkJggg==" alt="t.io" /></a>';
          }
          html += "       </div>";
          html += "   </div>";
          html += "</div>";

          if (t.parameters.orientation === "bottom") {
            orientation = "Bottom";
          }

          if (
            t.parameters.highPrivacy &&
            !t.parameters.AcceptAllCta
          ) {
            html +=
              '<div tabindex="-1" id="tarteaucitronAlertBig" class="tarteaucitronAlertBig' +
              orientation +
              '">';
            //html += '<div class="tarteaucitronAlertBigWrapper">';
            html += '   <span id="tarteaucitronDisclaimerAlert">';
            html += "       " + t.lang.alertBigPrivacy;
            html += "   </span>";
            //html += '   <span class="tarteaucitronAlertBigBtnWrapper">';
            html +=
              '   <button type="button" id="tarteaucitronPersonalize" aria-label="' +
              t.lang.personalize +
              " " +
              t.lang.modalWindow +
              '" title="' +
              t.lang.personalize +
              " " +
              t.lang.modalWindow +
              '">';
            html += "       " + t.lang.personalize;
            html += "   </button>";

            if (t.parameters.privacyUrl !== "") {
              html +=
                '   <button role="link" type="button" id="tarteaucitronPrivacyUrl">';
              html += "       " + t.lang.privacyUrl;
              html += "   </button>";
            }

            //html += '   </span>';
            //html += '</div>';
            html += "</div>";
          } else {
            html +=
              '<div tabindex="-1" id="tarteaucitronAlertBig" class="tarteaucitronAlertBig' +
              orientation +
              '">';
            //html += '<div class="tarteaucitronAlertBigWrapper">';
            html += '   <span id="tarteaucitronDisclaimerAlert">';

            if (t.parameters.highPrivacy) {
              html += "       " + t.lang.alertBigPrivacy;
            } else {
              html +=
                "       " +
                t.lang.alertBigClick +
                " " +
                t.lang.alertBig;
            }

            html += "   </span>";
            //html += '   <span class="tarteaucitronAlertBigBtnWrapper">';
            html +=
              '   <button type="button" class="tarteaucitronCTAButton tarteaucitronAllow" id="tarteaucitronPersonalize2">';
            html +=
              '       <span class="tarteaucitronCheck" aria-hidden="true"></span> ' +
              t.lang.acceptAll;
            html += "   </button>";

            if (t.parameters.DenyAllCta) {
              if (t.reloadThePage) {
                html +=
                  '   <button type="button" class="tarteaucitronCTAButton tarteaucitronDeny" id="tarteaucitronAllDenied2" aria-label="' +
                  t.lang.denyAll +
                  " (" +
                  t.lang.reload +
                  ')" title="' +
                  t.lang.denyAll +
                  " (" +
                  t.lang.reload +
                  ')">';
              } else {
                html +=
                  '   <button type="button" class="tarteaucitronCTAButton tarteaucitronDeny" id="tarteaucitronAllDenied2">';
              }
              html +=
                '       <span class="tarteaucitronCross" aria-hidden="true"></span> ' +
                t.lang.denyAll;
              html += "   </button>";
              //html += '   <br/><br/>';
            }

            html +=
              '   <button type="button" id="tarteaucitronCloseAlert" aria-label="' +
              t.lang.personalize +
              " " +
              t.lang.modalWindow +
              '" title="' +
              t.lang.personalize +
              " " +
              t.lang.modalWindow +
              '">';
            html += "       " + t.lang.personalize;
            html += "   </button>";

            if (t.parameters.privacyUrl !== "") {
              html +=
                '   <button type="button" id="tarteaucitronPrivacyUrl" role="link">';
              html += "       " + t.lang.privacyUrl;
              html += "   </button>";
            }

            //html += '   </span>';
            //html += '</div>';
            html += "</div>";
            html += '<div id="tarteaucitronPercentage"></div>';
          }

          if (t.parameters.showIcon === true) {
            html +=
              '<div id="tarteaucitronIcon" class="tarteaucitronIcon' +
              t.parameters.iconPosition +
              '" style="display: block">';
            html +=
              '   <button type="button" id="tarteaucitronManager" aria-label="' +
              t.lang.icon +
              " " +
              t.lang.modalWindow +
              '" title="' +
              t.lang.icon +
              " " +
              t.lang.modalWindow +
              '">';
            html +=
              '       <img src="' +
              (t.parameters.iconSrc
                ? t.parameters.iconSrc
                : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAGA0lEQVRoge1a207bWBRdBtJwLYZhKDMVmlSK1LxNkPo+ZH6g8B6p5AuALwC+APoFoVLeoT8whPeRSt+CZKmZVu3AiIsRlEtCktGyjy8xzuXYhvahS0JJHJ/4rLP3XnuffcAPfGdQ7mM6jRLSAF4BxqsbewB2lRS2o35mpEQaJcwCyANIdLi1DGBNSWEzqmdHRqRRwjqAJclhtExOSUEP+/xIiDRKhhUWfL7ShTtBuJnqcw+/z4Ql0xNmMEwSSz4kuNIzSgpjSsqYJP/GeE185wYJroedRyiLNEpGLLzzrHSuk+83SgbxvOcyyRaDziWsRVZkSRDinpzPbwVGWIucuohsKynMS47fAQyls/BMSRmKJo3AFhG5wm2N1wF+Zs3zebbFfR0RxrXcJHQlgH+LMW616pR/WiIMEXfW3mtzXyeEGWsjKot8c4TOI98L+iKaR5PS6IUk88RLAO9F8UjrbYoYMOosNavpfmODIiwRXRR/G3ohaWVo1RU/c30jV8ab2mV8qVGzHWBOLyTLZiWs5Rolg/C3ySOi0tXP/k4aEwOwSBKPJs7Rp16ABJTe+p1xVX0It/owqqdDEMRoqd3RFxqDPh20Ig6VEPVC0i5RSCD+6wl6HlW7GksSlUMV11/GrUs5NasFLusDE9ELSVphXemtJwaT/8JyIRvxNNCfBmIiNdR04LII3DSrbe0yjqvyJF/ppptqVlt+MCLCEh/oOkPPP6N38Mb5cnQBGFsEqmXg5j3QMwoMzwGnr4HYbybBq13gZAOom/FO63zdf2qQArCsZrUN2TlJy69eSDKYV+6Q4MpP75ivHzPA53ngaBW4eGuSOt0A/lsGPmXMz0+3TFJcTfFbPfFbfnwlhON+iQhlWmA82CQ4ocQ7c6KcfL3DHuls0yT6Sx4YnLXJDCQOIRRv5yGIJBgP8Sdisj2qubpc5UGJmo+W49ifVmzL8HcpGhQPvZCUKiCliIhEN0tr2OCqHuSA8gwQ/92MkU7gxEmeVqGrTTgpxPXbUrtGWYus0I9thRIraagRQUIDf7Qn4yZhKRiFQIyhfMfUr3yblokVWSJ6k8xSnc7eNN/RjowfCYiFoDUFer1S3gW6JiJ8Nt30EMbEhU+vzSIztuRYjRLsR8IHLjlf7HZ+MrWWEXxNmbvapt4jGSqZRYSkGUetSNTPzHsui5YMQ2ajJUNks6mw4wT54Ok2ShnzzIPCUGshzawCRKy5FqvrTZe0RWzQGvw79m67XZjKmxJrLsICjtZa55gxXy+6F4sYsEtxTqhXdRTLC8ulSDaWoCLsolfN+8YUhOsJV709H7Cudr0LlVEtzqBcN+shEyThdR941OnAbF8pirKJqXyupTRTtQSReiVmXW1j7oBErB0d9xM2WEd5J9ZKYtuR4WKwwBSoORbpGrJ5ZI9lt71irJmGX1px0JYE26uNErawr2zfIcP4OHEKXm66PA3wjpCNEfpJunI4muifPjKvsFCkGjExTq63yxMJsZNMYF/J4HmDC5A3Yq36jy0ClePHVhwuu/b1HSFlEfHD5ZtD1bEK44Qu1mWys6tbWmZyPWckzlPTGiRw/XHCuk+q4Rek+mVrVL/UppwrdDEGNV2kpyuhccgc5Oxm9vWnn+19vJrVpLor0kTUrGacMplb1CfOFyTD4o9uNrHqr2Z+ZMSp1c2XcVSORnh9Q81q3k599ETgkNnjg0nGzi10K7rX+bZpHbrblPcY5A4Zxk2xcjzCvTpd9027Aa0QtouyyrKFRR6D/04DwkFGvHPXM3Qda/Jb4nPgI7hQLVM1q5HIBt2MzQNa57Z1DiiLAGa5Mi+O4Sz3Mpp6laPHO6InII3ITnX1QtI+EOX+m9ZxleOZ/j9PiuKoLi3aqXPuEoSye/Vhkm+LalbLtHhMS0R6zu7aZ3vP2jOjL7QVv4McxhcDnZIelAQibGIbULOapf3PuE1Vs9qeaOTdkVKr00gCQiw4NlBzDvf1Lxx+uP5r3Dgv5KQZRzWn+GRwz8jmDS8itUg7iB6vLuJCF5Uty4A9mVKkFR6MiJDachST/oHvHgD+B4SoUIitpF05AAAAAElFTkSuQmCC") +
              '" alt="' +
              t.lang.icon +
              " " +
              t.lang.modalWindow +
              '" title="' +
              t.lang.icon +
              " " +
              t.lang.modalWindow +
              '">';
            html += "   </button>";
            html += "</div>";
          }

          if (t.parameters.showAlertSmall === true) {
            html +=
              '<div id="tarteaucitronAlertSmall" class="tarteaucitronAlertSmall' +
              orientation +
              '">';
            html +=
              '   <button type="button" id="tarteaucitronManager" aria-label="' +
              t.lang.alertSmall +
              " " +
              t.lang.modalWindow +
              '" title="' +
              t.lang.alertSmall +
              " " +
              t.lang.modalWindow +
              '">';
            html += "       " + t.lang.alertSmall;
            html += '       <span id="tarteaucitronDot">';
            html += '           <span id="tarteaucitronDotGreen"></span>';
            html += '           <span id="tarteaucitronDotYellow"></span>';
            html += '           <span id="tarteaucitronDotRed"></span>';
            html += "       </span>";
            if (t.parameters.cookieslist === true) {
              html += "   </button><!-- @whitespace";
              html +=
                '   --><button type="button" id="tarteaucitronCookiesNumber" aria-expanded="false" aria-controls="tarteaucitronCookiesListContainer">0</button>';
              html += '   <div id="tarteaucitronCookiesListContainer">';
              if (t.reloadThePage) {
                html +=
                  '       <button type="button" id="tarteaucitronClosePanelCookie" aria-label="' +
                  t.lang.close +
                  " (" +
                  t.lang.reload +
                  ')" title="' +
                  t.lang.close +
                  " (" +
                  t.lang.reload +
                  ')">';
              } else {
                html +=
                  '       <button type="button" id="tarteaucitronClosePanelCookie">';
              }
              html += "           " + t.lang.close;
              html += "       </button>";
              html +=
                '       <div class="tarteaucitronCookiesListMain" id="tarteaucitronCookiesTitle">';
              html +=
                '            <span class="tarteaucitronH2" role="heading" aria-level="2" id="tarteaucitronCookiesNumberBis">0 cookie</span>';
              html += "       </div>";
              html += '       <div id="tarteaucitronCookiesList"></div>';
              html += "    </div>";
            } else {
              html += "   </div>";
            }
            html += "</div>";
          }

          t.addInternalScript(
            t.cdn +
              "advertising" +
              (useJSDelivrMinifiedJS ? ".min" : "") +
              ".js?v=" +
              t.version,
            "",
            function () {
              if (
                tarteaucitronNoAdBlocker === true ||
                t.parameters.adblocker === false
              ) {
                // create a wrapper container at the same level than tarteaucitron so we can add an aria-hidden when tarteaucitron is opened
                /*var wrapper = document.createElement('div');
                        wrapper.id = "tarteaucitronContentWrapper";

                        while (document.body.firstChild)
                        {
                            wrapper.appendChild(document.body.firstChild);
                        }

                        // Append the wrapper to the body
                        document.body.appendChild(wrapper);*/

                div.id = "tarteaucitronRoot";
                if (t.parameters.bodyPosition === "top") {
                  // Prepend tarteaucitron: #tarteaucitronRoot first-child of the body for better accessibility
                  var bodyFirstChild = body.firstChild;
                  body.insertBefore(div, bodyFirstChild);
                } else {
                  // Append tarteaucitron: #tarteaucitronRoot last-child of the body
                  body.appendChild(div, body);
                }

                div.setAttribute("data-nosnippet", "true");
                div.setAttribute("lang", language);
                div.setAttribute("role", "region");
                div.setAttribute("aria-labelledby", "tac_title");

                div.innerHTML = html;

                //ie compatibility
                var tacRootAvailableEvent;
                if (typeof Event === "function") {
                  tacRootAvailableEvent = new Event("tac.root_available");
                } else if (typeof document.createEvent === "function") {
                  tacRootAvailableEvent = document.createEvent("Event");
                  tacRootAvailableEvent.initEvent(
                    "tac.root_available",
                    true,
                    true
                  );
                }
                //end ie compatibility

                if (typeof window.dispatchEvent === "function") {
                  window.dispatchEvent(tacRootAvailableEvent);
                }

                if (t.job !== undefined) {
                  t.job = t.cleanArray(
                    t.job
                  );
                  for (
                    index = 0;
                    index < t.job.length;
                    index += 1
                  ) {
                    t.addService(t.job[index]);
                  }
                } else {
                  t.job = [];
                }

                if (t.job.length === 0) {
                  t.userInterface.closeAlert();
                }

                t.isAjax = true;

                t.job.push = function (id) {
                  // ie <9 hack
                  if (typeof t.job.indexOf === "undefined") {
                    t.job.indexOf = function (obj, start) {
                      var i,
                        j = this.length;
                      for (i = start || 0; i < j; i += 1) {
                        if (this[i] === obj) {
                          return i;
                        }
                      }
                      return -1;
                    };
                  }

                  if (t.job.indexOf(id) === -1) {
                    Array.prototype.push.call(this, id);
                  }
                  t.launch[id] = false;
                  t.addService(id);
                };

                if (
                  document.location.hash === t.hashtag &&
                  t.hashtag !== ""
                ) {
                  t.userInterface.openPanel();
                }

                t.cookie.number();
                setInterval(t.cookie.number, 60000);
              }
            },
            t.parameters.adblocker
          );

          if (t.parameters.adblocker === true) {
            setTimeout(function () {
              if (tarteaucitronNoAdBlocker === false) {
                html =
                  '<div id="tarteaucitronAlertBig" class="tarteaucitronAlertBig' +
                  orientation +
                  ' tarteaucitron-display-block" role="alert" aria-live="polite">';
                html += '   <p id="tarteaucitronDisclaimerAlert">';
                html += "       " + t.lang.adblock + "<br/>";
                html +=
                  "       <strong>" +
                  t.lang.adblock_call +
                  "</strong>";
                html += "   </p>";
                html +=
                  '   <button type="button" class="tarteaucitronCTAButton" id="tarteaucitronCTAButton">';
                html += "       " + t.lang.reload;
                html += "   </button>";
                html += "</div>";
                html +=
                  '<div role="heading" aria-level="1" id="tac_title" class="tac_visually-hidden">' +
                  t.lang.title +
                  "</div>";
                html += '<div id="tarteaucitronPremium"></div>';

                div.id = "tarteaucitronRoot";
                if (t.parameters.bodyPosition === "top") {
                  // Prepend tarteaucitron: #tarteaucitronRoot first-child of the body for better accessibility
                  var bodyFirstChild = body.firstChild;
                  body.insertBefore(div, bodyFirstChild);
                } else {
                  // Append tarteaucitron: #tarteaucitronRoot last-child of the body
                  body.appendChild(div, body);
                }

                div.setAttribute("data-nosnippet", "true");
                div.setAttribute("lang", language);
                div.setAttribute("role", "region");
                div.setAttribute("aria-labelledby", "tac_title");

                div.innerHTML = html;
              }
            }, 1500);
          }
          if (t.parameters.closePopup === true) {
            setTimeout(function () {
              var closeElement = document.getElementById(
                  "tarteaucitronAlertBig"
                ),
                closeSpan = document.createElement("span");
              if (closeElement) {
                closeSpan.textContent = "X";
                closeSpan.setAttribute("id", "tarteaucitronCloseCross");
                closeElement.insertBefore(
                  closeSpan,
                  closeElement.firstElementChild
                );
              }
            }, 100);
          }

          if (t.parameters.groupServices === true) {
            var tac_group_style = document.createElement("style");
            tac_group_style.innerHTML = ".tarteaucitronTitle{display:none}";
            document.head.appendChild(tac_group_style);
            var cats = document.querySelectorAll(
              '[id^="tarteaucitronServicesTitle_"]'
            );
            Array.prototype.forEach.call(cats, function (item) {
              var cat = item
                .getAttribute("id")
                .replace(/^(tarteaucitronServicesTitle_)/, "");
              if (cat !== "mandatory") {
                var html = "";
                html += '<li  class="tarteaucitronLine">';
                html += '   <div class="tarteaucitronName">';
                html +=
                  '       <span class="tarteaucitronH3" role="heading" aria-level="2">' +
                  t.lang[cat].title +
                  "</span>";
                html +=
                  "       <span>" + t.lang[cat].details + "</span>";
                html +=
                  '   <button type="button" aria-expanded="false" class="tarteaucitron-toggle-group" id="tarteaucitron-toggle-group-' +
                  cat +
                  '">' +
                  t.lang.alertSmall +
                  " (" +
                  document.getElementById("tarteaucitronServices_" + cat)
                    .childElementCount +
                  ")</button>";
                html += "   </div>";
                html +=
                  '   <div class="tarteaucitronAsk" id="tarteaucitron-group-' +
                  cat +
                  '">';
                html +=
                  '       <button type="button" aria-label="' +
                  t.lang.allow +
                  " " +
                  t.lang[cat].title +
                  '" class="tarteaucitronAllow" id="tarteaucitron-accept-group-' +
                  cat +
                  '">';
                html +=
                  '           <span class="tarteaucitronCheck" aria-hidden="true"></span> ' +
                  t.lang.allow;
                html += "       </button> ";
                html +=
                  '       <button type="button" aria-label="' +
                  t.lang.deny +
                  " " +
                  t.lang[cat].title +
                  '" class="tarteaucitronDeny" id="tarteaucitron-reject-group-' +
                  cat +
                  '">';
                html +=
                  '           <span class="tarteaucitronCross" aria-hidden="true"></span> ' +
                  t.lang.deny;
                html += "       </button>";
                html += "   </div>";
                html += "</li>";
                var ul = document.createElement("ul");
                ul.innerHTML = html;
                item.insertBefore(
                  ul,
                  item.querySelector("#tarteaucitronServices_" + cat + "")
                );
                document.querySelector(
                  "#tarteaucitronServices_" + cat
                ).style.display = "none";
                t.addClickEventToId(
                  "tarteaucitron-toggle-group-" + cat,
                  function () {
                    t.userInterface.toggle(
                      "tarteaucitronServices_" + cat
                    );
                    if (
                      document.getElementById("tarteaucitronServices_" + cat)
                        .style.display == "block"
                    ) {
                      t.userInterface.addClass(
                        "tarteaucitronServicesTitle_" + cat,
                        "tarteaucitronIsExpanded"
                      );
                      document
                        .getElementById("tarteaucitron-toggle-group-" + cat)
                        .setAttribute("aria-expanded", "true");
                    } else {
                      t.userInterface.removeClass(
                        "tarteaucitronServicesTitle_" + cat,
                        "tarteaucitronIsExpanded"
                      );
                      document
                        .getElementById("tarteaucitron-toggle-group-" + cat)
                        .setAttribute("aria-expanded", "false");
                    }
                    t.initEvents.resizeEvent();
                  }
                );
                t.addClickEventToId(
                  "tarteaucitron-accept-group-" + cat,
                  function () {
                    t.userInterface.respondAll(true, cat);
                  }
                );
                t.addClickEventToId(
                  "tarteaucitron-reject-group-" + cat,
                  function () {
                    t.userInterface.respondAll(false, cat);
                  }
                );
              }
            });
          }
          t.userInterface.color("", true);

          // add a little timeout to be sure everything is accessible
          setTimeout(function () {
            // Setup events
            t.addClickEventToId(
              "tarteaucitronCloseCross",
              function () {
                t.userInterface.closeAlert();
              }
            );
            t.addClickEventToId(
              "tarteaucitronPersonalize",
              function () {
                t.userInterface.openPanel();
              }
            );
            t.addClickEventToId(
              "tarteaucitronPersonalize2",
              function () {
                t.userInterface.respondAll(true);
              }
            );
            t.addClickEventToId(
              "tarteaucitronManager",
              function () {
                t.userInterface.openPanel();
              }
            );
            t.addClickEventToId("tarteaucitronBack", function () {
              t.userInterface.closePanel();
            });
            t.addClickEventToId(
              "tarteaucitronClosePanel",
              function () {
                t.userInterface.closePanel();
              }
            );
            t.addClickEventToId(
              "tarteaucitronClosePanelCookie",
              function () {
                t.userInterface.closePanel();
              }
            );
            t.addClickEventToId(
              "tarteaucitronPrivacyUrl",
              function () {
                document.location = t.parameters.privacyUrl;
              }
            );
            t.addClickEventToId(
              "tarteaucitronPrivacyUrlDialog",
              function () {
                document.location = t.parameters.privacyUrl;
              }
            );
            t.addClickEventToId(
              "tarteaucitronCookiesNumber",
              function () {
                t.userInterface.toggleCookiesList();
              }
            );
            t.addClickEventToId(
              "tarteaucitronAllAllowed",
              function () {
                t.userInterface.respondAll(true);
              }
            );
            t.addClickEventToId(
              "tarteaucitronAllDenied",
              function () {
                t.userInterface.respondAll(false);
              }
            );
            t.addClickEventToId(
              "tarteaucitronAllDenied2",
              function () {
                t.userInterface.respondAll(false, "", true);
                if (t.reloadThePage === true) {
                  window.location.reload();
                }
              }
            );
            t.addClickEventToId(
              "tarteaucitronCloseAlert",
              function () {
                t.userInterface.openPanel();
              }
            );
            t.addClickEventToId(
              "tarteaucitronCTAButton",
              function () {
                location.reload();
              }
            );
            var toggleBtns = document.getElementsByClassName("catToggleBtn"),
              i;
            for (i = 0; i < toggleBtns.length; i++) {
              toggleBtns[i].dataset.index = i;
              t.addClickEventToElement(toggleBtns[i], function () {
                t.userInterface.toggle(
                  "tarteaucitronDetails" + cat[this.dataset.index],
                  "tarteaucitronInfoBox"
                );
                if (
                  document.getElementById(
                    "tarteaucitronDetails" + cat[this.dataset.index]
                  ).style.display === "block"
                ) {
                  this.setAttribute("aria-expanded", "true");
                } else {
                  this.setAttribute("aria-expanded", "false");
                }
                return false;
              });
            }

            var allowBtns =
              document.getElementsByClassName("tarteaucitronAllow");
            for (i = 0; i < allowBtns.length; i++) {
              t.addClickEventToElement(allowBtns[i], function () {
                t.userInterface.respond(this, true);
              });
            }
            var denyBtns = document.getElementsByClassName("tarteaucitronDeny");
            for (i = 0; i < denyBtns.length; i++) {
              t.addClickEventToElement(denyBtns[i], function () {
                t.userInterface.respond(this, false);
              });
            }
            if (t.events.load) {
              t.events.load();
            }
          }, 500);
        });
      });
    },
    addService: function (serviceId) {
      "use strict";
      var html = "",
        s = t.services,
        service = s[serviceId],
        cookie = t.cookie.read(),
        hostname = document.location.hostname,
        hostRef = document.referrer.split("/")[2],
        isNavigating =
          hostRef === hostname &&
          window.location.href !== t.parameters.privacyUrl,
        isAutostart = !service.needConsent,
        isWaiting = cookie.indexOf(service.key + "=wait") >= 0,
        isDenied = cookie.indexOf(service.key + "=false") >= 0,
        isAllowed =
          cookie.indexOf(service.key + "=true") >= 0 ||
          (!service.needConsent && cookie.indexOf(service.key + "=false") < 0),
        isResponded =
          cookie.indexOf(service.key + "=false") >= 0 ||
          cookie.indexOf(service.key + "=true") >= 0,
        isDNTRequested =
          navigator.doNotTrack === "1" ||
          navigator.doNotTrack === "yes" ||
          navigator.msDoNotTrack === "1" ||
          window.doNotTrack === "1",
        currentStatus = isAllowed
          ? t.lang.allowed
          : t.lang.disallowed,
        state =
          undefined !== service.defaultState
            ? service.defaultState
            : undefined !== t.parameters.serviceDefaultState
            ? t.parameters.serviceDefaultState
            : "wait";

      if (t.added[service.key] !== true) {
        t.added[service.key] = true;

        html += '<li id="' + service.key + 'Line" class="tarteaucitronLine">';
        html += '   <div class="tarteaucitronName">';
        html +=
          '       <span class="tarteaucitronH3" role="heading" aria-level="3">' +
          service.name +
          "</span>";
        html +=
          '       <span class="tacCurrentStatus" id="tacCurrentStatus' +
          service.key +
          '">' +
          currentStatus +
          "</span>";
        html +=
          '       <span class="tarteaucitronReadmoreSeparator"> - </span>';
        html +=
          '       <span id="tacCL' +
          service.key +
          '" class="tarteaucitronListCookies"></span><br/>';
        if (t.parameters.moreInfoLink == true) {
          var link = "https://t.io/service/" + service.key + "/";
          if (
            service.readmoreLink !== undefined &&
            service.readmoreLink !== ""
          ) {
            link = service.readmoreLink;
          }
          if (
            t.parameters.readmoreLink !== undefined &&
            t.parameters.readmoreLink !== ""
          ) {
            link = t.parameters.readmoreLink;
          }
          html +=
            '       <a href="' +
            link +
            '" target="_blank" rel="noreferrer noopener nofollow" title="' +
            t.lang.more +
            " : " +
            t.lang.cookieDetail +
            " " +
            service.name +
            " " +
            t.lang.ourSite +
            " " +
            t.lang.newWindow +
            '" class="tarteaucitronReadmoreInfo">';
          html += "           " + t.lang.more;
          html += "       </a>";
          html +=
            '       <span class="tarteaucitronReadmoreSeparator"> - </span>';
          html +=
            '       <a href="' +
            service.uri +
            '" target="_blank" rel="noreferrer noopener" title="' +
            t.lang.source +
            " " +
            service.name +
            " " +
            t.lang.newWindow +
            '" class="tarteaucitronReadmoreOfficial">';
          html += "           " + t.lang.source;
          html += "       </a>";
        }

        html += "   </div>";
        html += '   <div class="tarteaucitronAsk">';
        html +=
          '       <button type="button" aria-label="' +
          t.lang.allow +
          " " +
          service.name +
          '" id="' +
          service.key +
          'Allowed" class="tarteaucitronAllow">';
        html +=
          '           <span class="tarteaucitronCheck" aria-hidden="true"></span> ' +
          t.lang.allow;
        html += "       </button> ";
        html +=
          '       <button type="button" aria-label="' +
          t.lang.deny +
          " " +
          service.name +
          '" id="' +
          service.key +
          'Denied" class="tarteaucitronDeny">';
        html +=
          '           <span class="tarteaucitronCross" aria-hidden="true"></span> ' +
          t.lang.deny;
        html += "       </button>";
        html += "   </div>";
        html += "</li>";

        t.userInterface.css(
          "tarteaucitronServicesTitle_" + service.type,
          "display",
          "block"
        );

        if (
          document.getElementById("tarteaucitronServices_" + service.type) !==
          null
        ) {
          document.getElementById(
            "tarteaucitronServices_" + service.type
          ).innerHTML += html;
        }

        t.userInterface.css(
          "tarteaucitronNoServicesTitle",
          "display",
          "none"
        );

        t.userInterface.order(service.type);

        t.addClickEventToId(service.key + "Allowed", function () {
          t.userInterface.respond(this, true);
        });

        t.addClickEventToId(service.key + "Denied", function () {
          t.userInterface.respond(this, false);
        });
      }

      t.pro("!" + service.key + "=" + isAllowed);

      // allow by default for non EU
      if (isResponded === false && t.user.bypass === true) {
        isAllowed = true;
        t.cookie.create(service.key, true);
      }

      if (
        (!isResponded &&
          (isAutostart || (isNavigating && isWaiting)) &&
          !t.highPrivacy) ||
        isAllowed
      ) {
        if (
          !isAllowed ||
          (!service.needConsent && cookie.indexOf(service.key + "=false") < 0)
        ) {
          t.cookie.create(service.key, true);
        }
        if (t.launch[service.key] !== true) {
          t.launch[service.key] = true;
          if (
            typeof tarteaucitronMagic === "undefined" ||
            tarteaucitronMagic.indexOf("_" + service.key + "_") < 0
          ) {
            service.js();
          }
          t.sendEvent(service.key + "_loaded");
        }
        t.state[service.key] = true;
        t.userInterface.color(service.key, true);
      } else if (isDenied) {
        if (typeof service.fallback === "function") {
          if (
            typeof tarteaucitronMagic === "undefined" ||
            tarteaucitronMagic.indexOf("_" + service.key + "_") < 0
          ) {
            service.fallback();
          }
        }
        t.state[service.key] = false;
        t.userInterface.color(service.key, false);
      } else if (
        !isResponded &&
        isDNTRequested &&
        t.handleBrowserDNTRequest
      ) {
        t.cookie.create(service.key, "false");
        if (typeof service.fallback === "function") {
          if (
            typeof tarteaucitronMagic === "undefined" ||
            tarteaucitronMagic.indexOf("_" + service.key + "_") < 0
          ) {
            service.fallback();
          }
        }
        t.state[service.key] = false;
        t.userInterface.color(service.key, false);
      } else if (!isResponded) {
        t.cookie.create(service.key, state);
        if (
          typeof tarteaucitronMagic === "undefined" ||
          tarteaucitronMagic.indexOf("_" + service.key + "_") < 0
        ) {
          if (true === state && typeof service.js === "function") {
            service.js();
          } else if (typeof service.fallback === "function") {
            service.fallback();
          }
        }

        t.userInterface.color(service.key, state);

        if ("wait" === state) {
          t.userInterface.openAlert();
        }
      }

      t.cookie.checkCount(service.key);
      t.sendEvent(service.key + "_added");
    },
    sendEvent: function (event_key) {
      if (event_key !== undefined) {
        //ie compatibility
        var send_event_item;
        if (typeof Event === "function") {
          send_event_item = new Event(event_key);
        } else if (typeof document.createEvent === "function") {
          send_event_item = document.createEvent("Event");
          send_event_item.initEvent(event_key, true, true);
        }
        //end ie compatibility

        document.dispatchEvent(send_event_item);
      }
    },
    cleanArray: function cleanArray(arr) {
      "use strict";
      var i,
        len = arr.length,
        out = [],
        obj = {},
        s = t.services;

      for (i = 0; i < len; i += 1) {
        if (!obj[arr[i]]) {
          obj[arr[i]] = {};
          if (t.services[arr[i]] !== undefined) {
            out.push(arr[i]);
          }
        }
      }

      out = out.sort(function (a, b) {
        if (s[a].type + s[a].key > s[b].type + s[b].key) {
          return 1;
        }
        if (s[a].type + s[a].key < s[b].type + s[b].key) {
          return -1;
        }
        return 0;
      });

      return out;
    },
    userInterface: {
      css: function (id, property, value) {
        "use strict";
        if (document.getElementById(id) !== null) {
          if (
            property == "display" &&
            value == "none" &&
            (id == "tarteaucitron" ||
              id == "tarteaucitronBack" ||
              id == "tarteaucitronAlertBig")
          ) {
            document.getElementById(id).style["opacity"] = "0";

            /*setTimeout(function() {*/ document.getElementById(id).style[
              property
            ] = value; /*}, 200);*/
          } else {
            document.getElementById(id).style[property] = value;

            if (
              property == "display" &&
              value == "block" &&
              (id == "tarteaucitron" || id == "tarteaucitronAlertBig")
            ) {
              document.getElementById(id).style["opacity"] = "1";
            }

            if (
              property == "display" &&
              value == "block" &&
              id == "tarteaucitronBack"
            ) {
              document.getElementById(id).style["opacity"] = "0.7";
            }
          }
        }
      },
      addClass: function (id, className) {
        "use strict";
        if (
          document.getElementById(id) !== null &&
          document.getElementById(id).classList !== undefined
        ) {
          document.getElementById(id).classList.add(className);
        }
      },
      removeClass: function (id, className) {
        "use strict";
        if (
          document.getElementById(id) !== null &&
          document.getElementById(id).classList !== undefined
        ) {
          document.getElementById(id).classList.remove(className);
        }
      },
      respondAll: function (status, type, allowSafeAnalytics) {
        "use strict";
        var s = t.services,
          service,
          key,
          index = 0;

        for (index = 0; index < t.job.length; index += 1) {
          if (
            typeof type !== "undefined" &&
            type !== "" &&
            s[t.job[index]].type !== type
          ) {
            continue;
          }

          if (
            allowSafeAnalytics &&
            typeof s[t.job[index]].safeanalytic !== "undefined" &&
            s[t.job[index]].safeanalytic === true
          ) {
            continue;
          }

          service = s[t.job[index]];
          key = service.key;
          if (t.state[key] !== status) {
            if (status === false && t.launch[key] === true) {
              t.reloadThePage = true;
              if (t.checkIfExist("tarteaucitronClosePanel")) {
                var ariaCloseValue =
                  document
                    .getElementById("tarteaucitronClosePanel")
                    .textContent.trim() +
                  " (" +
                  t.lang.reload +
                  ")";
                document
                  .getElementById("tarteaucitronClosePanel")
                  .setAttribute("aria-label", ariaCloseValue);
                document
                  .getElementById("tarteaucitronClosePanel")
                  .setAttribute("title", ariaCloseValue);
              }
            }
            if (t.launch[key] !== true && status === true) {
              t.pro("!" + key + "=engage");

              t.launch[key] = true;
              if (
                typeof tarteaucitronMagic === "undefined" ||
                tarteaucitronMagic.indexOf("_" + key + "_") < 0
              ) {
                t.services[key].js();
              }
              t.sendEvent(key + "_loaded");
            }
            var itemStatusElem = document.getElementById(
              "tacCurrentStatus" + key
            );
            if (status == true) {
              itemStatusElem.innerHTML = t.lang.allowed;
              t.sendEvent(key + "_allowed");
            } else {
              itemStatusElem.innerHTML = t.lang.disallowed;
              t.sendEvent(key + "_disallowed");
            }
            t.state[key] = status;
            t.cookie.create(key, status);
            t.userInterface.color(key, status);
          }
        }
      },
      respond: function (el, status) {
        "use strict";
        if (el.id === "") {
          return;
        }
        var key = el.id.replace(
          new RegExp("(Eng[0-9]+|Allow|Deni)ed", "g"),
          ""
        );

        if (key.substring(0, 13) === "tarteaucitron" || key === "") {
          return;
        }

        // return if same state
        if (t.state[key] === status) {
          return;
        }

        if (status === false && t.launch[key] === true) {
          t.reloadThePage = true;
          if (t.checkIfExist("tarteaucitronClosePanel")) {
            var ariaCloseValue =
              document
                .getElementById("tarteaucitronClosePanel")
                .textContent.trim() +
              " (" +
              t.lang.reload +
              ")";
            document
              .getElementById("tarteaucitronClosePanel")
              .setAttribute("aria-label", ariaCloseValue);
            document
              .getElementById("tarteaucitronClosePanel")
              .setAttribute("title", ariaCloseValue);
          }
        }

        // if not already launched... launch the service
        if (status === true) {
          if (t.launch[key] !== true) {
            t.pro("!" + key + "=engage");

            t.launch[key] = true;
            if (
              typeof tarteaucitronMagic === "undefined" ||
              tarteaucitronMagic.indexOf("_" + key + "_") < 0
            ) {
              t.services[key].js();
            }
            t.sendEvent(key + "_loaded");
          }
        }
        var itemStatusElem = document.getElementById("tacCurrentStatus" + key);
        if (status == true) {
          itemStatusElem.innerHTML = t.lang.allowed;
          t.sendEvent(key + "_allowed");
        } else {
          itemStatusElem.innerHTML = t.lang.disallowed;
          t.sendEvent(key + "_disallowed");
        }
        t.state[key] = status;
        t.cookie.create(key, status);
        t.userInterface.color(key, status);
      },
      color: function (key, status) {
        "use strict";
        var c = "tarteaucitron",
          nbDenied = 0,
          nbPending = 0,
          nbAllowed = 0,
          sum = t.job.length,
          index,
          s = t.services;

        if (key !== "") {
          if (status === true) {
            t.userInterface.addClass(
              key + "Line",
              "tarteaucitronIsAllowed"
            );
            t.userInterface.removeClass(
              key + "Line",
              "tarteaucitronIsDenied"
            );
            document
              .getElementById(key + "Allowed")
              .setAttribute("aria-pressed", "true");
            document
              .getElementById(key + "Denied")
              .setAttribute("aria-pressed", "false");
          } else if (status === false) {
            t.userInterface.removeClass(
              key + "Line",
              "tarteaucitronIsAllowed"
            );
            t.userInterface.addClass(
              key + "Line",
              "tarteaucitronIsDenied"
            );
            document
              .getElementById(key + "Allowed")
              .setAttribute("aria-pressed", "false");
            document
              .getElementById(key + "Denied")
              .setAttribute("aria-pressed", "true");
          } else {
            document
              .getElementById(key + "Allowed")
              .setAttribute("aria-pressed", "false");
            document
              .getElementById(key + "Denied")
              .setAttribute("aria-pressed", "false");
          }

          // check if all services are allowed
          var sumToRemove = 0;
          for (index = 0; index < sum; index += 1) {
            if (
              typeof s[t.job[index]].safeanalytic !== "undefined" &&
              s[t.job[index]].safeanalytic === true
            ) {
              sumToRemove += 1;
              continue;
            }

            if (t.state[t.job[index]] === false) {
              nbDenied += 1;
            } else if (
              t.state[t.job[index]] === undefined
            ) {
              nbPending += 1;
            } else if (t.state[t.job[index]] === true) {
              nbAllowed += 1;
            }
          }
          sum -= sumToRemove;

          t.userInterface.css(
            c + "DotGreen",
            "width",
            (100 / sum) * nbAllowed + "%"
          );
          t.userInterface.css(
            c + "DotYellow",
            "width",
            (100 / sum) * nbPending + "%"
          );
          t.userInterface.css(
            c + "DotRed",
            "width",
            (100 / sum) * nbDenied + "%"
          );

          if (nbDenied === 0 && nbPending === 0) {
            t.userInterface.removeClass(
              c + "AllDenied",
              c + "IsSelected"
            );
            t.userInterface.addClass(
              c + "AllAllowed",
              c + "IsSelected"
            );

            t.userInterface.addClass(
              c + "MainLineOffset",
              c + "IsAllowed"
            );
            t.userInterface.removeClass(
              c + "MainLineOffset",
              c + "IsDenied"
            );

            document
              .getElementById(c + "AllDenied")
              .setAttribute("aria-pressed", "false");
            document
              .getElementById(c + "AllAllowed")
              .setAttribute("aria-pressed", "true");
          } else if (nbAllowed === 0 && nbPending === 0) {
            t.userInterface.removeClass(
              c + "AllAllowed",
              c + "IsSelected"
            );
            t.userInterface.addClass(
              c + "AllDenied",
              c + "IsSelected"
            );

            t.userInterface.removeClass(
              c + "MainLineOffset",
              c + "IsAllowed"
            );
            t.userInterface.addClass(
              c + "MainLineOffset",
              c + "IsDenied"
            );

            document
              .getElementById(c + "AllDenied")
              .setAttribute("aria-pressed", "true");
            document
              .getElementById(c + "AllAllowed")
              .setAttribute("aria-pressed", "false");
          } else {
            t.userInterface.removeClass(
              c + "AllAllowed",
              c + "IsSelected"
            );
            t.userInterface.removeClass(
              c + "AllDenied",
              c + "IsSelected"
            );

            t.userInterface.removeClass(
              c + "MainLineOffset",
              c + "IsAllowed"
            );
            t.userInterface.removeClass(
              c + "MainLineOffset",
              c + "IsDenied"
            );

            document
              .getElementById(c + "AllDenied")
              .setAttribute("aria-pressed", "false");
            document
              .getElementById(c + "AllAllowed")
              .setAttribute("aria-pressed", "false");
          }

          // close the alert if all service have been reviewed
          if (nbPending === 0) {
            t.userInterface.closeAlert();
          }

          if (
            t.services[key].cookies.length > 0 &&
            status === false
          ) {
            t.cookie.purge(t.services[key].cookies);
          }

          if (status === true) {
            if (document.getElementById("tacCL" + key) !== null) {
              document.getElementById("tacCL" + key).innerHTML = "...";
            }
            setTimeout(function () {
              t.cookie.checkCount(key);
            }, 2500);
          } else {
            t.cookie.checkCount(key);
          }
        }

        // groups
        var cats = document.querySelectorAll(
          '[id^="tarteaucitronServicesTitle_"]'
        );
        Array.prototype.forEach.call(cats, function (item) {
          var cat = item
              .getAttribute("id")
              .replace(/^(tarteaucitronServicesTitle_)/, ""),
            total = document.getElementById(
              "tarteaucitronServices_" + cat
            ).childElementCount;
          var doc = document.getElementById("tarteaucitronServices_" + cat),
            groupdenied = 0,
            groupallowed = 0;
          for (var ii = 0; ii < doc.children.length; ii++) {
            if (
              doc.children[ii].className ==
              "tarteaucitronLine tarteaucitronIsDenied"
            ) {
              groupdenied++;
            }
            if (
              doc.children[ii].className ==
              "tarteaucitronLine tarteaucitronIsAllowed"
            ) {
              groupallowed++;
            }
          }
          if (total === groupallowed) {
            t.userInterface.removeClass(
              "tarteaucitron-group-" + cat,
              "tarteaucitronIsDenied"
            );
            t.userInterface.addClass(
              "tarteaucitron-group-" + cat,
              "tarteaucitronIsAllowed"
            );

            if (document.getElementById("tarteaucitron-reject-group-" + cat)) {
              document
                .getElementById("tarteaucitron-reject-group-" + cat)
                .setAttribute("aria-pressed", "false");
              document
                .getElementById("tarteaucitron-accept-group-" + cat)
                .setAttribute("aria-pressed", "true");
            }
          }
          if (total === groupdenied) {
            t.userInterface.addClass(
              "tarteaucitron-group-" + cat,
              "tarteaucitronIsDenied"
            );
            t.userInterface.removeClass(
              "tarteaucitron-group-" + cat,
              "tarteaucitronIsAllowed"
            );

            if (document.getElementById("tarteaucitron-reject-group-" + cat)) {
              document
                .getElementById("tarteaucitron-reject-group-" + cat)
                .setAttribute("aria-pressed", "true");
              document
                .getElementById("tarteaucitron-accept-group-" + cat)
                .setAttribute("aria-pressed", "false");
            }
          }
          if (total !== groupdenied && total !== groupallowed) {
            t.userInterface.removeClass(
              "tarteaucitron-group-" + cat,
              "tarteaucitronIsDenied"
            );
            t.userInterface.removeClass(
              "tarteaucitron-group-" + cat,
              "tarteaucitronIsAllowed"
            );

            if (document.getElementById("tarteaucitron-reject-group-" + cat)) {
              document
                .getElementById("tarteaucitron-reject-group-" + cat)
                .setAttribute("aria-pressed", "false");
              document
                .getElementById("tarteaucitron-accept-group-" + cat)
                .setAttribute("aria-pressed", "false");
            }
          }
          groupdenied = 0;
          groupallowed = 0;
        });
      },
      openPanel: function () {
        "use strict";

        t.userInterface.css("tarteaucitron", "display", "block");
        t.userInterface.css(
          "tarteaucitronBack",
          "display",
          "block"
        );
        t.userInterface.css(
          "tarteaucitronCookiesListContainer",
          "display",
          "none"
        );

        document.getElementById("tarteaucitronClosePanel").focus();
        if (document.getElementsByTagName("body")[0].classList !== undefined) {
          document
            .getElementsByTagName("body")[0]
            .classList.add("tarteaucitron-modal-open");
        }
        t.userInterface.focusTrap();
        t.userInterface.jsSizing("main");

        //ie compatibility
        var tacOpenPanelEvent;
        if (typeof Event === "function") {
          tacOpenPanelEvent = new Event("tac.open_panel");
        } else if (typeof document.createEvent === "function") {
          tacOpenPanelEvent = document.createEvent("Event");
          tacOpenPanelEvent.initEvent("tac.open_panel", true, true);
        }
        //end ie compatibility

        if (typeof window.dispatchEvent === "function") {
          window.dispatchEvent(tacOpenPanelEvent);
        }
      },
      closePanel: function () {
        "use strict";

        if (document.location.hash === t.hashtag) {
          if (window.history) {
            window.history.replaceState(
              "",
              document.title,
              window.location.pathname + window.location.search
            );
          } else {
            document.location.hash = "";
          }
        }
        if (t.checkIfExist("tarteaucitron")) {
          // accessibility: manage focus on close panel
          if (t.checkIfExist("tarteaucitronCloseAlert")) {
            document.getElementById("tarteaucitronCloseAlert").focus();
          } else if (t.checkIfExist("tarteaucitronManager")) {
            document.getElementById("tarteaucitronManager").focus();
          } else if (
            t.customCloserId &&
            t.checkIfExist(t.customCloserId)
          ) {
            document.getElementById(t.customCloserId).focus();
          }
          t.userInterface.css("tarteaucitron", "display", "none");
        }

        if (
          t.checkIfExist("tarteaucitronCookiesListContainer") &&
          t.checkIfExist("tarteaucitronCookiesNumber")
        ) {
          // accessibility: manage focus on close cookies list
          document.getElementById("tarteaucitronCookiesNumber").focus();
          document
            .getElementById("tarteaucitronCookiesNumber")
            .setAttribute("aria-expanded", "false");
          t.userInterface.css(
            "tarteaucitronCookiesListContainer",
            "display",
            "none"
          );
        }

        t.fallback(
          ["tarteaucitronInfoBox"],
          function (elem) {
            elem.style.display = "none";
          },
          true
        );

        if (t.reloadThePage === true) {
          window.location.reload();
        } else {
          t.userInterface.css(
            "tarteaucitronBack",
            "display",
            "none"
          );
        }
        if (document.getElementsByTagName("body")[0].classList !== undefined) {
          document
            .getElementsByTagName("body")[0]
            .classList.remove("tarteaucitron-modal-open");
        }

        //ie compatibility
        var tacClosePanelEvent;
        if (typeof Event === "function") {
          tacClosePanelEvent = new Event("tac.close_panel");
        } else if (typeof document.createEvent === "function") {
          tacClosePanelEvent = document.createEvent("Event");
          tacClosePanelEvent.initEvent("tac.close_panel", true, true);
        }
        //end ie compatibility

        if (typeof window.dispatchEvent === "function") {
          window.dispatchEvent(tacClosePanelEvent);
        }
      },
      focusTrap: function () {
        "use strict";

        var focusableEls, firstFocusableEl, lastFocusableEl, filtered;

        focusableEls = document
          .getElementById("tarteaucitron")
          .querySelectorAll("a[href], button");
        filtered = [];

        // get only visible items
        for (var i = 0, max = focusableEls.length; i < max; i++) {
          if (focusableEls[i].offsetHeight > 0) {
            filtered.push(focusableEls[i]);
          }
        }

        firstFocusableEl = filtered[0];
        lastFocusableEl = filtered[filtered.length - 1];

        //loop focus inside tarteaucitron
        document
          .getElementById("tarteaucitron")
          .addEventListener("keydown", function (evt) {
            if (evt.key === "Tab" || evt.keyCode === 9) {
              if (evt.shiftKey) {
                /* shift + tab */ if (
                  document.activeElement === firstFocusableEl
                ) {
                  lastFocusableEl.focus();
                  evt.preventDefault();
                }
              } /* tab */ else {
                if (document.activeElement === lastFocusableEl) {
                  firstFocusableEl.focus();
                  evt.preventDefault();
                }
              }
            }
          });
      },
      openAlert: function () {
        "use strict";
        var c = "tarteaucitron";
        t.userInterface.css(c + "Percentage", "display", "block");
        t.userInterface.css(c + "AlertSmall", "display", "none");
        t.userInterface.css(c + "Icon", "display", "none");
        t.userInterface.css(c + "AlertBig", "display", "block");
        t.userInterface.addClass(
          c + "Root",
          "tarteaucitronBeforeVisible"
        );

        //ie compatibility
        var tacOpenAlertEvent;
        if (typeof Event === "function") {
          tacOpenAlertEvent = new Event("tac.open_alert");
        } else if (typeof document.createEvent === "function") {
          tacOpenAlertEvent = document.createEvent("Event");
          tacOpenAlertEvent.initEvent("tac.open_alert", true, true);
        }
        //end ie compatibility

        if (document.getElementById("tarteaucitronAlertBig") !== null) {
          document.getElementById("tarteaucitronAlertBig").focus();
        }

        if (typeof window.dispatchEvent === "function") {
          window.dispatchEvent(tacOpenAlertEvent);
        }
      },
      closeAlert: function () {
        "use strict";
        var c = "tarteaucitron";
        t.userInterface.css(c + "Percentage", "display", "none");
        t.userInterface.css(c + "AlertSmall", "display", "block");
        t.userInterface.css(c + "Icon", "display", "block");
        t.userInterface.css(c + "AlertBig", "display", "none");
        t.userInterface.removeClass(
          c + "Root",
          "tarteaucitronBeforeVisible"
        );
        t.userInterface.jsSizing("box");

        //ie compatibility
        var tacCloseAlertEvent;
        if (typeof Event === "function") {
          tacCloseAlertEvent = new Event("tac.close_alert");
        } else if (typeof document.createEvent === "function") {
          tacCloseAlertEvent = document.createEvent("Event");
          tacCloseAlertEvent.initEvent("tac.close_alert", true, true);
        }
        //end ie compatibility

        if (typeof window.dispatchEvent === "function") {
          window.dispatchEvent(tacCloseAlertEvent);
        }
      },
      toggleCookiesList: function () {
        "use strict";
        var div = document.getElementById("tarteaucitronCookiesListContainer"),
          togglediv = document.getElementById("tarteaucitronCookiesNumber");

        if (div === null) {
          return;
        }

        if (div.style.display !== "block") {
          t.cookie.number();
          div.style.display = "block";
          togglediv.setAttribute("aria-expanded", "true");
          t.userInterface.jsSizing("cookie");
          t.userInterface.css("tarteaucitron", "display", "none");
          t.userInterface.css(
            "tarteaucitronBack",
            "display",
            "block"
          );
          t.fallback(
            ["tarteaucitronInfoBox"],
            function (elem) {
              elem.style.display = "none";
            },
            true
          );
        } else {
          div.style.display = "none";
          togglediv.setAttribute("aria-expanded", "false");
          t.userInterface.css("tarteaucitron", "display", "none");
          t.userInterface.css(
            "tarteaucitronBack",
            "display",
            "none"
          );
        }
      },
      toggle: function (id, closeClass) {
        "use strict";
        var div = document.getElementById(id);

        if (div === null) {
          return;
        }

        if (closeClass !== undefined) {
          t.fallback(
            [closeClass],
            function (elem) {
              if (elem.id !== id) {
                elem.style.display = "none";
              }
            },
            true
          );
        }

        if (div.style.display !== "block") {
          div.style.display = "block";
        } else {
          div.style.display = "none";
        }
      },
      order: function (id) {
        "use strict";
        var main = document.getElementById("tarteaucitronServices_" + id),
          allDivs,
          store = [],
          i;

        if (main === null) {
          return;
        }

        allDivs = main.childNodes;

        if (
          typeof Array.prototype.map === "function" &&
          typeof Enumerable === "undefined"
        ) {
          Array.prototype.map
            .call(main.children, Object)
            .sort(function (a, b) {
              //var mainChildren = Array.from(main.children);
              //mainChildren.sort(function (a, b) {
              if (
                t.services[a.id.replace(/Line/g, "")].name >
                t.services[b.id.replace(/Line/g, "")].name
              ) {
                return 1;
              }
              if (
                t.services[a.id.replace(/Line/g, "")].name <
                t.services[b.id.replace(/Line/g, "")].name
              ) {
                return -1;
              }
              return 0;
            })
            .forEach(function (element) {
              main.appendChild(element);
            });
        }
      },
      jsSizing: function (type) {
        "use strict";
        var scrollbarMarginRight = 10,
          scrollbarWidthParent,
          scrollbarWidthChild,
          servicesHeight,
          e = window,
          a = "inner",
          windowInnerHeight =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight,
          mainTop,
          mainHeight,
          closeButtonHeight,
          headerHeight,
          cookiesListHeight,
          cookiesCloseHeight,
          cookiesTitleHeight,
          paddingBox,
          alertSmallHeight,
          cookiesNumberHeight;

        if (type === "box") {
          if (
            document.getElementById("tarteaucitronAlertSmall") !== null &&
            document.getElementById("tarteaucitronCookiesNumber") !== null
          ) {
            // reset
            t.userInterface.css(
              "tarteaucitronCookiesNumber",
              "padding",
              "0px 10px"
            );

            // calculate
            alertSmallHeight = document.getElementById(
              "tarteaucitronAlertSmall"
            ).offsetHeight;
            cookiesNumberHeight = document.getElementById(
              "tarteaucitronCookiesNumber"
            ).offsetHeight;
            paddingBox = (alertSmallHeight - cookiesNumberHeight) / 2;

            // apply
            t.userInterface.css(
              "tarteaucitronCookiesNumber",
              "padding",
              paddingBox + "px 10px"
            );
          }
        } else if (type === "main") {
          // get the real window width for media query
          if (window.innerWidth === undefined) {
            a = "client";
            e = document.documentElement || document.body;
          }

          // height of the services list container
          if (
            document.getElementById("tarteaucitron") !== null &&
            document.getElementById("tarteaucitronClosePanel") !== null &&
            document.getElementById("tarteaucitronMainLineOffset") !== null
          ) {
            // reset
            t.userInterface.css(
              "tarteaucitronServices",
              "height",
              "auto"
            );

            // calculate
            mainHeight = document.getElementById("tarteaucitron").offsetHeight;
            closeButtonHeight = document.getElementById(
              "tarteaucitronClosePanel"
            ).offsetHeight;

            // apply
            servicesHeight = mainHeight - closeButtonHeight + 2;
            t.userInterface.css(
              "tarteaucitronServices",
              "height",
              servicesHeight + "px"
            );
            t.userInterface.css(
              "tarteaucitronServices",
              "overflow-x",
              "auto"
            );
          }

          // align the main allow/deny button depending on scrollbar width
          if (
            document.getElementById("tarteaucitronServices") !== null &&
            document.getElementById("tarteaucitronScrollbarChild") !== null
          ) {
            // media query
            if (e[a + "Width"] <= 479) {
              //t.userInterface.css('tarteaucitronScrollbarAdjust', 'marginLeft', '11px');
            } else if (e[a + "Width"] <= 767) {
              scrollbarMarginRight = 12;
            }

            scrollbarWidthParent = document.getElementById(
              "tarteaucitronServices"
            ).offsetWidth;
            scrollbarWidthChild = document.getElementById(
              "tarteaucitronScrollbarChild"
            ).offsetWidth;
            //t.userInterface.css('tarteaucitronScrollbarAdjust', 'marginRight', ((scrollbarWidthParent - scrollbarWidthChild) + scrollbarMarginRight) + 'px');
          }

          // center the main panel
          if (document.getElementById("tarteaucitron") !== null) {
            // media query
            if (e[a + "Width"] <= 767) {
              mainTop = 0;
            } else {
              mainTop =
                (windowInnerHeight -
                  document.getElementById("tarteaucitron").offsetHeight) /
                  2 -
                21;
            }

            if (
              document.getElementById("tarteaucitronMainLineOffset") !== null
            ) {
              if (
                document.getElementById("tarteaucitron").offsetHeight <
                windowInnerHeight / 2
              ) {
                mainTop -= document.getElementById(
                  "tarteaucitronMainLineOffset"
                ).offsetHeight;
              }
            }

            // correct
            if (mainTop < 0) {
              mainTop = 0;
            }

            // apply
            t.userInterface.css(
              "tarteaucitron",
              "top",
              mainTop + "px"
            );
          }
        } else if (type === "cookie") {
          // put cookies list at bottom
          if (document.getElementById("tarteaucitronAlertSmall") !== null) {
            t.userInterface.css(
              "tarteaucitronCookiesListContainer",
              "bottom",
              document.getElementById("tarteaucitronAlertSmall").offsetHeight +
                "px"
            );
          }

          // height of cookies list
          if (
            document.getElementById("tarteaucitronCookiesListContainer") !==
            null
          ) {
            // reset
            t.userInterface.css(
              "tarteaucitronCookiesList",
              "height",
              "auto"
            );

            // calculate
            cookiesListHeight = document.getElementById(
              "tarteaucitronCookiesListContainer"
            ).offsetHeight;
            cookiesCloseHeight = document.getElementById(
              "tarteaucitronClosePanelCookie"
            ).offsetHeight;
            cookiesTitleHeight = document.getElementById(
              "tarteaucitronCookiesTitle"
            ).offsetHeight;

            // apply
            t.userInterface.css(
              "tarteaucitronCookiesList",
              "height",
              cookiesListHeight -
                cookiesCloseHeight -
                cookiesTitleHeight -
                2 +
                "px"
            );
          }
        }
      },
    },
    cookie: {
      owner: {},
      create: function (key, status) {
        "use strict";

        if (tarteaucitronForceExpire !== "") {
          // The number of day(s)/hour(s) can't be higher than 1 year
          if (
            (tarteaucitronExpireInDay && tarteaucitronForceExpire < 365) ||
            (!tarteaucitronExpireInDay && tarteaucitronForceExpire < 8760)
          ) {
            if (tarteaucitronExpireInDay) {
              // Multiplication to tranform the number of days to milliseconds
              timeExpire = tarteaucitronForceExpire * 86400000;
            } else {
              // Multiplication to tranform the number of hours to milliseconds
              timeExpire = tarteaucitronForceExpire * 3600000;
            }
          }
        }

        var d = new Date(),
          time = d.getTime(),
          expireTime = time + timeExpire, // 365 days
          regex = new RegExp("!" + key + "=(wait|true|false)", "g"),
          cookie = t.cookie.read().replace(regex, ""),
          value =
            t.parameters.cookieName +
            "=" +
            cookie +
            "!" +
            key +
            "=" +
            status,
          domain =
            t.parameters.cookieDomain !== undefined &&
            t.parameters.cookieDomain !== ""
              ? "; domain=" + t.parameters.cookieDomain
              : "",
          secure = location.protocol === "https:" ? "; Secure" : "";

        d.setTime(expireTime);
        document.cookie =
          value +
          "; expires=" +
          d.toGMTString() +
          "; path=/" +
          domain +
          secure +
          "; samesite=lax";
      },
      read: function () {
        "use strict";
        var nameEQ = t.parameters.cookieName + "=",
          ca = document.cookie.split(";"),
          i,
          c;

        for (i = 0; i < ca.length; i += 1) {
          c = ca[i];
          while (c.charAt(0) === " ") {
            c = c.substring(1, c.length);
          }
          if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
          }
        }
        return "";
      },
      purge: function (arr) {
        "use strict";
        var i;

        for (i = 0; i < arr.length; i += 1) {
          var rgxpCookie = new RegExp(
            "^(.*;)?\\s*" + arr[i] + "\\s*=\\s*[^;]+(.*)?$"
          );
          if (document.cookie.match(rgxpCookie)) {
            document.cookie =
              arr[i] + "=; expires=Thu, 01 Jan 2000 00:00:00 GMT; path=/;";
            document.cookie =
              arr[i] +
              "=; expires=Thu, 01 Jan 2000 00:00:00 GMT; path=/; domain=." +
              location.hostname +
              ";";
            document.cookie =
              arr[i] +
              "=; expires=Thu, 01 Jan 2000 00:00:00 GMT; path=/; domain=." +
              location.hostname.split(".").slice(-2).join(".") +
              ";";
          }
        }
      },
      checkCount: function (key) {
        "use strict";
        var arr = t.services[key].cookies,
          nb = arr.length,
          nbCurrent = 0,
          html = "",
          i,
          status = document.cookie.indexOf(key + "=true");

        if (status >= 0 && nb === 0) {
          html += t.lang.useNoCookie;
        } else if (status >= 0) {
          for (i = 0; i < nb; i += 1) {
            if (document.cookie.indexOf(arr[i] + "=") !== -1) {
              nbCurrent += 1;
              if (t.cookie.owner[arr[i]] === undefined) {
                t.cookie.owner[arr[i]] = [];
              }
              if (
                t.cookie.crossIndexOf(
                  t.cookie.owner[arr[i]],
                  t.services[key].name
                ) === false
              ) {
                t.cookie.owner[arr[i]].push(
                  t.services[key].name
                );
              }
            }
          }

          if (nbCurrent > 0) {
            html +=
              t.lang.useCookieCurrent + " " + nbCurrent + " cookie";
            if (nbCurrent > 1) {
              html += "s";
            }
            html += ".";
          } else {
            html += t.lang.useNoCookie;
          }
        } else if (nb === 0) {
          html = t.lang.noCookie;
        } else {
          html += t.lang.useCookie + " " + nb + " cookie";
          if (nb > 1) {
            html += "s";
          }
          html += ".";
        }

        if (document.getElementById("tacCL" + key) !== null) {
          document.getElementById("tacCL" + key).innerHTML = html;
        }
      },
      crossIndexOf: function (arr, match) {
        "use strict";
        var i;
        for (i = 0; i < arr.length; i += 1) {
          if (arr[i] === match) {
            return true;
          }
        }
        return false;
      },
      number: function () {
        "use strict";
        var cookies = document.cookie.split(";"),
          nb = document.cookie !== "" ? cookies.length : 0,
          html = "",
          i,
          name,
          namea,
          nameb,
          c,
          d,
          s = nb > 1 ? "s" : "",
          savedname,
          regex = /^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i,
          regexedDomain =
            t.cdn.match(regex) !== null
              ? t.cdn.match(regex)[1]
              : t.cdn,
          host =
            t.domain !== undefined
              ? t.domain
              : regexedDomain;

        cookies = cookies.sort(function (a, b) {
          namea = a.split("=", 1).toString().replace(/ /g, "");
          nameb = b.split("=", 1).toString().replace(/ /g, "");
          c =
            t.cookie.owner[namea] !== undefined
              ? t.cookie.owner[namea]
              : "0";
          d =
            t.cookie.owner[nameb] !== undefined
              ? t.cookie.owner[nameb]
              : "0";
          if (c + a > d + b) {
            return 1;
          }
          if (c + a < d + b) {
            return -1;
          }
          return 0;
        });

        if (document.cookie !== "") {
          for (i = 0; i < nb; i += 1) {
            name = cookies[i].split("=", 1).toString().replace(/ /g, "");
            if (
              t.cookie.owner[name] !== undefined &&
              t.cookie.owner[name].join(" // ") !== savedname
            ) {
              savedname = t.cookie.owner[name].join(" // ");
              html += '<div class="tarteaucitronHidden">';
              html +=
                '     <span class="tarteaucitronTitle tarteaucitronH3" role="heading" aria-level="3">';
              html +=
                "        " + t.cookie.owner[name].join(" // ");
              html += "    </span>";
              html += '</div><ul class="cookie-list">';
            } else if (
              t.cookie.owner[name] === undefined &&
              host !== savedname
            ) {
              savedname = host;
              html += '<div class="tarteaucitronHidden">';
              html +=
                '     <span class="tarteaucitronTitle tarteaucitronH3" role="heading" aria-level="3">';
              html += "        " + host;
              html += "    </span>";
              html += '</div><ul class="cookie-list">';
            }
            html += '<li class="tarteaucitronCookiesListMain">';
            html +=
              '    <div class="tarteaucitronCookiesListLeft"><button type="button" class="purgeBtn" data-cookie="' +
              t.fixSelfXSS(cookies[i].split("=", 1)) +
              '"><strong>&times;</strong></button> <strong>' +
              t.fixSelfXSS(name) +
              "</strong>";
            html += "    </div>";
            html +=
              '    <div class="tarteaucitronCookiesListRight">' +
              t.fixSelfXSS(
                cookies[i].split("=").slice(1).join("=")
              ) +
              "</div>";
            html += "</li>";
          }
          html += "</ul>";
        } else {
          html += '<div class="tarteaucitronCookiesListMain">';
          html +=
            '    <div class="tarteaucitronCookiesListLeft"><strong>-</strong></div>';
          html += '    <div class="tarteaucitronCookiesListRight"></div>';
          html += "</div>";
        }

        html +=
          '<div class="tarteaucitronHidden tarteaucitron-spacer-20"></div>';

        if (document.getElementById("tarteaucitronCookiesList") !== null) {
          document.getElementById("tarteaucitronCookiesList").innerHTML = html;
        }

        if (document.getElementById("tarteaucitronCookiesNumber") !== null) {
          document.getElementById("tarteaucitronCookiesNumber").innerHTML = nb;
          document
            .getElementById("tarteaucitronCookiesNumber")
            .setAttribute(
              "aria-label",
              nb + " cookie" + s + " - " + t.lang.toggleInfoBox
            );
          document
            .getElementById("tarteaucitronCookiesNumber")
            .setAttribute(
              "title",
              nb + " cookie" + s + " - " + t.lang.toggleInfoBox
            );
        }

        if (document.getElementById("tarteaucitronCookiesNumberBis") !== null) {
          document.getElementById("tarteaucitronCookiesNumberBis").innerHTML =
            nb + " cookie" + s;
        }

        var purgeBtns = document.getElementsByClassName("purgeBtn");
        for (i = 0; i < purgeBtns.length; i++) {
          t.addClickEventToElement(purgeBtns[i], function () {
            t.cookie.purge([this.dataset.cookie]);
            t.cookie.number();
            t.userInterface.jsSizing("cookie");
            return false;
          });
        }

        for (i = 0; i < t.job.length; i += 1) {
          t.cookie.checkCount(t.job[i]);
        }
      },
    },
    fixSelfXSS: function (html) {
      return html
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },
    getLanguage: function () {
      "use strict";

      if (t.tarteaucitronForceLanguage !== "") {
        if (t.availableLanguages.indexOf(t.tarteaucitronForceLanguage) !== -1) {
          return t.tarteaucitronForceLanguage;
        }
      }

      // get the html lang
      if (
        t.availableLanguages.indexOf(
          document.documentElement.getAttribute("lang").substr(0, 2)
        ) !== -1
      ) {
        return document.documentElement.getAttribute("lang").substr(0, 2);
      }

      if (!navigator) {
        return t.defaultLanguage;
      }

      var lang =
          navigator.language ||
          navigator.browserLanguage ||
          navigator.systemLanguage ||
          navigator.userLang ||
          null,
        userLanguage = lang ? lang.substr(0, 2) : null;

      if (t.availableLanguages.indexOf(userLanguage) !== -1) {
        return userLanguage;
      }

      return t.defaultLanguage;
    },
    getLocale: function () {
      "use strict";
      if (!navigator) {
        return "en_US";
      }

      var lang =
          navigator.language ||
          navigator.browserLanguage ||
          navigator.systemLanguage ||
          navigator.userLang ||
          null,
        userLanguage = lang ? lang.substr(0, 2) : null;

      if (userLanguage === "fr") {
        return "fr_FR";
      } else if (userLanguage === "en") {
        return "en_US";
      } else if (userLanguage === "de") {
        return "de_DE";
      } else if (userLanguage === "es") {
        return "es_ES";
      } else if (userLanguage === "it") {
        return "it_IT";
      } else if (userLanguage === "pt") {
        return "pt_PT";
      } else if (userLanguage === "nl") {
        return "nl_NL";
      } else if (userLanguage === "el") {
        return "el_EL";
      } else {
        return "en_US";
      }
    },
    addScript: function (url, id, callback, execute, attrName, attrVal) {
      "use strict";
      var script,
        done = false;

      if (execute === false) {
        if (typeof callback === "function") {
          callback();
        }
      } else {
        script = document.createElement("script");
        script.id = id !== undefined ? id : "";
        script.async = true;
        script.src = url;

        if (attrName !== undefined && attrVal !== undefined) {
          script.setAttribute(attrName, attrVal);
        }

        if (typeof callback === "function") {
          script.onreadystatechange = script.onload = function () {
            var state = script.readyState;
            if (!done && (!state || /loaded|complete/.test(state))) {
              done = true;
              callback();
            }
          };
        }

        document.getElementsByTagName("head")[0].appendChild(script);
      }
    },
    addInternalScript: function (
      url,
      id,
      callback,
      execute,
      attrName,
      attrVal
    ) {
      if (!t.parameters.useExternalJs) {
        t.addScript(url, id, callback, execute, attrName, attrVal);
      }
    },
    checkIfExist: function (elemId) {
      "use strict";
      return (
        document.getElementById(elemId) !== null &&
        document.getElementById(elemId).offsetWidth !== 0 &&
        document.getElementById(elemId).offsetHeight !== 0
      );
    },
    makeAsync: {
      antiGhost: 0,
      buffer: "",
      init: function (url, id) {
        "use strict";
        var savedWrite = document.write,
          savedWriteln = document.writeln;

        document.write = function (content) {
          t.makeAsync.buffer += content;
        };
        document.writeln = function (content) {
          t.makeAsync.buffer += content.concat("\n");
        };

        setTimeout(function () {
          document.write = savedWrite;
          document.writeln = savedWriteln;
        }, 20000);

        t.makeAsync.getAndParse(url, id);
      },
      getAndParse: function (url, id) {
        "use strict";
        if (t.makeAsync.antiGhost > 9) {
          t.makeAsync.antiGhost = 0;
          return;
        }
        t.makeAsync.antiGhost += 1;
        t.addInternalScript(url, "", function () {
          if (document.getElementById(id) !== null) {
            document.getElementById(id).innerHTML +=
              "<span class='tarteaucitron-display-none'>&nbsp;</span>" +
              t.makeAsync.buffer;
            t.makeAsync.buffer = "";
            t.makeAsync.execJS(id);
          }
        });
      },
      // not strict because third party scripts may have errors 
      execJS: function (id) {        
        var i, scripts, childId, type;
        if (document.getElementById(id) === null) {
          return;
        }

        scripts = document.getElementById(id).getElementsByTagName("script");
        for (i = 0; i < scripts.length; i += 1) {
          type =
            scripts[i].getAttribute("type") !== null
              ? scripts[i].getAttribute("type")
              : "";
          if (type === "") {
            type =
              scripts[i].getAttribute("language") !== null
                ? scripts[i].getAttribute("language")
                : "";
          }
          if (
            scripts[i].getAttribute("src") !== null &&
            scripts[i].getAttribute("src") !== ""
          ) {
            childId = id + Math.floor(Math.random() * 99999999999);
            document.getElementById(id).innerHTML +=
              '<div id="' + childId + '"></div>';
            t.makeAsync.getAndParse(
              scripts[i].getAttribute("src"),
              childId
            );
          } else if (type.indexOf("javascript") !== -1 || type === "") {
            eval(scripts[i].innerHTML);
          }
        }
      },
    },
    fallback: function (matchClass, content, noInner) {
      "use strict";
      var elems = document.getElementsByTagName("*"),
        i,
        index = 0;

      for (i in elems) {
        if (elems[i] !== undefined) {
          for (index = 0; index < matchClass.length; index += 1) {
            if (
              (" " + elems[i].className + " ").indexOf(
                " " + matchClass[index] + " "
              ) > -1
            ) {
              if (typeof content === "function") {
                if (noInner === true) {
                  content(elems[i]);
                } else {
                  elems[i].innerHTML = content(elems[i]);
                }
              } else {
                elems[i].innerHTML = content;
              }
            }
          }
        }
      }
    },
    engage: function (id) {
      "use strict";
      var html = "",
        r = Math.floor(Math.random() * 100000),
        engage =
          t.services[id].name + " " + t.lang.fallback;

      if (t.lang["engage-" + id] !== undefined) {
        engage = t.lang["engage-" + id];
      }

      html += '<div class="tac_activate tac_activate_' + id + '">';
      html += '   <div class="tac_float">';
      html += "      " + engage;
      html +=
        '      <button type="button" class="tarteaucitronAllow" id="Eng' +
        r +
        "ed" +
        id +
        '">';
      html +=
        '          <span class="tarteaucitronCheck" aria-hidden="true"></span> ' +
        t.lang.allow;
      html += "       </button>";
      html += "   </div>";
      html += "</div>";

      return html;
    },
    extend: function (a, b) {
      "use strict";
      var prop;
      for (prop in b) {
        if (b.hasOwnProperty(prop)) {
          a[prop] = b[prop];
        }
      }
    },
    proTemp: "",
    proTimer: function () {
      "use strict";
      setTimeout(
        t.proPing,
        Math.floor(Math.random() * (1200 - 500 + 1)) + 500
      );
    },
    pro: function (list) {
      "use strict";
      t.proTemp += list;
      clearTimeout(t.proTimer);
      t.proTimer = setTimeout(
        t.proPing,
        Math.floor(Math.random() * (1200 - 500 + 1)) + 500
      );
    },
    proPing: function () {
      "use strict";
      if (
        t.uuid !== "" &&
        t.uuid !== undefined &&
        t.proTemp !== "" &&
        tarteaucitronStatsEnabled
      ) {
        var div = document.getElementById("tarteaucitronPremium"),
          timestamp = new Date().getTime(),
          url = "https://t.io/log/?";

        if (div === null) {
          return;
        }

        url += "account=" + t.uuid + "&";
        url += "domain=" + t.domain + "&";
        url += "status=" + encodeURIComponent(t.proTemp) + "&";
        url += "_time=" + timestamp;

        div.innerHTML =
          '<img src="' + url + '" class="tarteaucitron-display-none" alt="" />';

        t.proTemp = "";
      }

      t.cookie.number();
    },
    //  Utility function to Add or update the fields of obj1 with the ones in obj2
    AddOrUpdate: function (source, custom) {      
      for (var key in custom) {
        if (custom[key] instanceof Object) {
          source[key] = t.AddOrUpdate(source[key], custom[key]);
        } else {
          source[key] = custom[key];
        }
      }
      return source;
    },
    getElemWidth: function (elem) {
      return elem.getAttribute("width") || elem.clientWidth;
    },
    getElemHeight: function (elem) {
      return elem.getAttribute("height") || elem.clientHeight;
    },
    getElemAttr: function (elem, attr) {
      return elem.getAttribute("data-" + attr) || elem.getAttribute(attr);
    },
    addClickEventToId: function (elemId, func) {
      t.addClickEventToElement(
        document.getElementById(elemId),
        func
      );
    },
    addClickEventToElement: function (e, func) {
      if (e) {
        if (e.addEventListener) {
          e.addEventListener("click", func);
        } else {
          e.attachEvent("onclick", func);
        }
      }
    },
    triggerJobsAfterAjaxCall: function () {
      t.job.forEach(function (e) {
        t.job.push(e);
      });
      var i;
      var allowBtns = document.getElementsByClassName("tarteaucitronAllow");
      for (i = 0; i < allowBtns.length; i++) {
        t.addClickEventToElement(allowBtns[i], function () {
          t.userInterface.respond(this, true);
        });
      }
      var denyBtns = document.getElementsByClassName("tarteaucitronDeny");
      for (i = 0; i < denyBtns.length; i++) {
        t.addClickEventToElement(denyBtns[i], function () {
          t.userInterface.respond(this, false);
        });
      }
    },
  };

  return t;
})();
