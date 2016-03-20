<?php
error_reporting(-1);
ini_set('display_errors', 'On');
header("Content-type: text/plain");
require 'foo.php';
$a=array(1,1,3,4,5,6,7,8,9,10,11,12,13,14);
echo writePost($a,3);
?>
