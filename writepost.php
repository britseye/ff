<?php
function writePost($row, $uid)
{
   $logtype = 1;//$row[1];
   $sid = $row[0]; $owner = $row[2]; $text = $row[3]; $iid= $row[4]; $width = $row[5]; $height = $row[6];
   $flags = $row[7]; $dep = $row[8]; $ts = $row[9]; $fid = $row[10]; $poster = $row[11];
   $ts = str_replace(' ', '<br>', $ts);
   $class = ($owner == $uid)? "clicktext poster": "noclicktext poster";

   $s = '<div id="post'.$sid.'" class="feeditem">'."\n";  // Start of whole feed item
   $s .= '<div id="postpart'.$sid.'" class="postpart" data-owner="'.$owner.'" data-postid="'.$sid.'">'."\n";
   $s .= '<img id="pthumb'.$sid.'" class="thumb fithumb" src="';
   // Thumbnail source
   /*
   if ($logtype == 3)
      $s .= 'https://plus.google.com/s2/photos/profile/'.$fid.'?sz=50">';
   else if ($logtype == 2)
      $s .= 'https://graph.facebook.com/'.$fid.'/picture">';
   else
   */
      $s .= '/ff/m/getthumb.php/'.$owner.'" data-owner="'.$owner.'">';
   // Poster name and details
   $s .= '<div class="posthdr">';
   $s .= '<span id="ospan'.$sid.'" data-owner="'.$owner.'" class="'.$class.'">'.$poster.'</span>'."\n";
   // Date/time
   $s .= '      <div class="datetime" style="display:inline-flex; height:3em; vertical-align:top;">'.$ts;
   //if ($flags & 1)
   //   $s .= ' - from phone';
   $s .= "</div>\n";
   // Animated wait gif
   $s .= '      <img id="pwait'.$sid.'" src="/ff/m/working.gif" class="pwait">';
   $s .= "</div>\n";
   // The post text
   $s .= '      <div class="posttxt" id="posttxt'.$sid.'">'.$text.'</div>'."\n";

   // Image if any
   if ($iid > 0)   // Yup, image
   {
      $s .= '<div style="height:8px; clear:both;"></div>'."\n";
      $s .= '      <img src="/ff/m/getimg2.php/'.$iid.'" class="postimg" id="postimg'.$iid.'">';
   }
   $s .= '<div style="height:4pt; clear:both;"></div>'."\n";
   $s .= "</div>\n";    // End of postpart
   return "$s";
}
?>