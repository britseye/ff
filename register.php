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
   bail("Operation blocked.\nYour security token is invalid ($token_msg)");

function imageToThumb($srcFile, $size) {
    list($wo, $ho, $type) = getimagesize($srcFile);

    // Temporarily increase the memory limit to allow for larger images
    ini_set('memory_limit', '32M');
    switch ($type)
    {
        case IMAGETYPE_GIF:
            $image = imagecreatefromgif($srcFile);
            break;
        case IMAGETYPE_JPEG:
            $image = imagecreatefromjpeg($srcFile);
            break;
        case IMAGETYPE_PNG:
            $image = imagecreatefrompng($srcFile);
            break;
        default:
            throw new Exception('Unrecognized image type ' . $type);
    }

    // create a new blank image of the thumbmail size
    $newImage = imagecreatetruecolor($size, $size);

    // portrait
    if ($wo > $ho)
    {
        $x = $wo/2-$ho/2;
        imagecopyresampled($newImage, $image, 0, 0, $x, 0, $size, $size, $ho, $ho);
    }
    else
    {
        $y = $ho/2-$wo/2;
        imagecopyresampled($newImage, $image, 0, 0, 0, $y, $size, $size, $wo, $wo);
    }
    imagedestroy($image);
    unlink($srcFile);

    imagejpeg($newImage, $srcFile);
    imagedestroy($newImage);

    if ( is_file($srcFile) ) {
        $f = fopen($srcFile, 'rb');
        $data = fread($f, 100000);
        fclose($f);
        unlink($srcFile);
        return $data;
    }
    throw new Exception('Image conversion failed.');
}

if ($_SERVER['REQUEST_METHOD'] != "POST") bail("Strange submission - not POST");
if (!isset($_POST['username'])) bail("Strange submission - no user name");
if (!isset($_POST['pass1'])) bail("Strange submission - no password");


$db = dbConnect();
if (!$db) bail(sql_error());

$moniker = $db->real_escape_string($_POST["userid"]);
$name = $db->real_escape_string($_POST["username"]);
$pass = $db->real_escape_string($_POST["pass1"]);

$pass = md5("raT69arSe$pass");
$email = $db->real_escape_string($_POST["remail"]);

$ip = $_SERVER["REMOTE_ADDR"];

$imgsize = 0;
$imgtype = 0;
$filecount = count($_FILES);

if ($filecount)
{
   $imgsize = $_FILES["rmug"]["size"];
}
$img = null;
$ok = true;

if ($imgsize > 0 && $_FILES["rmug"]["error"] > 0) bail("Image transfer error");
if ($imgsize > 0)
{
   if ($imgsize > 200000)
      bail("Image too big");
   $tmpname = $_FILES['rmug']['tmp_name'];
   list($width, $height, $type) = getimagesize($tmpname);
   $imgtype = $type;
   if ($imgtype < 4)
   {
      try {
         $img = imageToThumb($tmpname, 50);
      }
      catch (Exception $e) {
         bail("Image conversion failed");
      }
      $img = addslashes($img);
   }
   else bail("Unsupported image type");
}

$query = "insert into ffmembers (id, type, moniker, pass, name, imgtype, mugshot, flags, email) ".
"values (NULL, 1, '$moniker', '$pass', '$name', $imgtype, '$img', 0, '$email')";
if (!$db->query($query))
   bail($db->error);
$bcid = $db->insert_id;

$rv["success"] = true; $rv["uid"] = $bcid; $rv["moniker"] = $moniker; $rv["name"] = $name;
echo json_encode($rv);
?>
