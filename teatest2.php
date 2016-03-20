<?php
error_reporting(-1);
ini_set('display_errors', 'On');
header("Content-type: text/plain");
include "tea.php";
$s= "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJmZi5vcmciLCJpZCI6MCwibmFtZSI6IkJyaXRzRXllIiwiZmxhZ3MiOjEsImV4cGlyZXMiOjE0NjAxMDAyMjd9.fad92373ffaf5d0eac8b44d9304a02fd8782f347a1c271f8438da3391f94ba3a";
$rpt = encrypt($s, "1234567890abcdef");

echo $rpt;
?>
