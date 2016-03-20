<?php
error_reporting(-1);
ini_set('display_errors', 'On');

include_once "not4everyone.php";
include_once "constants.php";
include_once "tea.php";
include "bail.php";
include_once "checktoken.php";
header("Content-type: text/plain");
if (!$token_ok)
   bail("Operation blocked.<br>Your security token is invalid ($token_msg)");

$db = dbConnect();
if (!$db) bail(sql_error());

$toid = $_GET["toid"];
$fromid = $_GET["fromid"];
$mbody = $db->real_escape_string($_GET["mbody"]);
$ip = $_SERVER["REMOTE_ADDR"];

$result = $db->query("update ffmessages set readflag=1 where fromid=$toid and toid=$fromid");
if (!$result) bail($db->error);
$result = $db->query("insert into ffmessages (fromid, toid, mbody) values($fromid, $toid, '$mbody')");
if (!$result) bail($db->error);
$mid = $db->insert_id;
$rv["success"] = true; $rv["msgid"] = $mid; $rv["fromid"] = $fromid; $rv["toid"] = $toid;
echo json_encode($rv);
?>

