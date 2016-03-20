CREATE TABLE IF NOT EXISTS softcent_britseye.`ffmembers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` tinyint(1) NOT NULL DEFAULT '0',
  `fid` varchar(50) DEFAULT NULL,
  `moniker` varchar(50) DEFAULT NULL,
  `pass` varchar(50) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `ftoken` varchar(255) NOT NULL DEFAULT '',
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `imgtype` tinyint(4) NOT NULL DEFAULT '0',
  `mugshot` mediumblob,
  `instance` tinyint(4) NOT NULL DEFAULT '0',
  `flags` int(4) unsigned NOT NULL DEFAULT '0',
  `email` varchar(50) NOT NULL DEFAULT '',
  `mts` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS softcent_britseye.`ffinstances` (
  `id` tinyint(4) NOT NULL DEFAULT '0',
  `sname` varchar(20) NOT NULL DEFAULT '',
  `value` varchar(256) NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS softcent_britseye.`ffimages` (
  `iid` int(11) NOT NULL AUTO_INCREMENT,
  `owner` varchar(50) DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `width` int(11) NOT NULL DEFAULT '0',
  `height` int(11) NOT NULL DEFAULT '0',
  `type` tinyint(4) DEFAULT '0',
  `imgdata` mediumblob NOT NULL,
  PRIMARY KEY (`iid`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS softcent_britseye.`ffmessages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fromid` int(11) NOT NULL DEFAULT '0',
  `toid` int(11) NOT NULL DEFAULT '0',
  `subject` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT '(no subject)',
  `mbody` text CHARACTER SET utf8 NOT NULL,
  `readflag` tinyint(4) NOT NULL DEFAULT '0',
  `tr` datetime DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS softcent_britseye.`fffeed` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `logtype` tinyint(4) NOT NULL DEFAULT '1',
  `owner` int(10) unsigned DEFAULT NULL,
  `text` text NOT NULL,
  `iid` int(10) unsigned NOT NULL DEFAULT '0',
  `width` int(10) unsigned NOT NULL DEFAULT '0',
  `height` int(10) unsigned NOT NULL DEFAULT '0',
  `flags` int(11) NOT NULL,
  `instance` tinyint(4) NOT NULL DEFAULT '0',
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ffcomments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sid` int(11) NOT NULL COMMENT 'Status id this comment relates to',
  `logtype` tinyint(4) NOT NULL DEFAULT '1',
  `owner` int(11) DEFAULT '0',
  `text` varchar(1024) NOT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS softcent_britseye.`ffcomments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sid` int(11) NOT NULL COMMENT 'Status id this comment relates to',
  `logtype` tinyint(4) NOT NULL DEFAULT '1',
  `owner` int(11) DEFAULT '0',
  `text` varchar(1024) NOT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS softcent_britseye.`ffudetail` (
  `uid` int(11) NOT NULL,
  `dob` varchar(45) DEFAULT NULL,
  `phone` varchar(45) DEFAULT NULL,
  `address1` varchar(60) DEFAULT NULL,
  `address2` varchar(60) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `region` varchar(45) DEFAULT NULL,
  `postcode` varchar(45) DEFAULT NULL,
  `country` varchar(45) DEFAULT NULL,
  `hru` varchar(80) DEFAULT NULL,
  `imageid` int(11) DEFAULT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
