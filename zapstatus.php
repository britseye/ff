<?php
error_reporting(-1);
ini_set('display_errors', 'On');

include_once "not4everyone.php";
include_once "constants.php";
include_once "tea.php";
include_once "checktoken.php";
header("Content-type: text/plain");
if (!$token_ok)
   exit();

$db = dbConnect();
if (!$db) exit();

$id = $_GET["bcid"];
$sid = $_GET["sid"];
$ip = $_SERVER["REMOTE_ADDR"];
$db->query("delete from fffeed where id=$sid");
$db->query("delete from ffcomments where sid=$sid");
$db->query("delete from ffimages where iid=$iid");
// There's nothing useful to return
?>

