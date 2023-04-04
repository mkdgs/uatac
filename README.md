Une Autre Tarte Au Citron was tarteaucitron 

The european cookie law regulates the management of cookies and you should ask your visitors their consent before exposing them to third party services.

Clearly this script will:
- Disable all services by default,
- Display a banner on the first page view and a small one on other pages,
- Display a panel to allow or deny each services one by one,
- Store the consent in a cookie for 365 days.

Bonus:
- Load service when user click on Allow (without reload of the page),
- Incorporate a fallback system (display a link instead of social button and a static banner instead of advertising).



# How to use

```diff
<script src="/tarteaucitron/tarteaucitron.js"></script>

<script>
tarteaucitron.init({
    "privacyUrl": "", /* Privacy policy url */
    "bodyPosition": "bottom", /* or top to bring it as first element for accessibility */

    "hashtag": "#tarteaucitron", /* Open the panel with this hashtag */
    "cookieName": "tarteaucitron", /* Cookie name */

    "orientation": "middle", /* Banner position (top - bottom - middle - popup) */

    "groupServices": false, /* Group services by category */
    "serviceDefaultState": "wait", /* Default state (true - wait - false) */

    "showAlertSmall": false, /* Show the small banner on bottom right */
    "cookieslist": false, /* Show the cookie list */
    
    "showIcon": true, /* Show cookie icon to manage cookies */
    // "iconSrc": "", /* Optionnal: URL or base64 encoded image */
    "iconPosition": "BottomRight", /* Position of the icon between BottomRight, BottomLeft, TopRight and TopLeft */

    "adblocker": false, /* Show a Warning if an adblocker is detected */

    "DenyAllCta" : true, /* Show the deny all button */
    "AcceptAllCta" : true, /* Show the accept all button when highPrivacy on */
    "highPrivacy": true, /* HIGHLY RECOMMANDED Disable auto consent */

    "handleBrowserDNTRequest": false, /* If Do Not Track == 1, disallow all */

    -"removeCredit": false, /* Remove credit link */
    -"moreInfoLink": true, /* Show more info link */
    "useExternalCss": false, /* If false, the tarteaucitron.css file will be loaded */
    -"useExternalJs": false, /* If false, the tarteaucitron.services.js file will be loaded */
    +"servicesJs": '<?php echo $this->url ?>../js/services.js', /* If false, the tarteaucitron.services.js file will be loaded */
    +"useExternalLang": false,  /* If false, the tarteaucitron lang file will be loaded */

    //"cookieDomain": ".my-multisite-domaine.fr", /* Shared cookie for subdomain website */

    -"readmoreLink": "", /* Change the default readmore link pointing to tarteaucitron.io */
    
    "mandatory": true, /* Show a message about mandatory cookies */
    "mandatoryCta": true /* Show the disabled accept button when mandatory on */
});
</script>
```


# Customization

## Create custom service
```js
tarteaucitron.services.mycustomservice = {
  "key": "mycustomservice",
  "type": "ads|analytic|api|comment|other|social|support|video",
  "name": "MyCustomService",
  "needConsent": true,
  "cookies": ['cookie', 'cookie2'],
  "readmoreLink": "/custom_read_more", // If you want a readmore link
  "js": function () {
    "use strict";
    // When user allow cookie
  },
  "fallback": function () {
    "use strict";
    // when use deny cookie
  }
};
```

## Events

The following events are available:
* (document) `{SERVICE_KEY}_added` for each enabled service
* (document) `{SERVICE_KEY}_loaded` for each enabled service
* (document) `{SERVICE_KEY}_allowed` for each service when allowed
* (document) `{SERVICE_KEY}_disallowed ` for each service when disallowed

* (window) `tac.root_available`: the root element with panel has been created, services will be loaded
* (window) `tac.open_alert`
* (window) `tac.close_alert`
* (window) `tac.open_panel`
* (window) `tac.close_panel`

## Customize text

To change a translation, use `tarteaucitronCustomText` variable. It will be merge with the translation shipping with TAC. This variable must be defined before the initialization. For example:
```js
tarteaucitronCustomText = {
  'support': {
    'title': 'Support client',
  },
  'close': 'Enregistrer et fermer',
};
tarteaucitron.init(...);
```

There is a special case for engagement text. By the default, the engagement text is  _{SERVICE_NAME} is disabled._, however you can change it per service. For example:
```js
tarteaucitronCustomText = {
  'engage-twitter': 'Follow us on Twitter!'
};
```
