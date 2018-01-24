<?php
require_once ("config.php");

$conf_file = constants::CONFIG;

if(file_exists($conf_file)) {
    require_once $conf_file;
    class DB
    {
        public function __construct()
        {
            $this->base = new Database();
        } 
    }
    class Database
    {
       public function __construct()
        {
            if(defined('DBHOST') 
                && defined('DBUSER') 
                && defined('DBPASS') 
                && defined('DBNAME') 
                && defined('CHARACTER') 
                && defined('USERPREFIX')) {
                    $this->createDB();
                     $this->connect();
            } else {
                die ("Constants for connection not defined!");
            }
            
        }
        public function createDB()
        {   
            $dsn = "mysql:host=".DBHOST.";charset=".CHARACTER;
            $opt = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $connection = new PDO($dsn,DBUSER, DBPASS, $opt);
            $sql        = "CREATE DATABASE IF NOT EXISTS ".DBNAME;
            $connection->exec($sql);
            $sql = "use ".DBNAME;
        }
        public function connect()
        {
            $dsn = "mysql:dbname=".DBNAME.";host=".DBHOST.";charset=".CHARACTER;
            $opt = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $connection = new PDO($dsn, DBUSER, DBPASS, $opt);
            return $connection;
        }
        public function qPrep($sql, $args)
        {
            $connection = $this->connect();
            $stmt       = $connection->prepare($sql);
            $ret        = $stmt->execute($args);
            return $ret;
        }
        public function q($sql)
        {
            $connection = $this->connect();
            return $connection->exec($sql);
        }
        public function qconv($sql)
        {
            unset($out);
            $connection = $this->connect();
            $stmt       = $connection->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch()) {
                $out[] = $row;
            }
            return $out;
        }
        public function get_enum($table_name, $field_name)
        {
            $connection = $this->connect();
            $sql        = "desc {$table_name} {$field_name}";
            $st         = $connection->prepare($sql);

            if ($st->execute()) {
                $row = $st->fetch();
                if ($row === false) {
                    return false;
                }

                $type_dec = $row['Type'];
                if (substr($type_dec, 0, 5) !== 'enum(') {
                    return false;
                }

                $values = array();
                foreach (explode(',', substr($type_dec, 5, (strlen($type_dec) - 6))) as $v) {
                    array_push($values, trim($v, "'"));
                }

                return $values;
            }
            return false;
        }
        function logging($base_name, $names, $values)
        {
            foreach ($values as $value) {
                $expressions .= $value . ',';
            }
            $line    = "[" . date("Y-m-d H:i:s") . "] [MYSQL] " . $base_name . " " . $names . " VALUES (" . trim($expressions, ',') . ") Login " . $_SESSION['user'] . ", IP " . $_SERVER['REMOTE_ADDR'] . "\r\n";
            $logfile = fopen("_" . date("Y") . "-" . date("m") . ".log", "a");
            var_dump($logfile);
            fwrite($logfile, $line);
            fclose($logfile);
        }

    }
} else {
    die("File {$conf_file} not found!");
}
