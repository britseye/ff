<?php
/* Copyright: Copyright 2016
 * License:   $(LINK www.boost.org/LICENSE_1_0.txt, Boost License 1.0).
 * Author:   Steve Teale
 */
error_reporting(-1);
ini_set('display_errors', 'On');

include_once "not4everyone.php";
include_once "constants.php";
/*
include_once "tea.php";
include_once "checktoken.php";
header("Content-type: text/plain");
if (!$token_ok)
   die("Content blocked.<br>Your security token is invalid ($token_msg)");
*/
function getStrings($db, $dept)
{
   $a = array();
   $a["banner"] = "";
   $a["site"] = "";
   $a["sitett"] = "";
   $a["title"] = "";
   $a["rctitle"] = "";
   $a["lcend"] = "";
   $a["reserved"] = "";
   $result = $db->query("select * from departments where id=$dept");
   if (!$result) die($db->error);
   while ($row = $result->fetch_row())
   {
      $a[$row[1]] = $row[2];
   }
   return $a;
}

function writePost($row, $uid)
{
   $logtype = 1;//$row[1];
   $sid = $row[0]; $owner = $row[2]; $text = $row[3]; $iid= $row[4]; $width = $row[5]; $height = $row[6];
   $flags = $row[7]; $dep = $row[8]; $ts = $row[9]; $fbid = $row[10]; $poster = $row[11];
   $pc = "poster";
   if ($owner != $uid)
      $pc = "aposter";

   $s = '<div id="post'.$sid.'" class="feeditem" data-owner="'.$owner.'">'."\n";
   $s .= '<img id="pthumb'.$sid.'" class="thumb thumbclass" src="';
   // Thumbnail source
   /*
   if ($logtype == 3)
      $s .= 'https://plus.google.com/s2/photos/profile/'.$fbid.'?sz=50">';
   else if ($logtype == 2)
      $s .= 'https://graph.facebook.com/'.$fbid.'/picture">';
   else
   */
      $s .= '/ff/m/getthumb.php/'.$owner.'" data-owner="'.$owner.'">';
   // Poster name and details
   $s .= '<div class="posthdr">';
   $s .= '<span id="pns'.$sid.'" data-owner="'.$owner.'" class="'.$pc.'">'.$poster.'</span>'."\n";
   // Date/time
   $s .= '      <span class="datetime">('.$ts;
   //if ($flags & 1)
   //   $s .= ' - from phone';
   $s .= ')</span>'."\n";
   // Animated wait gif
   $s .= '      <img id="pwait'.$sid.'" src="/ff/m/working.gif" class="pwait">';
   $s .= "</div>\n";
   // The post text
   $s .= '      <div class="posttxt" id="posttxt'.$sid.'">'.$text.'</div>'."\n";

   // Image if any
   if ($iid > 0)   // Yup, image
   {
      $s .= '<div style="height:8px; clear:both;"></div>'."\n";
      $s .= '      <img src="/ff/m/getimg2.php/'.$iid.'" class="postimg" id="postimg'.$iid.'">';
   }
   $s .= '<div style="height:4pt; clear:both;"></div>'."\n";
   return "$s";
}

function writeComment($row, $uid)
{
   $logtype = $row[2];
   $cid = $row[0]; $sid = $row[1];  $owner = $row[3]; $text = $row[4];
          $ts = $row[5]; $fbid = $row[6]; $name = $row[7];
   $pc = "commenter";
   if ($owner != $uid)
      $pc = "acommenter";

   $s = '      <div id="cd'.$cid.'" class="comment">'."\n";
   // Small thumbnail
   $s .= '            <img class="smallthumb" src="';
   if ($logtype == 3)
      $s .= 'https://plus.google.com/s2/photos/profile/'.$fbid.'?sz=50">';
   else if ($logtype == 2)
      $s .= 'https://graph.facebook.com/'.$fbid.'/picture">';
   else
      $s .= '/ff/m/getthumb.php/'.$owner.'">';
   $s .= "\n";
      // Comment owner and commenter name
   $s .= '   <span id="cns'.$cid.'" data-owner="'.$owner.'" class="cns '.$pc.'">'.$name.' </span>'."\n";
   // The comment, and close
   $s .= '   <div id="comspan'.$cid.'" class="comtxt">'.$text."</div>\n";
   $s .= "</div>\n";
   $s .= '<div style="height:1px; clear:both;"></div>'."\n";
   return $s;
}

$db = dbConnect();
if (!$db) die(sql_error());
$result = $db->query("SET time_zone = '+00:00'");
if (!$result) die($db->error);
$strings = getStrings($db, 0);

$user = $_GET["uid"];

$pquery =
"select fffeed.*, bevcom.fbid, bevcom.name from fffeed LEFT JOIN bevcom ON fffeed.owner=bevcom.id where fffeed.dept=0 order by fffeed.id desc limit 10";
$cquery =
"select nfcomments.*, bevcom.fbid, bevcom.name from nfcomments LEFT JOIN bevcom ON nfcomments.owner=bevcom.id where nfcomments.sid=";
$result = $db->query($pquery);

if (!$result) die($db->error);
if ($result->num_rows)
{
	while ($row = $result->fetch_row())
	{
	   $s = writePost($row, $user);
	   echo "$s\n";
	   $cresult = $db->query($cquery.$row[0]);
	   if (!$cresult) die($db->error);
	   $s = "";
	   while ($crow = $cresult->fetch_row())
	   {
	      $s .= writeComment($crow, $user);
      }
      echo "$s\n";
      // This is where comments will get added
	   echo '      <div class="sentinel"></div>'."\n";
	   echo '      <span class="poster" style="cursor:pointer;" onclick="addComment('.$row[0].');">Add your comment</span>';
	   echo '   <div style="border-top:solid 1px #aaaaaa; margin:4pt 0 3pt 0; height:5px;"></div>'; // line under post
	   echo "\n</div>"; // end of post
	}
   echo '<p class="byebye">'.$strings["lcend"]."</p>";
}
?>
