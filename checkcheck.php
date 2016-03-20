<?php
error_reporting(-1);
ini_set('display_errors', 'On');

include_once "not4everyone.php";
include_once "constants.php";
include_once "tea.php";
include_once "checktoken.php";

if (!$token_ok)
   die("NO+Bad token - $token_msg");

echo "OK+id: $ffid, flags: $ffflags";
?>