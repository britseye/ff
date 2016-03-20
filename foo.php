<?php
function writePost($row, $uid)
{
   $logtype = $row[1];
   $sid = $row[0]; $owner = $row[2]; $text = $row[3]; $iid= $row[4]; $width = $row[5]; $height = $row[6];
   $flags = $row[7]; $dep = $row[8]; $ts = $row[9]; $fbid = $row[10]; $poster = $row[11];
   $pc = "poster";
   if ($owner != $uid)
      $pc = "aposter";

   $s = '<div id="post'.$sid.'" class="feeditem">'."\n";
   $s .= '<img class="thumb" src="';
   // Thumbnail source
   if ($logtype == 3)
      $s .= 'https://plus.google.com/s2/photos/profile/'.$fbid.'?sz=50">';
   else if ($logtype == 2)
      $s .= 'https://graph.facebook.com/'.$fbid.'/picture">';
   //else
      $s .= '/feed/getthumb.php/'.$owner.'">';
   // Poster name and details
   $s .= '<div class="posthdr">';
   $s .= '<span id="pns'.$sid.'" data-owner="'.$owner.'" class="'.$pc.'">'.$poster.'</span>'."\n";
   // Date/time
   $s .= '      <span class="datetime">('.$ts;
   //if ($flags & 1)
   //   $s .= ' - from phone';
   $s .= ')</span>'."\n";
   // Animated wait gif
   $s .= '      <img id="pwait'.$sid.'" src="/feed/working.gif" class="pwait">';
   $s .= "</div>\n";
   // The post text
   $s .= '      <div class="posttxt" id="posttxt'.$sid.'">'.$text.'</div>'."\n";

   // Image if any
   if ($iid > 0)   // Yup, image
   {
      $s .= '<div style="height:8px; clear:both;"></div>'."\n";
      $s .= '      <img src="/feed/m/getimg2.php/'.$iid.'" class="postimg" id="postimg'.$iid.'">';
   }
   $s .= '<div style="height:4pt; clear:both;"></div>'."\n";

   return $s;
}
?>
