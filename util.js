function getLanguage() {
  var lang = "un"; 
  if (navigator.language!=null)
  {
      lang = navigator.language;
  } else if (navigator.userLanguage!=null) { 
      lang = navigator.userLanguage;
  } else if (navigator.systemLanguage!=null) {
      lang = navigator.systemLanguage;
  } else { 
      lang="un";
  }
  lang = lang.toLowerCase(); 
  lang = lang.substring(0, 2);
  console.log('lang = ' + lang );
  return lang;
}
function gwtIOSVersion(uagent) {
  if (!uagent) uagent = navigator.userAgent || navigator.vendor || window.opera;
  const osVersion = /OS (\d+)_\d+(_\d+)?/.exec(uagent);
  if (osVersion && osVersion[1]) {
      return Number(osVersion[1]);
  }
  return undefined;
}

function getOS() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/android/i.test(userAgent)) return 'AOS';
  if (/(iphone|ipad|ipod)/i.test(userAgent)) return 'IOS';
  if (/(macintosh|mac os x)/i.test(userAgent)) return 'MAC';
  if (/(webos|blackberry|iemobile|opera mini|mobile|windows phone)/i.test(userAgent)) return 'ETC';
  if (/(windows|win)/i.test(userAgent)) return 'WIN';
  return 'Unknown';
}
