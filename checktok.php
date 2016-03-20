<?php
error_reporting(-1);
ini_set('display_errors', 'On');
include "not4everyone.php";
include_once "constants.php";
include "tea.php";

$ffid = -1;
$ffflags = 0;
$token_ok = false;

$authData = $_SERVER['HTTP_FF_TOKEN'];
$ct = base64_decode($authData);
$dt = decrypt( $ct, $ffkey );
$dt = trim($dt, "\0");
$a = explode(".", $dt);
$hdr = $a[0];
$hdr = base64_decode($hdr);
$payload = $a[1];
$payload = base64_decode($payload);
$sig = hash('sha256', $hdr.$payload."1234567890abcdef");
if ($sig != $a[2])
   die("Token invalid");
$obj = json_decode($payload);
$marker = substr(hash('sha256', ''.$obj->expires.$ffmark), 0, 10);
if ($marker != $obj->marker) die('Token was not marked by server');
$ffid = $obj->id;
$ffflags = $obj->flags;
$exp = $obj->expires;
echo "Token is valid $ffid $exp";
?>
