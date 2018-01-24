<?php 
require_once ("config.php") ;
/* class for errors, notices etc. */
class NoticeError extends ErrorException
{
}
class WarningError extends ErrorException
{
}
class StrictError extends ErrorException
{
}
class DeprecatedError extends ErrorException
{
}
$error_handler = function($code, $mess, $file, $line)
{
    $err = array(
        E_WARNING => 'WarningError',
        E_NOTICE => 'NoticeError',
        E_STRICT => 'StrictError',
        E_DEPRECATED => 'DeprecatedError'
    );
    throw new $err[$code]($mess, 0, 1, $file, $line);
};
set_error_handler($error_handler, E_NOTICE | E_WARNING | E_DEPRECATED | E_STRICT);
/* -- class for errors, notices etc. -- */

$conf_file = constants::CONFIG;
$conf_bases = constants::BASES;

if (file_exists($conf_bases)) {
    require_once "pdo.php";
    $db = new DB;
}
$out = "";
try {
    $str = file_get_contents($conf_bases);
}
catch (WarningError $e) {
    $out = "Warning: File {$conf_bases} not found!";
    die($out);
}
$bases_json = json_decode($str, true);
if (empty($bases_json)) {
    $out = "Error: File {$conf_bases} not as JSON!";
    die($out);
} else {
    header("Content-Type: text/html; charset=utf-8");
    $out .= "
    <head>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    </head>
            <link rel='stylesheet' type='text/css' href='css/style.css'>
            <script src='js/jquery-2.1.1.js'></script>
            <script src='js/main.js'></script>
        <div id='error' class='modalFields' >
            <div>
                <h3 id='error_message' style='text-align:center;'>
                
                </h3>
                <a id='closeModalError' class='closeModalFields'>X</a>
            </div>
        </div>
        <div id='added_record' class='modalFields' >
            <div >
                <h3 style='text-align:center;'>
                Row added!
                </h3>
                <a id='closeModalAddedRecord' class='closeModalFields'>X</a>
            </div>
        </div>
        <div id='deleted_record' class='modalFields' >
            <div >
                <h3 style='text-align:center;'>
                Row deleted!
                </h3>
                <a id='closeModalDeletedRecord' class='closeModalFields'>X</a>
            </div>
        </div>
        <div id='updated_record' class='modalFields' >
            <div >
                <h3 style='text-align:center;'>
                Row changed!
                </h3>
                <a id='closeModalUpdatedRecord' class='closeModalFields'>X</a>
            </div>
        </div>
        <div id='copied_record' class='modalFields' >
            <div >
                <h3 style='text-align:center;'>
                Row copied!
                </h3>
                <a id='closeModalCopyRecord' class='closeModalFields'>X</a>
            </div>
        </div>
        <div id='fields' class='modalFields' >
            <div >
                <h3 style='text-align:center;'>
                Select fields to display
                </h3>
                <a id='closeModalFields' class='closeModalFields'>X</a>
                <input type='hidden' id='count_rows' />
                <table id='fields_table'>
                    <thead>
                        <tr>
                            <th style='text-align: center;'>Name</th>
                            
                            <th style='text-align: center;'>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>
        <div id='record' class='modalFields' >
            <div style='width:80%'>
                <h3 style='text-align:center;'>
                Add row
                </h3>
                <a id='closeModalRecord' class='closeModalFields'>X</a>
                <table id='record_table' style='width:100%'>
                    <thead>
                        <tr>
                            <th style='text-align: center;'>Name</th>
                            <th style='text-align: center;'>Data type</th>
                            <th style='text-align: center;'>Format</th>
                            <th style='text-align: center;'>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>
        <div id='delete' class='modalFields' >
            <div style='width:80%'>
                <h3 style='text-align:center;'>
                    Are you sure to delete row?
                </h3>
                <a id='closeModalDelete' class='closeModalFields'>X</a>
                <input id='delete_id' type='hidden' value='' />
                <button style='display:block;margin:0 auto;'id='delete_record'>Approve</button>
            </div>
        </div>";
    if (isset($bases_json) && is_array($bases_json)) {
        $out .= "<div class='main_container' id='base'>";
        $out .= "
            <span class='select_label'>Select base</span>
            <select class='main_select' id='bases'>
                <option value='0'></option>";
        foreach ($bases_json as $base_name => $base_arr) {
            $out .= "<option value='{$base_name}'>{$base_name}</option>";
        }
        $out .= "/<select>";
        $out .= "
        </div>
        <div id='pagination'></div>
            <table class='info_table' id='base_table'>
                <thead>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>";
        print($out);
    }
}
?>