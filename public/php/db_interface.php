<?php

class DBIface {
    private static $dbh;

    public static function connect() {
        if (!isset(self::$dbh)) {
            $username = "thebi_unis_db";
            $password = "sidiboy95";
            $hostname = "mySQL19.webland.ch";
            $dbname = "thebi_unis_db";
            try {
                self::$dbh = new PDO("mysql:host=".$hostname.";dbname=".$dbname.";charset=utf8", $username, $password);
            }
            catch(PDOException $e) {
                // Uncomment the following line to turn on errors
                // WARNING: It may display DB login details in browser, don't enable on live site!
                //echo $e->getMessage();
            }
        }
        return self::$dbh;
    }
}
