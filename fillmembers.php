<?php
error_reporting(-1);
ini_set('display_errors', 'On');

include_once "not4everyone.php";
include_once "constants.php";
include_once "tea.php";
include_once "checktoken.php";
header("Content-type: text/plain");
if (!$token_ok)
   die("Content blocked.<br>Your security token is invalid\n($token_msg)");

function writeUser($row, $cu)
{

   $uid = $row[0]; $logtype = $row[1]; $fid = $row[2]; $name = $row[5];
   $msgs = ($uid == $cu)? "threads": "conversation";
   $s = '<div class="uldiv" style="margin-bottom:1em;">'."\n";
   $s .= '<table style="width:100%;"><tr style="vertical-align:top"><td style="width:15mm;">'."\n";
   $s .= '   <img class="ulthumb showsud" data-owner="'.$uid.'" style="cursor:pointer;" src="';
   //if ($logtype == 3)
   //   $s .= 'https://plus.google.com/s2/photos/profile/'.$fid.'?sz=50">';
   //else if ($logtype == 2)
   //   $s .= 'https://graph.facebook.com/'.$fid.'/picture">';
   //else
      $s .= '/ff/m/getthumb.php/'.$uid.'">'."\n";
   $s .= "</td><td>\n";
   $s .= '<span class="halfclick showsud" data-owner="'.$uid.'" style="cursor:pointer;">'.$name."</span><br>\n";
   $s .= '<div style="margin-top:0.3em">'."\n";
   $s .= '<span class="clicktext" style="margin-top:2em;" onclick="switch2messages('."'$msgs'".', '.$uid.');">Messages</span></div>'."\n";
   $s .= "</td></tr></table>\n";
   $s .= "</div>\n";
   echo $s;
}

$cu = $_GET["cu"];

$db = dbConnect();
if (!$db) die(sql_error());

$result = $db->query("select * from ffmembers order by ts desc");
if (!$result) die($db->error);
if ($result->num_rows)
{
	while ($row = $result->fetch_row())
	{
	   writeUser($row, $cu);
   }
}

?>
