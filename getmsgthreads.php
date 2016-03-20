<?php
error_reporting(-1);
ini_set('display_errors', 'On');

include_once "not4everyone.php";
include_once "constants.php";
include_once "tea.php";
include "bail.php";
/*
include_once "checktoken.php";
header("Content-type: text/plain");
if (!$token_ok)
   bail("Content blocked.\nYour security token is invalid ($token_msg)");
*/
header("Content-type: text/plain");
function writeThreadItem($oid, $oname, $text, $ts, $direction, $read)
{
   $text = str_replace("\n\n", '<p class="nps">', $text);
   $text = str_replace("\n", '<br>', $text);
   $text = substr($text, 0, 30)." ...";
   $s = '<div class="threaditem" data-oid="'.$oid.'" data-oname="'.$oname.'" style="cursor:pointer;">'."\n";
   // Poster name and details
   $s .= '<span class="clicktext sender">'.$oname.'</span>'."\n";
   // Date/time
   $s .= '      <span class="datetime">('.$ts.')</span><br>'."\n";
   // The post text
   $s .= '<div style="margin-top:0.5em;">'."\n";
   $s .= $direction.'<span class="posttxt" style="margin-top: 0.5em">'.$text.'</span>'."\n";
   $s.= "</div>\n";
   $s .= '<div style="border-top:solid 1px #bbbbdd; margin-top:5px; height:5px;"></div>'."\n";
   $s .= "</div>\n";
   return $s;
}

$db = dbConnect();
if (!$db) bail(sql_error());

$cu = $_GET["cu"];
$ip = $_SERVER["REMOTE_ADDR"];

$sa = array();
$sql =
   "select a.id, a.fromid, a.toid, a.mbody, a.readflag, a.ts, c.id, c.name from ffmessages as a, ffmembers as c".
   " where (a.fromid=$cu or a.toid=$cu) and (c.id=a.fromid or c.id=a.toid) and c.id <> $cu order by a.ts desc";
$result =$db->query($sql);
if (!$result) bail($db->error);
$count = $result->num_rows;
$s = "";
for ($i = 0; $i < $count; $i++)
{
   $row = $result->fetch_row();
//print_r($row);
   $mid = $row[0];
   $fid = $row[1];
   $tid = $row[2];
   $oname = $row[7];
//bail($oname);
   $direction = "";
   if (array_key_exists($oname, $sa))
      continue;
   else
      $sa[$oname] = "";
   if ($cu == $fid) {
      $oid = $tid;
      $direction = "&gt; ";
   }
   else
   {
      $oid = $fid;
      $direction = "&lt; ";
   }
   $text = $row[3];
   $read = $row[4];
   $ts = $row[5];
   $s .= writeThreadItem($oid, $oname, $text, $ts, $direction, $read);
}
$rv["success"] = true; $rv["text"] = $s;
echo json_encode($rv);
?>
