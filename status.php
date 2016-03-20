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

include "writepost.php";

$db = dbConnect();

$status = $db->real_escape_string($_POST["status"]);
$contrib = $_POST["contribid"];
$logtype = $_POST["logtype"];
$dept = 0;//$_POST["dept"];
$ip = $_SERVER["REMOTE_ADDR"];

$imgsize = 0;
$filecount = count($_FILES);
if ($filecount)
{
   $imgsize = $_FILES["file"]["size"];
}
$iid = 0;
$width = 0;
$height = 0;
if ($imgsize > 0 && $_FILES["file"]["error"] > 0) bail($rv, "Image transfer error");

if (strlen($status) == 0) bail($rv, "Post has no text");

if ($imgsize > 0)
{
   $tmpname = $_FILES['file']['tmp_name'];
   $isd = getimagesize($tmpname);
   $imgtype = $isd[2];
   $width = $isd[0];
   $height = $isd[1];
   if ($imgtype < 4 && $imgsize < 2000000)
   {
      $instr = fopen($tmpname,"rb");
      $image = addslashes(fread($instr,filesize($tmpname)));
      if (strlen($image) < 16777000)
      {
         if (!$db->query("insert into ffimages (iid, owner, width, height, type, imgdata) values (NULL, NULL, $width, $height, $imgtype, '$image')"))
            bail($rv, $db->error);
         $iid = $db->insert_id;
      }
      else
      {
         bail($rv, "Image is too big");
      }
   }
   else
   {
      bail($rv, "Image type is not supported, or image too big");
   }
}

$query =
"insert into fffeed (id, logtype, owner, text, iid, width, height, flags, instance) values (NULL, $logtype, $contrib, '$status', $iid, $width, $height, 0, $dept)";
if (!$db->query($query))
   bail($rv, $db->error);
$id = $db->insert_id;
$s = "Aaaargh";
// Now read it back, and use writepost to format it
$pquery =
"select fffeed.*, ffmembers.fid, ffmembers.name from fffeed LEFT JOIN ffmembers ON fffeed.owner=ffmembers.id ".
"where fffeed.id=$id";

$result = $db->query($pquery);
if (!$result) bail($rv, $db->error);
$s = "";

if ($result->num_rows)
{
   $row = $result->fetch_row();
   $s = writePost($row, $contrib);
   $s .= "\n";
   // This is where comments will get added
   $s .= '      <div class="sentinel"></div>'."\n";
   $s .= '      <span class="clickable" style="cursor:pointer;" onclick="addComment('.$row[0].');">Add your comment</span>';
   $s .= '   <div style="border-top:solid 1px #aaaaaa; margin:4pt 0 3pt 0; height:5px;"></div>'; // line under post
   $s .= "\n</div>"; // end of post
}
else
   bail($rv, "Post not found");
$rv["success"] = true; $rv["sid"] = $id; $rv["logtype"] = $logtype; $rv["iid"] = $iid; $rv["width"] = $width; $rv["height"] = $height;
$rv["text"] = $s;
echo json_encode($rv);
?>
