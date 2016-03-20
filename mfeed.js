var template =
'<div id="post@1" class="feeditem"> \
   <img class="thumb" style="float:left; margin-right:5px;" src="@2" /></td> \
   <td><span id="pns@3" alt="@4" class="poster">@5 </span><span class="datetime">@6</span> \
   <div class="posttxt" id="posttxt@7">@8</div> \
</div>';

var imtp = '<img src="getimg2.php/@1" id="postimg@1" class="postimg"/>';

var host = "bev";
var imgSrc;
var sid;
var cte;
var lastp;
var uname;
var oname;
var token;
var logtype = 0;
var fbid;
var bcid;
var blurb;
var commentblurb;
var updateid = 0;
var updatecontext = 0;
var msgstatus = 0;
var fromid = 0;
var toid = 0;
var interval1;
var newsfeed = 0;
var comments = 0;
var bevcom = 0;
var loc;
var dept = 0;
var flags;
var picdivup = false;
var mobile;
var savedposition;
var gImmediate = true;
var threadsDone = false;

function nowAsISO(){
 function pad(n){return n<10 ? '0'+n : n}
 var d = new Date();
 return '('+d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+' '
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+')'}

function nop() {}

function addNewItem(ret)
{
   $(".working").hide();;
   if (!ret)
      return;
	var a = ret.split("+");
   if (a[0] == "OK")
   {
      var text = template.replace("@1", a[1]);
      var src;
      if (a[2] == "1")
         src = "getthumb.php/"+bcid;
      else if (a[2] == "2")
         src = "https://graph.facebook.com/"+fbid+"/picture";
      else
         src = "https://plus.google.com/s2/photos/profile/"+fbid+"?sz=200"
// eg.         https://plus.google.com/s2/photos/profile/103629890842850870430?sz=200
      text = text.replace("@2", src);
      text = text.replace("@3", a[1]);
      text = text.replace("@4", bcid);
      text = text.replace("@5", uname);
      text = text.replace("@6", nowAsISO());
      text = text.replace("@7", a[1]);
      text = text.replace("@8", blurb);
      text += '<p style="clear:both;">';
      if (a[3] != "0")
      {
         var t = imtp.replace("@1", a[3]);
         var w = parseInt(a[4]);
         var h = parseInt(a[5]);
         if (w > h)
         {
            if (w > 300)
               t = t.replace("@2", 'width="300" ');
            else
               t = t.replace("@2", "");
         }
         else
         {
            if (h > 300)
               t = t.replace("@2", 'height="300" ');
            else
               t = t.replace("@2", "");
         }
         text += t;
      }
      var tt = "javascript:addComment('"+a[1]+"');";
      text += '<div class="sentinel"></div><a href="'+tt+'">Comment</a>';
      // If actually logged on to FB and we have an access token
      if (logtype == 2 && token != "")
      {
         tt = "javascript:publish('"+a[1]+"', '"+a[3]+"');";
         text += '<span id="publink'+a[1]+'">, <a href="'+tt+'">Publish</a></span>';
      }
      text += '</td></tr></table><div style="margin:0 100px 0 73px; border-top:solid 1px #bbbbdd; height:5px;"></div>';
      $('#feedbody').prepend(text);
	   //$('#upload_target').load(nop);
      var it = $('#pns'+a[1]);
      it.css("cursor", "pointer");
      it.click(function(e) { pnsClick(e, a[1], 0); });
      // Bump the getlatest ID so this does not provoke an update
      newsfeed = parseInt(a[1]);;
   }
   else
   {
      if (a.length > 1)
         alert(a[1]);
      else
         alert(ret);
   }

   $('#status').val("");
   $('#file').val("");
}

function getLatest()
{
   $.get("getlatest.php", function(msg) {
      if (msg.substr(0,2) != "OK")
         return;
      var a = msg.split("+");
      newsfeed = parseInt(a[1]);
      comments = parseInt(a[2]);
      bevcom = parseInt(a[3]);
   });

}

function publish(spanid, imgid)
{
   var blurb = $('#posttxt'+spanid).html();
   var url = "postwall.php?id="+fbid+"&blurb="+escape(blurb)+"&token="+token;
   if (imgid != "0")
      url+= "&iid="+imgid;
   $.get(url);
   $('#publink'+spanid).remove();
}

var ctemplate =
'<div id="cd@1" class="comment" style="padding-left:10px;"> \
   <table style="width:100%;"><tr valign="top"><td width=45> \
      <img class="smallthumb" src="@2"> \
   </td><td> \
      <div id="cns@3" alt="@4" class="cns commenter">@6: </div> \
      <p id="comspan@5" class="comtxt">@7</p> \
  </td></tr></table> \
</div>';

function doAddComment()
{
   $('#pwait'+sid).show();
   var text = commentblurb;
   commentblurb = "";
   var text = $.trim(text);
   text = text2html(text);
   var src;
   var type;
   if (logtype == 3)
   {
      src = "https://plus.google.com/s2/photos/profile/"+fbid+"?sz=200";
      type = 3;
   }
   if (logtype == 2)
   {
      src = "https://graph.facebook.com/"+fbid+"/picture";
      type = 2;
   }
   else
   {
      src = "getthumb.php/"+bcid;
      type = 1;
   }
   var url = "nfcomment.php?sid="+sid+"&logtype="+type+"&id="+bcid+"&text="+escape(text);
   $.get(url, function(msg) {
      if (msg.substr(0,2) != "OK")
      {
         $('#pwait'+sid).hide();
         return;
      }
      var cid = msg.substr(3);
      // This will cause scrolling and there's a bug in the Android browser.
      $('#therest').css("overflow", "hidden");
      var s = ctemplate;
      s = s.replace("@1", cid);
      s = s.replace("@2", src);
      s = s.replace("@3", cid);
      s = s.replace("@4", bcid);
      s = s.replace("@5", cid);
      s = s.replace("@6", uname);
      s = s.replace("@7", text);

      lastp.before(s);
      var it = $('#cns'+cid);
      it.css("cursor", "pointer");
      it.click(function(e) { pnsClick(e, cid, 1); });
      comments = parseInt(cid);
      $('#pwait'+sid).hide();
      // Restore sanity
      $('#therest').css("overflow", "scroll");
      $(window).scrollTop(savedposition);
   });
}

function addComment(itemId)
{
   if (logtype == 0)
   {
      alert("You must be logged in to add a comment");
      return;
   }
   sid = itemId;
   itemIdx = "#post"+itemId;
   lastp = $(itemIdx).find('.sentinel').last();
   savedposition = $(window).scrollTop();
   $('#therest').hide();
   $("#ecdiv").show();
}

function doLogout()
{
   clearInterval(interval1);
   $('.yhmess').hide();
   $('#ul'+bcid).removeClass("owner");
   $('.tn'+bcid).removeClass("owner");
   uname ="";
   //fbid = "";
   loc = "";
   //token = "";
   $('#logtype').val("0");
   $('#fbid').val("");
   $('#name').val("");
   //$('#token').val("");
   $('#bcid').val("");
   fixPnsClicks();

   $('#therest').hide();
   $('#dlgcontainer').show();
   $('#userid').val("");
   $('#pass').val("");
   $('#logdlg').show();
   $('#lif'+bcid).html("");
   $.get("feedlogout.php?id="+bcid);
   bcid = "";
   //if (logtype == 2)
   //   fbo.logout();
   logtype = 0;
}

function setCookie(cookieName,cookieValue,nDays)
{
   var today = new Date();
   var expire = new Date();
   if (nDays==null || nDays==0) nDays=1;
   expire.setTime(today.getTime() + 3600*24*nDays);
   document.cookie = cookieName+"="+escape(cookieValue)
                 + ";expires="+expire.toGMTString();
}

function showPicture(iid)
{
   if (picdivup)
      return;
   $('#picdivpic').attr("src", "getimg.php?iid="+iid);
   $('#picdiv').css("top", $(window).scrollTop()+"px");
   $('#picdiv').css("height", 3*$(window).height()+"px");
   $('#picdiv').show();
   picdivup = true;
}

function trim(stringToTrim)
{
	return stringToTrim.replace(/^\s+|\s+$/g,"");
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
//alert(t1+"\n"+t+"\n"+t2);
   }
   else
      text = doLinks(text);

   return text;
}

function showLogDlg()
{
   //$('#shield').show();
   $('#userid').val("");
   $('#email').val("");
   $('#pass').val("");
   $('#therest').hide();
   $('#logdlg').show();
   $('#userid').focus();
}

function showUTDialog()
{
   $('#therest').hide();
   $('#utdlg').show();
}

function showStringDialog(stype)
{
   $('#therest').hide();
   if (stype == "ulocdlg")
   {
      $('#stringtitle').html("Change your location.");
      $('#stringlabel').html("Location:");
   }
   else
   {
      $('#stringtitle').html("Change your display name.");
      $('#stringlabel').html("Display name:");
   }
   $('#stringtype').val(stype);
   $('#stringdlg').show();
}

function doUpdateString(ret)
{
   $('.working').hide();
   if (!ret  || ret != "OK")
      return;
   window.location.reload();
}

function updateLabel()
{
   var cf = document.getElementById("file").value;
   $('#cflabel').attr("title", cf);
   //alert(cf);
}

function updateString()
{
   var txt = $('#strtxt').val();
   if (txt == "")
   {
      alert("No text was entered");
      return;
   }
   $('#stringdlg').hide();
   $('#therest').show();
   var st = $('#stringtype').val();
   var url = "updatestring.php?uid="+bcid+"&stringtype="+st+"&strtxt="+txt;
   $('.working').show();
   $.get(url, function(data) { doUpdateString(data); });
}

function showRegDlg()
{
   $('#ruserid').val("");
   $('#rpass1').val("");
   $('#rpass2').val("");
   $('#remail').val("");
   $('#remail2').val("");
   $('#therest').hide();
   $('#logdlg').hide();
   $('#regdlg').show();
   $('#ruserid').focus();
}

function doBevLogin(reply)
{
   if (!reply)
      return;
	var a = reply.split("+");
	if (a[0] == "RESET")
	{
      alert(
      "Login Failed:\nThe user ID and password combination you entered do not match! Password was reset by "+a[1]+" on "+a[2]);
      $('.working').hide();
      $('#therest').show();
      return;
	}
	if (a[0] != "OK")
	{
      alert("Login Failed:\n"+a[1]);
      $('.working').hide();
      $('#therest').show();
      return;
	}
   logtype = 1;
   bcid = a[1];
   uname = a[2];
   $('#lif'+bcid).html("(Logged in)");
   getMsgStatus();
   if (msgstatus)
      $('.yhmess').show();
   $('#logouttt').html("Logged in conventionally.");
   $('#logindiv').hide();
   $('#therest').show();
   $('#feeddiv').show();
   $('#ul'+bcid).addClass("owner");
   $('.tn'+bcid).addClass("owner");
   $('#slogtype').val("1");
   $('#contribid').val(bcid);
   fixPnsClicks();
   $('.working').hide();
   interval1 = setInterval(checkMsgStatus, 60000);
}

function checkSignup()
{
   var em1 = $('#remail').val();
   var id = $('#ruserid').val();
   if (em1 == "")
   {
      if (id.length > 20 || id.length < 1)
      {
         alert("User ID must be 1 to 20 characters");
         return false;
      }
      if (!id.match(/^[A-Za-z0-9]+$/i))
      {
         alert("User ID restricted to alphanumeric");
         return false
      }

      var ajaxdata = {
           type: "POST",
           async: false,
           url: "checkbcid.php",
           data: ({id: ""})
      };
      id = id.toLowerCase();
      ajaxdata.data.id = id;

      var msg = $.ajax(ajaxdata).responseText;
      if (msg.indexOf("OK") != 0)
      {
         alert("That user id is already in use - please choose another.");
         return false;
      }
   }

   var lname = $('#rusername').val();
   if (lname == "")
   {
      alert("User name is required");
      return false;
   }
   if  (lname == id)
   {
      alert("Your user name should be different than your id.");
      return false;
   }
   var pass1 = $('#rpass1').val();
   var r=pass2 = $('#rpass2').val();
   if (pass1.length > 20 || pass1.length < 6)
   {
      alert("Password must be 6 to 20 characters");
      return false;
   }
   if (pass1 != pass2)
   {
      alert("Passwords do not match");
      return false;
   }
   var em2 = $('#remail2').val();
   if (em1 != em2)
   {
      alert("Email addresses do not match");
      return false;
   }

   uname = lname;
   return true;
}

function doUpdateThumb(ret)
{
   $('.working').hide();
   if (!ret  || ret != "OK")
      return;
   window.location.reload();
}

function doBevRegister(ret)
{
alert("doBevReg|"+ret+"|");
   if (!ret)
   {
      $('.working').hide();
      $('#regdlg').hide();
      $('#therest').show();

      return;
   }
	var a = ret.split("+");
	if (a[0] != "OK")
	{
	   alert(a[1]);
      $('.working').hide();
      $('#regdlg').hide();
      $('#therest').show();
	   return;
   }
   logtype = 1;
   bcid = a[1];
   flags = a[3];
   token = a[3];
   $('#loggeduser').html("Logout "+uname);
   $('#logindiv').hide();
   $('#userimg').attr("src", "getthumb.php/"+bcid);
   $('#feeddiv').show();
   fixPnsClicks();
   bevcom = parseInt(bcid);
   $('.working').hide();
   $('#regdlg').hide();
   $('#therest').show();
}

function submitNewItem()
{
   blurb = $('#status_te').val();
   if (!blurb.length)
   {
      alert("Your post has no text");
      return false;
   }
   $('#enter_status').hide();
   $('#invite_status').show();
   // Save the post until it has been added to the database
   // to avoid slashes
   blurb = text2html($('#status_te').val());
   $('#status_te').val(blurb);
   $('#status_form').submit();
   $(".working").show();
   return true;
}

function submitLogin()
{
   var sticky = $('#remember').is(':checked');
   $('#logdlg').hide(); $('#shield').hide();
   var id = $('#userid').val().toLowerCase();
   var pass = escape($('#pass').val());
   var url = "/feed/m/feedlogin.php?userid="+id+"&pass="+pass+"&dept="+dept;
   if (sticky) url += "&sticky";
   $.get(url, function(data) { doBevLogin(data); });
   $('.working').show();
}

function submitRegister()
{
//   if (!checkSignup())
//      return false;

   var id = $('#ruserid').val();
   $('#ruserid').val(id.toLowerCase());
   uname = $('#rusername').val();
   $('#register_form').submit();
   $('.working').show();
   return true;
}

function submitThumb()
{
   var tu = $('#tu').val();
   if (tu == "")
      return false;

   $('#utdlg').hide();
   $('#therest').show();
   $('#ut_form').submit();
   $('.working').show();
   return true;
}

function delayedScroll(dummy)
{
   if (dummy.substr(0, 2) != "OK")
      alert(dummy);
   // Restore sanity
   $('#therest').css("overflow", "scroll");
   $(window).scrollTop(savedposition);
}

function updateHandler(option)
{
   $('#updatedlg').hide();
   $('#therest').show();
   $('.working').hide();
   switch (option)
   {
      case 1:
         var text = $('#updatete').val();
         text = $.trim(text);
         text = text2html(text);
         var etext = escape(text);
         // This may cause scrolling and there's a bug in the Android browser.
         $('#therest').css("overflow", "hidden");
         if (updatecontext == 0)
         {
            $.get("updatestatus.php?id="+updateid+"&bcid="+bcid+"&blurb="+etext,
               function(data) { delayedScroll(data); });
            $('#posttxt'+updateid).html(text);
         }
         else
         {
            $.get("updatecomment.php?id="+updateid+"&bcid="+bcid+"&blurb="+etext,
               function(data) { delayedScroll(data); });
            $('#comspan'+updateid).html(text);
         }
         $('#updatete').text("");
         break;
      case 2:
         scrollToSaved();
         if (confirm("Are you sure you want to delete this post?"))
         {
            if (updatecontext == 0)
            {
               $.get("zapstatus.php?id="+bcid+"&sid="+updateid);
               $('#post'+updateid).remove();
            }
            else
            {
               $.get("zapcomment.php?id="+bcid+"&cid="+updateid);
               $('#cd'+updateid).remove();
            }
         }
         break;
      default:
         scrollToSaved();
         break;
   }
}

function pnsClick(e, nid, context)
{
   $('#pwait'+nid).show();
   savedposition = $(window).scrollTop();

   // We go to the server here, since different browsers are likely to have interpreted
   // our HTML fragment in different ways
   var ajaxdata = {
        type: "GET",
        async: false,
        url: "getstatus.php",
        data: ""
   };
   ajaxdata.data = "id="+nid;
   if (context) ajaxdata.url = "getcomment.php";

   var msg = $.ajax(ajaxdata).responseText;
   if (msg.substr(0,2) != "OK")
   {
      $('#pwait'+nid).hide();
      return;
   }
   var text = msg.substr(3);
   text = text.replace(/<h3>/, "{T ");
   text = text.replace(/<\/h3>/, " T}");
   text = text.replace(/<a href="/g, "{L ");
   text = text.replace(/">/g, " ");
   text = text.replace(/<\/a>/g, " L}");
   text = text.replace(/<p>/g, "\n\n");
   text = text.replace(/<br>/g, "\n");
   $('#updatete').val(text);
   $('#therest').hide();
   $('#updatedlg').show();
   updateid = nid;
   updatecontext = context;
   $('#pwait'+nid).hide();
}

function fixPnsClicks()
{
   function eachPns()
   {
      var pns = $(this);
      var id = pns.attr("id");
      var nid = id.substr(3);
      var owner = pns.attr("alt");
      var it = $('#'+id);
      if (owner != bcid)
      {
         it.css("cursor", "default");
         it.click(function() { });
         return;     // Click does nothing
      }
      it.css("cursor", "pointer");
      it.click(function(e) { pnsClick(e, nid, 0); });
   }
   function eachCns()
   {
      var cns = $(this);
      var id = cns.attr("id");
      var nid = id.substr(3);
      var owner = cns.attr("alt");
      var it = $('#'+id);
      if (owner != bcid)
      {
         it.css("cursor", "default");
         it.click(function() { });
         return;     // Click does nothing
      }
      it.css("cursor", "pointer");
      it.click(function(e) { pnsClick(e, nid, 1); });
   }

   $('.poster').each(eachPns);
   $('.commenter').each(eachCns);
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
   ajaxdata.data.id = bcid;

   var ret = $.ajax(ajaxdata).responseText;
   var a = ret.split("+");
   msgstatus = 0;
   if (a[0] == "OK")
      msgstatus = parseInt(a[1]);
}

function viewMessages(otherid, switch2msg)
{
   toid = otherid;
   fromid = bcid;
   if (logtype == 0)
   {
      alert("You must be logged in to read or send messages.");
      return;
   }
   $.get("getmsgshtml.php?cu="+bcid+"&other="+otherid, function(rv) { doFillMsgDiv(rv, switch2msg); });
}

function fillThreadList()
{
   if (threadsDone)
      return;
   if (logtype == 0)
   {
      alert("You must be logged in to read or send messages.");
      return;
   }
   $(".working").show();
   $.get("getmsgthreads.php?cu="+bcid, function(rv) { doFillMsgThreadsDiv(rv); });
}

function fixThreadClix()
{
   function setclick()
   {
      var trigger = $(this);
      var oid = trigger.attr("data-oid");
      oname = trigger.attr("data-oname");

      trigger.click(function(event) { event.stopPropagation(); viewMessages(oid, 0); });
   }
   $('.threaditem').each(setclick);
}

function toThreads()
{
   fillThreadList();
   $('#msgdata').hide();
   $('#threads').show();
}

function doFillMsgThreadsDiv(rv)
{
   $('#threadlist').html(rv);
   fixThreadClix();
   $(".working").hide();
   threadsDone = true;
}

function doFillMsgDiv(rv, switch2msg)
{
   if (switch2msg)
   {
      $('#members').hide();
      $('#messages').show();
   }
   $('#themessages').html(rv);
   oname = $('#ml_oname').val();
   $('#msgfrom').html(uname);
   $('#msgto').html(oname);
   $('#threads').hide();
   $("#msgdata").show();
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

function doPostMessage(data)
{
   var a = data.split("+");
   if (a[0] == "NO")
   {
      alert(a[1]);
      return;
   }
   var mid = a[1];
   msg = $('#newmsg').val();
   $('#newmsg').val("");
   var text = msg.replace("\n\n", '<p class="nps">');
   text = text.replace("\n", '<br>');
   var fn = $('#cu').val();
   var now = nowAsISO();
   var s = '<div class="msgitem" id="m'+mid+'">'+"\n";
   // Poster name and details
   s += '<span id="sns'+mid+'" class="sender from" style="cursor:pointer;" onclick="moClick('+mid+')">'+fn+'</span>'+"\n";
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
   $.get("putmessage.php?toid="+toid+"&fromid="+bcid+"&mbody="+mbody,
              function(data) { doPostMessage(data); });
   interval1 = setInterval(checkMsgStatus, 60000);
}

function doShowULDiv(data)
{
   function getDetails()
   {
      var btn = $(this);
      var detail = "Location: "+btn.attr("data-loc")+"\n";
      detail += "Log type: "+btn.attr("data-lt")+"\n";
      detail += "Last login: "+btn.attr("data-ll");
      btn.click(function() { alert(detail); });
   }

   $('#mlinner').html(data);
   $('.userinfo').each(getDetails);
   $('.working').hide();
}

function showULDiv()
{
   $(".working").show();;
   $.get("getusershtml.php?lid="+bcid, function(data) { doShowULDiv(data); });
}

function fbadjust(reply)
{
   var a = reply.split("+");
   if (a[0] != "OK")
   {
      alert("3rd party login error:  "+reply.substr(3));
      $('.working').hide();
      return;
   }
   bcid = parseInt(a[1]);
   var newbie = (a.length == 3);
   if (newbie)
   {
      alert("Welcome new user "+uname+" you are now logged in.");
      $('.working').hide();
      return;
   }
   $('#ul'+bcid).addClass("owner");
   $('.tn'+bcid).addClass("owner");
   $('#lif'+bcid).html("(logged in)");
   $('#slogtype').val(logtype);
   $('#contribid').val(bcid);
   fixPnsClicks();
   $('.working').hide();
   interval1 = setInterval(checkMsgStatus, 60000);
}

function fbready()
{
   if (logtype > 1)
   {
      var sticky = $('#remember').is(':checked');
      $('#loggeduser').html("Logout "+uname);
      $('#logouttt').html("Logged in via "+((logtype == 2)? "Facebook": "Google")+".");
      var purl = (logtype == 2)? "https://graph.facebook.com/"+fbid+"/picture":
                                 "https://plus.google.com/s2/photos/profile/"+fbid+"?sz=200"
      $('#userimg').attr("src", purl);
      $('#logindiv').hide();
      $('#feeddiv').show();
      // Now write this info into our session and the bevcom table
      $('.working').show();
      var url = "fblogin.php?lt="+logtype+"&fbid="+fbid+"&token="+token+"&name="+escape(uname)+"&location="+escape(loc)+"&dept="+dept;
      if (sticky)
         url += "&sticky";
      $.get(url, function(reply) { fbadjust(reply); });
   }
   else
   {
   }
}

function forgot()
{
   window.location = "mreqreset.html";
}

function bevHome()
{
   window.location = "/";
}

function closeUTDialog()
{
   $('#utdlg').hide();
   $('#therest').show();
}

function fixupDialogs()
{
   function fixClose()
   {
      var cd = $(this);

      function fixupClose()
      {
         var elem = $(this);
         elem.click(function() { cd.hide(); $('#therest').show(); });
      }
      cd.find('.dlgclose').each(fixupClose);
   }

   $('.dialog').each(fixClose);
}

function handleComment(how)
{
   $('#ecdiv').hide();
   $('#therest').show();
   if (how) {
      commentblurb = $('#ecta').val();
      doAddComment();
   }
   else
      scrollToSaved();
   $('#ecta').val("");
}

function scrollToSaved()
{
   if (mobile)
   {
      $('#therest').css("overflow", "hidden");
      $(window).scrollTop(savedposition);
      $('#therest').css("overflow", "scroll");
   } else
      $(window).scrollTop(savedposition);
}

// Arguments here are a class name used to identify trigger elements, and
// the ID of the div that will initially be shown.
function fixClix(triggerclass, defdiv)
{
   var current = "";  // Which div is showing

   // There may be things we need to do before the page element is shown
   function preShow(divid)
   {
      if (divid == "feed")
      {
         if (logtype != 0)
         {
            $('#logindiv').hide();
            $('#feeddiv').show();
         }
         else
         {
            $('#feeddiv').hide();
            $('#logindiv').show();
         }
      }
      else if (divid == "memberlist")
         showULDiv();
      else if (divid == "messages")
      {
         fillThreadList();
      }
   }

   // Similarly, we may need to clean up.
   function postHide(divid)
   {
      //if (divid == "messages")
      //   zapMessages();
   }

   // and this is where we set the clicks up at initialization time.
   function setclick()
   {
      var trigger = $(this);
      var id = trigger.attr("data-assocdiv");

      function switchState(target)
      {
         $('#'+current).hide();
         postHide(current);
         preShow(target);
         $('#'+target).show();
         current = target;
      }
      trigger.click(function(event) { event.stopPropagation(); switchState(id); });
   }

   // The very useful each() function applies setclick to each trigger element.
   $('.'+triggerclass).each(setclick);

   // Finally show the default div
   current = defdiv;
   preShow(current);
   $('#'+current).show();
}

/*
    status: 'connected',
    authResponse: {
        accessToken: '...',
        expiresIn:'...',
        signedRequest:'...',
        userID:'...'
    }
*/
function handleFBLogin(response)
{
   if (response.status === 'connected') {
      fbid = response.authResponse.userID;
      token = response.authResponse.accessToken;
      FB.api('/me', function(me) {
         uname = me.name;
         $('#loggeduser').html("Logout "+uname);
         try
         {
          loc = me.location.name;
         }
         catch(e)
         {
          loc = "Not specified";
         }
         logtype = 2;
         fbready();
      });
      //var expires = response.authResponse.expiresIn;
   } else if (response.status === 'not_authorized') {
      alert("You have not granted the Facebook permissions required by BEV Newsfeed");
   } else {
      alert("Log on via Facebook failed.");
   }
}


function gRender()
{
   gapi.signin.render('customBtn', {
      'callback': 'googleCallback',
      //'clientid': '406520715726.apps.googleusercontent.com',         // dev
      'clientid': '600142899394.apps.googleusercontent.com',
      'cookiepolicy': 'single_host_origin',
      'requestvisibleactions': 'http://schemas.google.com/AddActivity',
      'scope': 'https://www.googleapis.com/auth/plus.login'
   });
}

function googleCallback(authResult)
{
   if (gImmediate)
   {
      gImmediate = false;
      return;
   }
   gapi.client.load('plus','v1', function() {
   if (authResult['access_token']) {
      var request = gapi.client.plus.people.get( {'userId' : 'me'} );
      request.execute( function(profile) {
         if (profile.error) {
            alert(profile.error);
            return;
         }
         loc = "Not specified";
         if (profile.placesLived)
         {
            var t = profile.placesLived;
            for (var key in t)
            {
               loc = t[key].value;
               break;
            }
         }
         //alert(loc);

         fbid = profile.id;
         uname = profile.displayName;
         token = authResult['access_token'];
         logtype = 3;
         fbready();
      });
   } else if (authResult['error']) {
/*
      var em = { 'user_signed_out': 'User is signed out', 'access_denied': 'Access to BEV Newsfeed was denied',
                 'immediate_failed': 'Could not automatically log in the user' }
      alert(em[authResult['error']]);
*/
   }});
}

function FBInit()
{
   FB.init({
      //appId: '450525878309993',        // dev
      appId: '421371531230227',
      channelUrl: 'http://'+host+'/feed2/channel.php',
   });
   fbInited = true;
   /*
   FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
         var id = response.authResponse.userID;
         var token = response.authResponse.accessToken;
         var expires = response.authResponse.expiresIn;
         //alert(id+", "+expires+", "+token);
      } else if (response.status === 'not_authorized') {
         alert("Not authorized: "+response.error.message);
         return;
      }
   });
   */
   $('#fblogimg').css("cursor", "pointer");
   $('#fblogimg').click(function() {
      $(".working").show();
      FB.login(function(response) { handleFBLogin(response); },
                         {scope: 'user_location,publish_stream,read_stream'});
   });
}

function dumpStartVals()
{
   var s = "<h2>Startup values</h2>";
   s += uname+", ";
   s += fbid+", ";
   s += token.substr(0, 20)+"..., ";
   s += logtype+", ";
   s += bcid;
   s += "<p>"+$('#startup').val();
   return s;
}

function initialize()
{
/*
   $(document).ajaxError(function (event, xhr) {
       alert("An AJAX call failed ("+xhr.status+"): "+xhr.statusText);
   });
*/
   $.ajaxSetup({ cache: true, timeout: 60000 });
   $.getScript('//connect.facebook.net/en_UK/all.js', function() { FBInit(); });
   gImmediate = true;
   $.getScript('https://apis.google.com/js/client:plusone.js', function() { gRender(); });
   $.ajaxSetup({ cache: false });

   $.get("/php/hs_logvisit.php?cid=britseye&pid=Newsfeed&path=/feed/m");
   bcid = 0;
   fbid = "";

   uname = $('#name').attr('value');
   logtype = parseInt($('#logtype').attr('value'));
   bcid = $('#bcid').attr('value');
   fbid = $('#fbid').attr('value');
   dept = parseInt($('#dept').attr('value'));
   mobile = parseInt($('#mobile').attr('value'));
   fixupDialogs();
   if (!logtype)
   $('#slogtype').val(logtype);
   $('#contribid').val(bcid);
   $('#sdept').val(dept);
   $('#regdept').val(dept);
   if (logtype > 0)
   {
      if (logtype == 1)
         flags = parseInt($('#flags').val());
      interval1 = setInterval(checkMsgStatus, 60000);
      $('#feeddiv').show();
   }
   else
   {
      $('#userid').val("");
      $('#pass').val("");
      $('#logindiv').show();
      $('#logdiv').show();
      //$('#loggeduser').html("Logout user");
   }

	$('#invite_status').click(function() {
	   if (logtype == 0)
      {
         alert("You must be logged in to post");
         return;
      }
	   $('#invite_status').hide();
	   $('#enter_status').show();
	   $('#status_te').focus();
	});
	fixClix("trigger", "feed");
   fixPnsClicks();

	$('#status_cancel').click(function() {
	   $('#status_te').val("");
	   $('#file').val("");
	   $('#enter_status').hide();
	   $('#invite_status').show();
	   return false;
	});
	$('.picdivclose').click(function() {
	   $('#picdiv').hide();
	   picdivup = false;
	});
   $('#sfgo').click(function() { submitNewItem(); });
   $('#status_form').ajaxForm(function(ret) { addNewItem(ret);});

   $('#utgo').click(function() { submitThumb(); });
   $('#utid').val(bcid);
   $('#ut_form').ajaxForm(function(reply) { doUpdateThumb(reply); });

   $('#reggo').click(function() { submitRegister(); });
   $('#register_form').ajaxForm(function(reply) { doBevRegister(reply); });

   $('#debuginfo').html($('#startup').val());
   getLatest();
}
