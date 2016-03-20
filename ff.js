function addNewItem(ret)
{
   var ro = $.parseJSON(ret);
   $('#working').hide();
   if (!ret)
      return;
   if (ro.success)
   {
      $('#feedbody').prepend(ro.text);
      fixNewStatus(ro.sid);
      // Bump the getlatest ID so this does not provoke an update
      //newsfeed = parseInt(a[1]);;
   }
   else
   {
      alert(ro.errmsg);
   }

   $('#status').val("");
   $('#file').val("");
}

function fixNewStatus(sid)
{
   var item = $('#postpart'+sid);
   item.css("cursor", "pointer");
   item.click(function(e) { feedItemClick(e, sid, false); });
   item = $('#pthumb'+sid);
   item.css("cursor", "pointer");
   item.click(function(e) { ownerClick(e, userInfo.id); });
   item = $('#ospan'+sid);
   item.css("cursor", "pointer");
   item.click(function(e) { ownerClick(e, userInfo.id); });
}

function updateLabel(n)
{
   var id, lab, hid="";;
   switch (n)
   {
      case 0:
         id = "rmug";
         lab = "rmuglabel";
         break;
      case 1:
         id = "expic";
         lab = "excflabel";
         hid = "exppic";
         break;
      case 2:
         id = "exmug";
         lab = "exmuglabel";
         hid = "exmpic"
         break;
      default:
         return;
   }

   var cf = document.getElementById(id).value;
   var a = cf.split('.');
   var l = a[0].length;
   var short = (l > 10)? a[0].substr(l-10):a[0];
   $('#'+lab).html(short+" ?");
   $('#'+lab).attr("title", cf+" - click again to choose another.");
   if (n > 0)
      $('#'+hid).val("Y");
}

function submitNewItem()
{
   postContext.text = $('#status_te').val();
   if (!postContext.text.length)
   {
      alert("Your post has no text");
      return false;
   }
   $('#enter_status').hide();
   $('#invite_status').show();
   // Save the post until it has been added to the database
   // to avoid slashes
   postContext.text = text2html($('#status_te').val());
   $('#status_te').val(postContext.text);
   $('#contribid').val(userInfo.id);
   $('#slogtype').val(1);
   $('#status_form').submit();
   $('#working').show();
   return true;
}

function busy(b)
{
   if (b)
      $('#working').show();
   else
      $('#working').hide();
}

function extraSaved(rv)
{
   // Wrap it in a div, then on the div do
   function clearFileInput(tagId) {
       document.getElementById(tagId).innerHTML =
                       document.getElementById(tagId).innerHTML;
   }
   // Back to square one
   var ro = $.parseJSON(rv);
   if (!ro.success)
   {
      alert(ro.errmsg);
      return;
   }
   document.getElementById('extra_form').reset();
   $('#exppic').val("N");
   $('#exmpic').val("N");
   clearFileInput("expic");
   $('#excflabel').html("Choose");
   clearFileInput("exmug");
   $('#exmuglabel').html("Choose");
   $('#individual').attr("data-loaded", "N");
   switch2indi(userInfo.id);
}

function submitExtra()
{
   $('#extra_form').submit();
   return true;
}

function showEnterStatus(yes)
{
   if (yes)
   {
      $('#invite_status').hide();
      $('#selectspan').hide();
      $('#enter_status').show();
      $('#status_te').focus();
   }
   else
   {
      $('#enter_status').hide();
      $('#invite_status').show();
      $('#selectspan').show();
   }
}

function revertDlg()
{
   $('#dlgcontainer').hide();
   $('#therest').show();
}

function setFeedQS()
{
   var months = { "jan": 0, "feb": 1, "mar": 2, "apr": 3, "may": 4, "jun": 5, "jul": 6, "aug": 7, "sep": 8, "oct": 9, "nov": 10, "dec": 11 };
   var which;
   var my;
   var month;
   var year;

   function testCheck(el, i, a)
   {
      if ($('#'+el).is(":checked"))
         which = el.substr(3);
   }

   function parseMY()
   {
      var a = my.split(" ");
      var ms = a[0];
      var ys = a[1].trim();
      if (ms.length < 3)
         return "Bad month - less than three chars.";
      ms = ms.substr(0, 3);
      ms = ms.toLowerCase();
      if (!months.hasOwnProperty(ms))
         return "Unrecognized month?";
      month = months[ms];
      if (ys.length != 4)
         return "Year is not 4 digits.";
      year = parseInt(ys);
      if (year == NaN)
         return "Year is not a number.";
      if (year < 2016 || year > 2050)
         return "Year out of range?";
      return "";
   }

   [ "fs_latest", "fs_oldest", "fs_range"].forEach(testCheck);
   if (which == "range")
   {
      $('#feedselect').attr("data-checked", "fs_range");
      my = $('#fs_monthyear').val()
      if (my == "")
      {
         alert("You selected Month/Year,\nbut did not enter a value");
         return;
      }
      var err = parseMY();
      if (err != "")
      {
         alert(err);
         return;
      }
      var t1 = new Date(year, month, 1);
      t1 = t1.getTime()/1000;
      if (month == 11) { month = 0; year++;}
      else month++;
      var t2 = new Date(year, month, 1);
      t2 = t2.getTime()/1000;
      $('#feedselect').attr("data-qs", "&rt=range&lb="+t1+"&ub="+t2);
      var t = my.substr(0,1).toUpperCase();
      t += my.substr(1);
      $('#selectspan').html(t);
   }
   else if (which == "latest")
   {
      $('#feedselect').attr("data-checked", "fs_latest");
      $('#feedselect').attr("data-qs", "&rt=latest");
      $('#selectspan').html("Latest");
   }
   else
   {
      $('#feedselect').attr("data-checked", "fs_oldest");
      $('#feedselect').attr("data-qs", "&rt=oldest");
      $('#selectspan').html("Oldest");
   }
   $('#feed').attr("data-loaded", "N");
   switch2feed();
}

function doAddComment()
{
   $('#pwait'+commentContext.id).show();
   var text = commentContext.text;
   commentContext.text = "";
   text = $.trim(text);
   text = text2html(text);

   var url = "nfcomment.php?sid="+commentContext.id+"&logtype="+userInfo.logType+"&id="+userInfo.id+"&text="+escape(text);
   $.get(url, function(msg) {
      var ro = $.parseJSON(msg);
      if (!ro.success)
      {
         alert(ro.errmsg);
         $('#pwait'+commentContext.id).hide();
         return;
      }
      var cid = ro.cid;
      // This will cause scrolling and there's a bug in the Android browser.
      $('#therest').css("overflow", "hidden");
      var s = ro.text;
      commentContext.lastp.before(s);
      var it = $('#commentdiv'+cid);
      it.css("cursor", "pointer");
      it.click(function(e) { feedItemClick(e, cid, true); });
      it = $('#cthumb'+cid);
      it.css("cursor", "pointer");
      it.click(function(e) { ownerClick(e, cid, true); });
      it = $('#ocspan'+cid);
      it.css("cursor", "pointer");
      it.click(function(e) { ownerClick(e, cid, true); });
      //comments = parseInt(cid);
      $('#pwait'+commentContext.id).hide();
      // Restore sanity
      $('#therest').css("overflow", "scroll");
      $(window).scrollTop(savedposition);
   });
}

function handleComment(how)
{
   $('#dlgcontainer').hide();
   $('#therest').show();
   if (how) {
      commentContext.text = $('#ecta').val();
      doAddComment();
   }
   else
      scrollToSaved();
   $('#ecta').val("");
}

function addComment(itemId)
{
   commentContext.id = itemId;
   //sid = itemId;
   itemIdx = "#post"+itemId;
   commentContext.lastp = $(itemIdx).find('.sentinel').last();
   savedposition = $(window).scrollTop();
   $('#therest').hide();
   $('#dlgcontainer').show();
   mexDlgShow('ecdiv');
   $('#ecta').focus();
}

function nowAsISO(){
 function pad(n){return n<10 ? '0'+n : n}
 var d = new Date();
 return '('+d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+' '
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+')'

}
function getKey()
{
   return localStorage.getItem("ff:gpkey");
}

function escB64(s)
{
   return s.replace(/\x2b/g, '%2B').replace(/\x2f/g, '%2F').replace(/\x3d/g, '%3D');
}

function text2html(text)
{
   function doLinks(t)
   {
      var a = t.match(/{L[^}]+L}/g);
      if (a) {
         for (var i = 0; i < a.length; i++)
         {
            l = a[i].length-4;
            ts2 = a[i].substr(2,l);
            ts2 = trim(ts2);
            var pos = ts2.indexOf(" ");
            if (pos < 0)
               t = t.replace(a[i], "");
            else
            {
               var url = ts2.substr(0,pos);
               var rest = ts2.substr(pos+1);
               t = t.replace(a[i], '<a href="'+url+'">'+rest+'</a>');
            }
         }
      }
      return t;
   }

   // Look for embedded HTML - currently just one block
   var hasHtml =false;
   var spos = text.search(/{!/);
   var epos;
   var boxed = false;
   if (spos >= 0)
   {
      hasHtml = true;
      epos = text.search(/!}/);
      if (epos < 0)
         hasHtml = false;
      else
      {
         if (text.substr(spos+2) == '|')
            boxed = true;
      }
   }
   var n = boxed? 3: 2;
   var html = text.substring(spos+n, epos);
   var t1 = hasHtml? text.substr(0, spos): text;
   var t2 = hasHtml? text.substr(epos+2): "";
   if (hasHtml)
   {
      t1 = t1
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;');
      t1 = t1.replace(/\n\n/g, '<p>');
      t1 = t1.replace(/\n/g, "<br>");
      t2 = t2
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;');
      t2 = t2.replace(/\n\n/g, '<p>');
      t2 = t2.replace(/\n/g, "<br>");
   }
   else
   {
      text = text
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;');
      text = text.replace(/\n\n/g, '<p>');
      text = text.replace(/\n/g, "<br>");
   }
   var a = text.match(/{T.+T}/g);
   if (a)
   {
      var last = a.length-1;
      var l = a[last].length-4;
      var ts = a[last].substr(2,l);
      ts = trim(ts);
      for (var i = 0; i < a.length; i++)
         text = text.replace(a[i], "");
      text = "<h3>"+ts+"</h3>" + text;
   }

   if (hasHtml)
   {
      //var t = "\n<div>\n"+html+"</div>\n";
      var t = "\n"+'<div style="border: solid 1px #bbbbdd; padding: 3px;">'+"\n"+html+"</div>\n";
      text = doLinks(t1)+t+doLinks(t2);
   }
   else
      text = doLinks(text);

   return text;
}

function makeToken(ffid, name, flags)
{
   var key = getKey();
   var hdr = '{"typ":"JWT","alg":"HS256"}';
   var now = Date / 1000 | 0;
   now += 365*24*60*60;  // in a year
   var payload = '{ "iss":"britseyeview.com/ff/","id": '+ffid+', "name":"'+
                     name+'","flags": '+flags+', "expires": '+now+' }';
   var sig = sha256(payload+key);
   var s = btoa(hdr)+"."+btoa(payload)+"."+sig;
   return s;
}

function checkMsgStatus()
{
   msgStatus = 0;
   getMsgStatus();
   if (msgstatus)
      $('.yhmess').show();
}

function getMsgStatus()
{
   var ajaxdata = {
        type: "GET",
        async: false,
        url: "msgstatus.php",
        data: ({id: 0})
   };
   ajaxdata.data.id = userInfo.id;

   var ret = $.ajax(ajaxdata).responseText;
   var a = ret.split("+");
   msgstatus = 0;
   if (a[0] == "OK")
      msgstatus = parseInt(a[1]);
}

function submitRegister()
{
   var id = $('#ruserid').val();
   $('#ruserid').val(id.toLowerCase());
   if ($('#rpass1').val() != $('#rpass2').val())
   {
      alert("Password values don't match.");
      return;
   }
   if ($('#remail').val() != $('#remail2').val())
   {
      alert("Email values don't match.");
      return;
   }
   $('#register_form').submit();
   $('#working').show();
   return true;
}

function doRegister(ret)
{
   if (!ret)
   {
      $('#working').hide();
      $('#dlgcontainer').hide();
      $('#therest').show();

      return;
   }
   var ro = $.parseJSON(ret);
	if (!ro.success)
	{
	   alert(ro.errmsg);
      $('#working').hide();
      $('#dlgcontainer').hide();
      $('#therest').show();
	   return;
   }
   alert("The new user '"+ro.moniker+"' was successfully registered");
   $('#working').hide();
   $('#dlgcontainer').hide();
   $('#therest').show();
}

function doLogin(reply, sticky)
{
   if (!reply)
      return;
   var ro = $.parseJSON(reply);
	if (!ro.success)
	{
      alert("Login Failed:\n"+r.errmsg);
      $('#working').hide();
      return;
	}
	var tp = ro.token;
	var ct = atob(ro.token);
	var key = getKey();
	var pt = decrypt(ct, key);
	var a = pt.split(".");
   var json = atob(a[1]);
   var obj = $.parseJSON(json);
	// Get data from token
   userInfo.logType = 1;
   userInfo.id = obj.id; // This is the numeric ID
   userInfo.name = obj.name;
   userInfo.flags = obj.flags;
	if (sticky)
	{
	   localStorage.setItem("ff:token", pt);
	   localStorage.setItem("ff:token_ct", tp);
   }
   else
   {
	   sessionStorage.setItem("ff:token", pt); // allow server calls until end of session
	   sessionStorage.setItem("ff:token_ct", tp);
   }
   userInfo.ctToken = tp;
   $('#slogtype').val(userInfo.logType);
   $('#contribid').val(userInfo.id);
   $('#exppic').val("N");
   $('#exmpic').val("N");
   $('#exid').val(userInfo.id);
   $('#sdept').val(0);

   $('#sfgo').click(function() { submitNewItem(); });
   $('#status_form').ajaxForm({ success: function(rv) { addNewItem(rv); }, resetForm: true });

   $('#exgo').click(function() { submitExtra(); });
   $('#extra_form').ajaxForm({ success: function(rv) { extraSaved(rv); }, resetForm: true });

   $('#reggo').click(function() { submitRegister(); });
   $('#register_form').ajaxForm({ success: function(rv) { doRegister(rv); } });
   // Make sure the encrypted token is sent with each $.ajax() call
   $.ajaxSetup({
       beforeSend: function(xhr) { xhr.setRequestHeader('FF_Token', userInfo.ctToken); }
   });
   //getMsgStatus();
   //if (msgstatus)
   //   $('.yhmess').show();
   $('#ul'+userInfo.id).addClass("owner");
   $('.tn'+userInfo.id).addClass("owner");
   //interval1 = setInterval(checkMsgStatus, 60000);
   fixClix("trigger");
   $('#dlgcontainer').hide();
   $('#therest').show();
   switch2feed();
}

function submitLogin()
{
   $('#working').show();
   var sticky = $('#remember').is(':checked');
   var id = $('#userid').val().toLowerCase();
   var pass = $('#pass').val();
   var url = "/ff/m/fflogin.php"
   var key = getKey();
   var authData = id+' '+pass;
   authData = encrypt(authData, key);
   authData = btoa(authData);
   $.ajax({
      url: url,
      beforeSend: function(xhr) {
         xhr.setRequestHeader("FF_Login", authData); // Becomes header HTTP_FF_LOGIN
      },
      success: function(data) { doLogin(data, sticky); }
   });
}

function doLogout()
{
   clearInterval(interval1);
   $('.yhmess').hide();
      userInfo = {
      logType: 0,
      id: -1,
      name: "",
      thumbURL: "",
      flags: 0,
      location: "",
      DOB: "",
      ctToken: ""
   }
   localStorage.removeItem("ff:token");
   sessionStorage.removeItem("ff:token");
   var appState = getAppState();
   appState.container = "";
   appState.view = "";
   appstate.component = "";
   appState.otherUid = -1;
   putAppState(appState);

   $('#feed').attr('data-loaded', 'N');
   $('#members').attr('data-loaded', 'N');
   $('#messages').attr('data-loaded', 'N');
   $('#messages').attr('data-uid', '-1');
   $('#individual').attr('data-loaded', 'N');
   $('#individual').attr('data-uid', '-1');

   $('#feedbody').html('');
   $('#memberlist').html('');
   $('#idata').html('');
   $('#themessages').html('');
   $('#threadlist').html('');
   $('#therest').hide();
   mexDlgShow("logdlg");
   $('#dlgcontainer').show();
   $('#userid').val("");
   $('#pass').val("");
   $('#userid').focus();
}

function populateExtra(ro)
{
   $('#exid').val(userInfo.id);
   $('#exdob').val(ro.dob);
   $('#exphone').val(ro.phone);
   $('#exaddress1').val(ro.address1);
   $('#exaddress2').val(ro.address2);
   $('#excity').val(ro.city);
   $('#exregion').val(ro.region);
   $('#expostcode').val(ro.postcode);
   $('#excountry').val(ro.country);
   $('#exhru').val(ro.hru);
   $('#exemail').val(ro.email);
}

function editUData()
{
   $.get("getextradata.php?uid="+userInfo.id, function(rv) {
      var ro = $.parseJSON(rv);
      if (!ro.success)
      {
         alert(ro.errmsg);
         return;
      }
      populateExtra(ro);
      $('#therest').hide();
      $('#dlgcontainer').show();
      mexDlgShow("extradlg");
   });
}

function fixThreadClix()
{
   function setclick()
   {
      var trigger = $(this);
      var oid = trigger.attr("data-oid");
      oname = trigger.attr("data-oname");

      trigger.click(function(event) { event.stopPropagation(); switch2messages(["threads",0, false]); });
   }
   $('.threaditem').each(setclick);
}

function toThreads()
{
   switch2messages([0, userInfo.id, false]);
}

function clearNewMsg()
{
   $('#newmsg').val("");
}

function zapMessages()
{
   $('#msglist').html("");
   $('#msgfrom').html("");
   $('#msgto').html("");
}

function moClick(mid)
{
   if (confirm("Delete this message?"))
   {
      $('#m'+mid).remove();
      $.get("deletemessage.php?mid="+mid);
   }
}

function doPostMessage(rv)
{
   var ro = $.parseJSON(rv);
   if (!ro.success)
   {
      alert(ro.errmsg);
      return;
   }
   var mid = ro.msgid;
   msg = $('#newmsg').val();
   $('#newmsg').val("");
   var text = msg.replace("\n\n", '<p class="nps">');
   text = text.replace("\n", '<br>');
   var now = nowAsISO();
   var s = '<div class="msgitem" id="m'+mid+'">'+"\n";
   // Poster name and details
   s += '<span class="noclicktext" style="cursor:pointer;">'+userInfo.name+'</span>'+"\n";
   // Date/time
   s += '      <span class="datetime">'+now+'</span>'+"\n";
   // The post text
   s += '      <div class="posttxt">'+text+'</div>'+"\n";
   s += '<div style="clear:both; border-top:solid 1px #bbbbdd; margin-top:5px; height:5px;"></div>'+"\n";
   s += "</div>\n";
   $('#themessages').prepend(s);
}

function postMessage()
{
   var ta = $('#newmsg');
   var msg = ta.val();
   if (msg == "")
   {
      alert("You have not entered any message to send.");
      return;
   }
   var mbody = escape(msg);
   var toid = $('#otherid').val();
   $.get("putmessage.php?toid="+toid+"&fromid="+userInfo.id+"&mbody="+mbody,
              function(data) { doPostMessage(data); });
   interval1 = setInterval(checkMsgStatus, 60000);
}

function getAppState()
{
   var st = { container: "", view: "", component: "", otherUid: -1 }
   var dd = $('#appstate');
   st.container = dd.attr("data-container");
   st.view = dd.attr("data-view");
   st.component = dd.attr("data-component");
   st.otherUid = dd.attr("data-uid");
   return st;
}

function putAppState(st)
{
   var dd = $('#appstate');
   dd.attr("data-container", st.container);
   dd.attr("data-view", st.view);
   dd.attr("data-component", st.component);
   dd.attr("data-uid", st.otherUid);
}

function pushState(state, path)
{
   if (atInit)
      history.replaceState(state, "", path);
   else
      history.pushState(state, "", path);
   atInit= false;
}

function switch2members()
{
   var appState;
   function fixMemberClix()
   {
      function setUDClick()
      {
         var e = $(this);
         var uid = e.attr("data-owner");
         e.click(function(event) { event.stopPropagation(); switch2indi(uid); });
      }

      $('.showsud').each(setUDClick);
   }

   function adjust()
   {
      if (appState.container == "dlgcontainer")
      {
         $('#'+appState.container).hide();
         $('#therest').show();
      }
      if (!atInit)
         $('#'+appState.view).hide();
      $('#members').show();
      appState.container = "therest";
      appState.view = "members";
      appState.component = "";
      pushState(appState, "?path=members");
      putAppState(appState);
      $('#whence').val("members");
   }

   appState = getAppState();
   if (appState.view == "members")
      return;
   var loaded = $('#members').attr('data-loaded');
   if (loaded == 'N')
   {
      busy(true);
      var url = "fillmembers.php?cu="+userInfo.id;
      $.get(url, function(rv) {
         $('#memberlist').html(rv);
         fixMemberClix();
         $('#members').attr('data-loaded', 'Y');
         $('#memberlist').show();
         busy(false);
         adjust()
      });
   }
   else
   {
      $('#memberlist').show();
      adjust();
   }
}

function switch2messages(component, uid)
{
   var appState;
   function adjust()
   {
      if (appState.container == "dlgcontainer")
      {
         $('#dlgcontainer').hide();
         $('#therest').show();
      }
      $('#'+appState.view).hide();
      $('#messages').show();
      if (component == "threads")
      {
         $('#conversation').hide();
         $('#threads').show();
      }
      else
      {
         $('#threads').hide();
         $('#conversation').show();
      }
      appState.container = "therest";
      appState.view = "messages";
      appState.component = component;
      if (component == 'conversation')
         appState.otherUid = uid;
      pushState(appState, "?path=messages/"+component+"&uid="+uid);
      putAppState(appState);
   }

   appState = getAppState();
   if (appState.view == "messages")
   {
      if (appState.component == component) // Threads only applies to current user
         return;
      else
         if (appState.otherUid == uid)
            return;
   }
   var loaded = $('#messages').attr("data-loaded");
   var other = parseInt($('#messages').attr("data-uid"));
   // In the case of messages we reload/update from the server every time
   if (component == "threads")
   {
      if (loaded == "N")
      {
         var url = "getmsgthreads.php?cu="+userInfo.id;
         busy(true);
         $.get(url, function(rv) {
            var ro = $.parseJSON(rv);
            if (!ro.success)
            {
               alert(ro.errmsg);
               busy(false);
               return;
            }
            $('#threadlist').html(ro.text);
            fixThreadClix();
            $('#messages').attr("data-loaded", "Y");
            busy(false);
            adjust();
         });
      }
      else
         adjust();
   }
   else
   {
      if (loaded == 'N' || other != uid)
         {
         var url = "getmsgshtml.php?cu="+userInfo.id+"&other="+uid;
         busy(true);
         $.get(url, function(rv) {
            $('#themessages').html(rv);
            oname = $('#ml_oname').val();
            $('#msgfrom').html(userInfo.name);
            $('#msgto').html(oname);
            $('#messages').attr("data-loaded", "Y");
            $('#messages').attr("data-other", uid)
            busy(false);
            adjust();
         });
      }
      else
         adjust();
   }
}

function switch2indi(uid)
{
   var appState;
   function adjust()
   {
      if (appState.container == "dlgcontainer")
      {
         $('#'+appState.container).hide();
         $('#therest').show();
      }
      $('#'+appState.view).hide();
      $('#individual').show();
      appState.container = "therest";
      appState.view = "individual";
      appState.component = "";
      appState.seqNo++;
      pushState(appState, "?path=individual&uid="+uid);
      putAppState(appState);
   }

   appState = getAppState();
   if (appState.view == "individual" && appState.otherUid == uid)
      return;
   var loaded = $('#individual').attr("data-loaded");
   var other = parseInt($('#individual').attr("data-uid"));

   if (loaded =='N' || other != uid) // need to load/reload
   {
      busy(true);
      var url = "filluserdetail.php?uid="+uid;
      $.get(url, function(rv) {
         if (!rv) return;
         var ro = $.parseJSON(rv);
         if (!ro.success) {
            alert(ro.errmsg);
            busy(false);
            return;
         }
         $('#individual').attr("data-loaded", "Y");
         $('#individual').attr("data-uid", uid)
         $('#idata').html(ro.text);
         $('#membername').html($('#hidename').val());
         if (uid == userInfo.id)
         {
            $('#canedit').show();
            //$('#canedit').click(switch2edit());
            //$('#excurrentpic').val($('#hidepicid').val());
         }
         else
            $('#canedit').hide();
         busy(false);
         adjust();
      });
   }
   else
      adjust();
}

function switch2feed()
{
   var appState;
   function adjust()
   {
      if (appState.container == "dlgcontainer")
      {
         $('#'+appState.container).hide();
         $('#therest').show();
      }
      $('#'+appState.view).hide();
      $('#feed').show();
      appState.container = "therest";
      appState.view = "feed";
      appState.component = "";
      pushState(appState, "?path=feed");
      putAppState(appState);
      $('#whence').val("feed");
   }

   appState = getAppState();
   if (appState.view == "feed")
      return;
   var loaded = $('#feed').attr("data-loaded");
   if (loaded == 'N')
   {
      busy(true);
      var url = "fillfeed.php?uid="+userInfo.id+$('#feedselect').attr("data-qs");
      $.get(url, function(rv) {
         $('#feedbody').html(rv);
         fixFeedClicks(userInfo.id);
         $('#feed').attr("data-loaded", "Y");
         busy(false);
         adjust()
      });
   }
   else
   {
      adjust();
   }
}

function switch2edit()
{
   var appState;
   function adjust()
   {
      if (appState.container == "therest")
      {
         $('#'+appState.container).hide();
         $('#dlgcontainer').show();
      }
      $('#'+appState.view).hide();
      mexDlgShow("extradlg");
      appState.container = "dlgcontainer";
      appState.view = "extradlg";
      appState.component = "";
      appState.otherUid = userInfo.id;
      pushState(appState, "?path=extradlg");
      putAppState(appState);
   }

   appState = getAppState();
   if (appState.view == "extradlg")
      return;
   var url = "getextradata.php?uid="+userInfo.id;
   busy(true);
   $.get(url, function(rv) {
      var ro = $.parseJSON(rv);
      if (!ro.success)
      {
         alert(ro.errmsg);
         return;
      }
      populateExtra(ro);
      busy(false);
      adjust();
   });
}

function switch2register()
{
   var appState = getAppState();
   if (appState.view == "regdlg")
      return;
   $('#regdlg').clearForm();
   document.getElementById("rmug").innerHTML = document.getElementById("rmug").innerHTML;
   $('#rmuglabel').html('Choose');
   $('#regsponsor').val(userInfo.id);
   if (appState.container == "therest")
   {
      $('#'+appState.container).hide();
      $('#dlgcontainer').show();
   }
   $('#'+appState.view).hide();
   mexDlgShow("regdlg");
   appState.container = "dlgcontainer";
   appState.view = "regdlg";
   appState.component = "";
   appState.otherUid = userInfo.id;
   pushState(appState, "?path=regdlg");
   putAppState(appState);
}

function switch2feedselect()
{
   var ppState = getAppState();
   if (appState.view == "feedselect")
      return;
   var rbid = $('#feedselect').attr("data-checked");
      document.getElementById(rbid).checked = true;

   if (appState.container != "dlgcontainer")
   {
      $('#dlgcontainer').show();
      $('#'+appState.container).hide();
   }
   $('#'+appState.view).hide();
   mexDlgShow("feedselect");
   appState.container = "dlgcontainer";
   appState.view = "feedselect";
   appState.component = "";
   appState.otherUid = -1;
      pushState(appState, "?path=feedselect");
   putAppState(appState);

}

function editRevert()
{
   switch2indi(userInfo.id);
}

function revert2members()
{
   $('#dlgcontainer').hide();
   $('#therest').show();
   $('#members').show();
}

function parseQS(qs)
{
   var rv = { view: "", component: "", uid: -1 };
   function splitPath(part)
   {
      var a = part.split('/');
      rv.view = a[0];
      rv.component = a[1];
   }

   var parts = qs.split('&');
   for (var i = 0; i < parts.length; i++)
   {
      var pair = parts[i].split('=');
      if (pair[0] == "path")
      {
         splitPath(pair[1]);
      }
      else
      {
         var a = parts[i].split('=');
         if (a[0] == "uid")
            rv.uid = a[1];
      }
   }
   return rv;
}

function changeState(sv)
{
   if (sv === null)
   {
      return;
   }
   else if (typeof sv == "object")
   {
      appState = getAppState();
      if (appState.container != sv.container)
      {
         $('#'+appState.container).hide();
         $('#'+sv.container).show();
      }
      if (appState.view != sv.view)
      {
         $('#'+appState.view).hide();
         $('#'+sv.view).show();
      }
      if (appState.component != sv.component)
      {
         $('#'+appState.component).hide();
         $('#'+sv.component).show();
      }

      putAppState(sv);
   }
   else
   {
      // new state must be figured out
      var qsInfo = parseQS(sv);
      var a = sv.split('&');
      switch (qsInfo.view)
      {
         case "feed":
            switch2feed();
            break;
         case "members":
            switch2members();
            break;
         case "messages":
            switch2messages(qsInfo.component, qsInfo.uid);
            break;
         case "individual":
            switch2indi(qsInfo.uid);
         case "extradlg":
            switch2edit();
            break;
         default:
            break;
      }
   }
}

// Arguments here are a class name used to identify trigger elements, and
// the ID of the div that will initially be shown.
function fixClix(triggerclass)
{
   // This is where we set the clicks up at initialization time.
   function setclick()
   {
      var trigger = $(this);
      var id = trigger.attr("data-assocdiv");
      var query = "";
      if (id == "feed" || id == "members")
         query = "path="+id;
      else if (id == "messages")
         query = "path=messages/threads&uid=-1";

      trigger.click(function(event) { event.stopPropagation(); changeState(query); });
   }

   // The very useful each() function applies setclick to each trigger element.
   $('.'+triggerclass).each(setclick);
}

function showUpdateDlg(msg)
{
   var ro = $.parseJSON(msg);
   if (!ro.success)
   {
      alert(ro.errmsg);
      $('#pwait'+updateContext.id).hide();
      return;
   }

   var text = ro.text;
   text = text.replace(/<h3>/, "{T ");
   text = text.replace(/<\/h3>/, " T}");
   text = text.replace(/<a href="/g, "{L ");
   text = text.replace(/">/g, " ");
   text = text.replace(/<\/a>/g, " L}");
   text = text.replace(/<p>/g, "\n\n");
   text = text.replace(/<br>/g, "\n");
   $('#updatete').val(text);
   $('#therest').hide();
   $('#dlgcontainer').show();
   mexDlgShow('updatedlg');
   $('#pwait'+updateContext.id).hide();
}

function delayedScroll(rv)
{
   // Restore sanity
   $('#therest').css("overflow", "scroll");
   $(window).scrollTop(savedposition);
}

function scrollToSaved()
{
/*
   if (mobile)
   {
      $('#therest').css("overflow", "hidden");
      $(window).scrollTop(savedposition);
      $('#therest').css("overflow", "scroll");
   } else
*/
      $(window).scrollTop(savedposition);
}

function updateHandler(option)
{
   $('#dlgcontainer').hide();
   $('#therest').show();
   switch (option)
   {
      case 1:
         var text = $('#updatete').val();
         text = $.trim(text);
         text = text2html(text);
         var etext = escape(text);
         // This may cause scrolling and there's a bug in the Android browser.
         $('#therest').css("overflow", "hidden");
         if (!updateContext.comment)
         {
            $.get("updatestatus.php?id="+updateContext.id+"&bcid="+userInfo.id+"&blurb="+etext,
               function(rv) {
                  var ro = $.parseJSON(rv);
                  if (!ro.success) {
                     alert(ro.errmsg);
                  }
                  else
                  {
                     $('#posttxt'+updateContext.id).html(text);
                     delayedScroll(data);
                  }
               });
         }
         else
         {
            $.get("updatecomment.php?id="+updateContext.id+"&bcid="+userInfo.id+"&blurb="+etext,
               function(rv) {
                  var ro = $.parseJSON(rv);
                  if (!ro.success) {
                     alert(ro.errmsg);
                  }
                  else
                  {
                     $('#comspan'+updateContext.id).html(text);
                     delayedScroll(data);
                  }
               });
         }
         $('#updatete').text("");
         break;
      case 2:
         scrollToSaved();
         if (confirm("Are you sure you want to delete this post?"))
         {
            if (!updateContext.comment)
            {
               $('#post'+updateContext.id).remove();
               $.get("zapstatus.php?id="+userInfo.id+"&sid="+updateContext.id);
            }
            else
            {
               $('#commentdiv'+updateContext.id).remove();
               $.get("zapcomment.php?id="+userInfo.id+"&cid="+updateContext.id);
            }
         }
         break;
      default:
         scrollToSaved();
         break;
   }
}

function fixFeedClicks(uid)
{
   function tweakItem(item, isComment)
   {
      var nid = item.attr("data-postid");
      var owner = item.attr("data-owner");
      //var it = $('#'+i);
      if (owner != uid)
         return;     // Not clickable
      item.css("cursor", "pointer");
      item.click(function(e) { feedItemClick(e, nid, isComment); });
   }

   function eachFeedItem()
   {
      var fi = $(this);
      tweakItem(fi, false)
   }

   function eachCommentItem()
   {
      var ci = $(this);
      tweakItem(ci, true)
   }

   function eachOwnerLink()
   {
      var item = $(this);
      var owner = item.attr("data-owner");
      item.css("cursor", "pointer");
      item.click(function(e) { ownerClick(e, owner); });
   }

   $('.postpart').each(eachFeedItem);
   $('.comment').each(eachCommentItem);
   $('.poster').each(eachOwnerLink);
   $('.fithumb').each(eachOwnerLink);
   $('.commenter').each(eachOwnerLink);
}

function feedItemClick(e, nid, context)
{
   $('#pwait'+nid).show();
   savedposition = $(window).scrollTop();
   updateContext.id = nid;
   updateContext.comment = context;

   // We go to the server here, since different browsers are likely to have interpreted
   // our HTML fragment in different ways
   var url = context? "getcomment.php?id=": "getstatus.php?id=";
   url += nid;
   $.get(url, function(rv) { showUpdateDlg(rv); });
}

function ownerClick(e, owner, context)
{
   e.stopPropagation();
   var a=[ '' ];
   a[0] = owner;
   switch2indi(a);
}

function mexDlgShow(id)
{
   function doit()
   {
      var dlg = $(this);
      if (dlg.attr("id") == id)
         dlg.show();
      else
         dlg.hide();
   }

   $('.mexdlg').each(doit);
}

function requestPWReset()
{
//   $.get("sendemail.php", function(rv) {
//      alert("OK, watch your email.\nYou should get a link to\na page that will allow you\nto set a new password.");
//   });
}

function checkLogin()
{
   var t = localStorage.getItem("ff:token");
   if (!t || t === null)
   {
      t = sessionStorage.getItem("ff:token");
      if (!t || t === null)
         return; // User must log in
   }
   userInfo.logType = 1;
   var a = t.split(".");
   // Parse token and get user ID and name
   $pay = a[1];
   $pay = atob($pay);
   var to = JSON.parse($pay);

   userInfo.id = to.id; // This is the numeric ID
   userInfo.name = to.name;
   userInfo.flags = to.flags;

   // Make sure we send the token with each server request
   userInfo.ctToken = btoa(encrypt(t, getKey()));
   // Make sure the encrypted token is sent with each $.ajax() call
   $.ajaxSetup({
       beforeSend: function(xhr) { xhr.setRequestHeader('FF_Token', userInfo.ctToken); }
   });
}
