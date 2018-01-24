<?php
 function checkData($array)
    {
    	if(is_array($array)) {
    		foreach ($array as $key => $value) {
               $shielding[$key] = trim(htmlspecialchars($value));
            }
    	} else {
    		$shielding = trim(htmlspecialchars($array));
    	}
        return $shielding;
    }
 function logging($base_name, $action, $query)
        {
            $line = "[" . date("Y-m-d H:i:s") . "] ([PDO] BASE:" . $base_name . " ACTION:". $action . " QUERY:".$query.") IP:" . $_SERVER['REMOTE_ADDR'] . "\r\n";
            $logfile = fopen("_" . date("Y") . "-" . date("m") . ".log", "a");
            fwrite($logfile, $line);
            fclose($logfile);
        }
?>