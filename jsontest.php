<?php
error_reporting(-1);
ini_set('display_errors', 'On');
header("Content-type: text/plain");

function bale(&$a, $msg)
{
   $a["status"] = false;
   $a["errmsg"] = $msg;
   $s = json_encode($a);
   die($s);
}

$rv = array();
bale($a, "no bloody good!");

echo "OK";
?>