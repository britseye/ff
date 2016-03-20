<?php
error_reporting(-1);
ini_set('display_errors', 'On');

include_once "not4everyone.php";
include_once "constants.php";
include_once "tea.php";
include_once "checktoken.php";
header("Content-type: text/plain");
if (!$token_ok)
   die("Content blocked.<br>Your security token is invalid ($token_msg)");

function writeMsg($cu, $mid, $fid, $tid, $from, $text, $ts, $read)
{
   $text = str_replace("\n\n", '<p class="nps">', $text);
   $text = str_replace("\n", '<br>', $text);

   $s = '<div class="msgitem" id="m'.$mid.'">'."\n";
   // Poster name and details
   $sclass = ($fid == $cu)? " from": "";
   $s .= '<span class="noclicktext" id="sns'.$mid.'">'.$from.'</span>'."\n";
   // Date/time
   $s .= '      <span class="datetime">('.$ts.')</span>'."\n";
   // The post text
   $s .= '      <div class="posttxt">'.$text.'</div>'."\n";
   $s .= '<div style="clear:both; border-top:solid 1px #bbbbdd; margin-top:5px; height:5px;"></div>'."\n";
   $s .= "</div>\n";
   return $s;
}

$db = dbConnect();
if (!$db) die(sql_error());

$cu = $_GET["cu"];
$other = (isset($_GET["other"]))? $_GET["other"]: "*";
$ip = $_SERVER["REMOTE_ADDR"];

$count = 0;
$sql =
"select a.id, a.fromid, a.toid, a.mbody, a.readflag, a.ts, b.id, b.name, c.id, c.name from ffmessages as a, ffmembers as b, ffmembers as c ".
"where ((a.fromid=$cu and a.toid=$other) or (a.fromid=$other and a.toid=$cu)) and b.id=a.fromid and c.id=a.toid order by b.ts desc";
$result = $db->query($sql);
if (!$result) die($db->error);
$count = $result->num_rows;
$oname = "";
$from = "";
$oid= "";
$first = true;
for ($i = 0; $i < $count; $i++)
{
   $row = $result->fetch_row();
//print_r($row);

   $mid = $row[0];
   $fid = $row[1];
   $tid = $row[2];
   $text = $row[3];
   $read = $row[4];
   $ts = $row[5];
   $from = $row[7];
   if ($first)
   {
      if ($fid == $cu)
      {

         $oid = $other;
         $oname = $row[9];
      }
      else
      {
         $oid = $cu;
         $oname = $row[7];
      }
      $first = false;;
   }

   echo writeMsg($cu, $mid, $fid, $tid, $from, $text, $ts, $read);
}

echo '<input type="hidden" id="ml_oname" value="'.$oname.'">'."\n";
echo '<input type="hidden" id="ml_oid" value="'.$oid.'">'."\n";

$sql = "update ffmessages set readflag=1 where fromid=$cu and toid=$oid";
$db->query($sql);

?>
