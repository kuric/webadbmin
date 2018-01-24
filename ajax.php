<?php 
header("Content-Type: text/html; charset=utf-8");
require_once "config.php";
require_once "functions.php";
//$request = checkData($_REQUEST);
$request = $_REQUEST;
switch ($request['event']) {
    case "get_base": {
            if (isset($_REQUEST['base_name'])) {
            $base = $_REQUEST['base_name'];
        }

        try {
            $str = file_get_contents(constants::BASES);
        }
        catch (WarningError $e) {
            echo 'Warning: File with databases config not found!';
        }
        $conf_file = constants::CONFIG;
        $bases_json = json_decode($str, true);
        if (isset($bases_json) && is_array($bases_json)) {
            foreach ($bases_json as $base_name => $base_arr) {
                if ($base == $base_name) {
                    if(file_exists($conf_file)) {
                        if (!unlink($conf_file)) {
                          die ("Error deleting $conf_file");
                        } 
                    }
                    file_put_contents($conf_file, "<?php\n", FILE_APPEND | LOCK_EX);
                    foreach ($base_arr as $key => $value) {
                        $data = "define ('{$key}', '$value');\n";
                        file_put_contents($conf_file, $data, FILE_APPEND | LOCK_EX);
                    }
                    file_put_contents($conf_file, "?>\n", FILE_APPEND | LOCK_EX);
                }
            }
        } else {
            echo 'Error: File with databases config not as JSON!';
            die("");
        }
        if (isset($base_name)) {
            print $base_name;
        } else {
            echo ("No bases found!");
            die("");
        }
    }
    break;
    case "get_tables": {
        if (file_exists('pdo.php')) {
            require_once "pdo.php";
        } else {
            die("File pdo.php not found!");
        }
        try {
            $db = new DB;
        }
        catch (Exception $e) {
            echo ("Unable to load class: DB" . $e - getLine());
            die("");
        }
        $tables = $db->base->qconv("SELECT table_name FROM information_schema.tables where table_schema='" . DBNAME . "'");
        echo json_encode(array(
            "tables" => $tables
        ));
    }
    break;
    case "get_info": {
		require_once "pdo.php";
		$number_types        = " double,
		tinyint,
		smallint,
		mediumint,
		int,
		bigint,
		decimal,
		float,
		real,
		numeric,
		bit,
		integer,
		dec,
		fixed,
		double precision,
		bool,
		boolean";
		$db                  = new DB;
		$users_on_page_count = 50;
		unset($request);
		//$request = checkData($_REQUEST);
		$request = $_REQUEST;
		if (isset($request['table_name']) && is_string($request['table_name'])) {

			if (isset($request['action'])) {
				switch ($request['action']) {
					case "get_columns": {
						
						$table_name = $request['table_name'];
						$table_keys = $db->base->qconv("SHOW Keys FROM `$table_name` WHERE Key_name = 'PRIMARY'");
						$primary_key = $table_keys[0]['Column_name'];
						$columns    = $db->base->qconv("DESCRIBE {$table_name}");
						if (isset($columns) && is_array($columns)) {
							foreach ($columns as $column) {
								$column_name[] = $column['Field'];
								$column_type[] = $column['Type'];
								if($column['Field'] == $primary_key) {
									$column_primary[] = true;
								} else {
									$column_primary[] = false;
								}
									
							}

							$data = array(
								"table" => $table_name,
								"column_names" => $column_name,
								"column_types" => $column_type,
								"column_primaries" => $column_primary
							);
							// response table_name and columns_name
							echo json_encode($data);
						} else {
							echo false;
						}
					}
					break;
					case "search": {
							$table_name = $_REQUEST['table_name'];
						if ($_REQUEST['limit'] == "" || !isset($_REQUEST['limit'])) {
							$_REQUEST['limit'] = 0;
						}
						// limit for pagination
						$limit_start = $_REQUEST['limit'];
						$limit_start = $limit_start * $users_on_page_count;
						$limit_page  = "limit " . $limit_start . "," . $users_on_page_count;
						$columns     = $db->base->qconv("DESCRIBE {$table_name}");
						if (isset($columns) && is_array($columns)) {
							foreach ($columns as $column) {
								$column_name[] = $column['Field'];
								$column_type[] = $column['Type'];
							}
						}
						// information from table
						$table_keys = $db->base->qconv("SHOW Keys FROM `$table_name` WHERE Key_name = 'PRIMARY'");
						$primary_key = $table_keys[0]['Column_name'];
						$info       = $db->base->qconv("select * from `$table_name` ORDER BY  $primary_key DESC " . $limit_page );
						$count_info = $db->base->qconv("select count(*) as count_rows from {$table_name}");
						$count_rows = $count_info[0]['count_rows'];
						// array JSON {key,value,data_type}
						if (isset($columns) && is_array($columns) && isset($info) && is_array($info)) {
							foreach ($info as $info_row) {
								unset($data_info);
								foreach ($info_row as $info_key => $info_val) {
									foreach ($columns as $column) {
										if ($column['Field'] == $info_key) {
											$type_key = $column['Type'];
										}
									}
									if($info_key == $primary_key) {
										$primary = true;
									} else {
										$primary = false;
									}
									$data_info[] = array(
										"key" => $info_key,
										"value" => $info_val,
										"type" => $type_key,
										"primary" => $primary
									);
								}
								$info_arr[] = $data_info;
							}
							$data = array(
								"table" => $table_name,
								"thead" => $column_name,
								"tbody" => $info_arr,
								"count_rows" => $count_rows
							);
							// response search data
							echo json_encode($data);
						} else {
							echo false;
						}
					}
					break;
					case "get_info_for_copy": {
						$table_name = $_REQUEST['table_name'];
						$table_keys = $db->base->qconv("SHOW Keys FROM `$table_name` WHERE Key_name = 'PRIMARY'");
						$primary_key = $table_keys[0]['Column_name'];
						$id = $_REQUEST['id'];

						$res   = $db->base->q("CREATE TEMPORARY TABLE tmp SELECT * from `$table_name` WHERE $primary_key=$id; ALTER TABLE tmp drop $primary_key ;INSERT INTO `$table_name` SELECT 0,tmp.* FROM tmp;DROP TEMPORARY TABLE tmp;");
						if($res == 1) {
							logging($base, "COPY INFO FROM `$table_name` WHERE id={$id}", "CREATE TEMPORARY TABLE tmp SELECT * from `$table_name` WHERE $primary_key=$id; ALTER TABLE tmp drop $primary_key ;INSERT INTO `$table_name` SELECT 0,tmp.* FROM tmp;DROP TEMPORARY TABLE tmp;");
							echo true;
							// response to copy row data 
						} else {
                            logging($base, "COPY INFO FROM `$table_name` WHERE id={$id}", "CREATE TEMPORARY TABLE tmp SELECT * from `$table_name` WHERE $primary_key=$id; ALTER TABLE tmp drop $primary_key ;INSERT INTO `$table_name` SELECT 0,tmp.* FROM tmp;DROP TEMPORARY TABLE tmp; - ERROR");
							echo false;
						}
					}
					break;
					case "update_row": {
						$table_name = $_REQUEST['table_name'];
						if (isset($_REQUEST['data']) && is_array($_REQUEST['data'])) {
							$table_keys = $db->base->qconv("SHOW Keys FROM `$table_name` WHERE Key_name = 'PRIMARY'");
							$primary_key = $table_keys[0]['Column_name'];
							$data  = $_REQUEST['data'];
							$query = '';
							foreach ($data as $data_key => $data_value) {
								if ($data_key != $primary_key) {
									if (is_array($data_value)) {
										foreach ($data_value as $column => $val) {
											if ($column == 'type') {
												if (strpos($val, "(") !== false) {
													$val = substr($val, 0, strpos($val, "("));
												}
												$type = $val;
											} else {
												$value = $val;
											}
										}
									}
									if ($value) {
										if (strpos($number_types, $type) !== false) {
											if ($value) {
												$query .= "$data_key=$value,";
											} else {
												$query .= "$data_key=0,";
											}
										} else {
											$query .= "$data_key='$value',";
										}
									}
								} else {
									$id = $data_value;
								}
							}
							$query = trim($query, " ");
							$query = trim($query, ",");
							$res   = $db->base->q("UPDATE `$table_name` SET $query WHERE $primary_key=$id");
							 if($res == 1) {
								logging($base, "UPDATE `$table_name`", "SET $query WHERE $primary_key=$id");
								// response update info
								echo true;
							} else {
                                logging($base, "UPDATE `$table_name`", "SET $query WHERE $primary_key=$id - ERROR");
								echo false;
							}
						} else {
                            echo false;
						}
					}
					break;
					case "delete_row": {
						$table_name = $_REQUEST['table_name'];
						if (isset($_REQUEST['id'])) {
							$table_keys = $db->base->qconv("SHOW Keys FROM `$table_name` WHERE Key_name = 'PRIMARY'");
							$primary_key = $table_keys[0]['Column_name'];
							$id  = $_REQUEST['id'];
							$res = $db->base->q("DELETE FROM `$table_name` WHERE $primary_key={$id}");
                            logging($base, "DELETE" ,"DELETE FROM `$table_name` WHERE $primary_key={$id}");
							echo true;
							// response to delete record
						}
					}
					break;
					case "get_last_row": {
						$table_name = $_REQUEST['table_name'];
						$table_keys = $db->base->qconv("SHOW Keys FROM `$table_name` WHERE Key_name = 'PRIMARY'");
						$primary_key = $table_keys[0]['Column_name'];
						$res = $db->base->qconv("SELECT * from `$table_name` ORDER BY $primary_key DESC LIMIT 1");
						if(isset($res) && is_array($res)) {
							 $data = array(
								"table" => $table_name,
								"data" => $res
							);
							// response to select last row in base
							echo json_encode($data);
						} else  {
							echo false;
						}
					}
					break;
					case "add_row": {
						$table_name = $_REQUEST['table_name'];
						$table_keys = $db->base->qconv("SHOW Keys FROM `$table_name` WHERE Key_name = 'PRIMARY'");
						$primary_key = $table_keys[0]['Column_name'];
						if (isset($_REQUEST['data']) && is_array($_REQUEST['data'])) {
							$data  = $_REQUEST['data'];
							$query = '';
							foreach ($data as $data_key => $data_value) {
								if($data_key != $primary_key) {
									if (is_array($data_value)) {
										foreach ($data_value as $column => $val) {
											if ($column == 'type') {
												if (strpos($val, "(") !== false) {
													$val = substr($val, 0, strpos($val, "("));
												}
												$type = $val;
											} else {
												$value = $val;
											}
										}
									}
									if (isset($value)) {
										if (strpos($number_types, $type) !== false) {
											if ($value) {
												$query .= "$data_key=$value,";
											} else {
												$query .= "$data_key=0,";
											}
										} else {
											if(strtoupper($value) == 'NULL' || $value == '') {
													$query .= "$data_key=NULL,";
											} else {
												$query .= "$data_key='$value',";
											}
										}
									}
								}
							}
							$query = trim($query);
							$query = trim($query, ",");
							//var_dump("INSERT INTO `$table_name` SET $query");
							$res   = $db->base->q("INSERT INTO `$table_name` SET $query");
                            logging($base, "INSERT" ,"INSERT INTO `$table_name` SET $query");
							echo true;
							// response add row to base
						} else {
                             logging($base, "INSERT" ,"INSERT INTO `$table_name` SET $query - ERROR");
							echo false;
						}
					}
					break;
					default: echo false;
					break;
				}
			} else {
				echo false;
			} 
		} else {
			echo false;
		}
	}
    break;
    default: break;
}
 
?>