var Pagination = {

    code: '',

    // --------------------
    // Utility
    // --------------------

    // converting initialize data
    Extend: function(data) {
        data = data || {};
        Pagination.size = data.size || 300;
        Pagination.page = data.page || 1;
        Pagination.step = data.step || 3;
    },

    // add pages by number (from [s] to [f])
    Add: function(s, f) {
        for (var i = s; i < f; i++) {
            Pagination.code += '<a>' + i + '</a>';
        }
    },

    // add last page with separator
    Last: function() {
        Pagination.code += '<i>...</i><a>' + Pagination.size + '</a>';
    },

    // add first page with separator
    First: function() {
        Pagination.code += '<a>1</a><i>...</i>';
    },



    // --------------------
    // Handlers
    // --------------------

    // change page
    Click: function() {
        Pagination.page = +this.innerHTML;

        createTableInfo();

        Pagination.Start();
    },

    // previous page
    Prev: function() {
        Pagination.page--;
        if (Pagination.page < 1) {
            Pagination.page = 1;
        }

        createTableInfo();
        Pagination.Start();
    },

    // next page
    Next: function() {
        Pagination.page++;
        if (Pagination.page > Pagination.size) {
            Pagination.page = Pagination.size;
        }

        createTableInfo();

        Pagination.Start();
    },



    // --------------------
    // Script
    // --------------------

    // binding pages
    Bind: function() {
        var a = Pagination.e.getElementsByTagName('a');
        for (var i = 0; i < a.length; i++) {
            if (+a[i].innerHTML === Pagination.page) a[i].className = 'current';
            a[i].addEventListener('click', Pagination.Click, false);
        }
    },

    // write pagination
    Finish: function() {
        Pagination.e.innerHTML = Pagination.code;
        Pagination.code = '';
        Pagination.Bind();
    },

    // find pagination type
    Start: function() {
        if (Pagination.size < Pagination.step * 2 + 6) {
            Pagination.Add(1, Pagination.size + 1);
        } else if (Pagination.page < Pagination.step * 2 + 1) {
            Pagination.Add(1, Pagination.step * 2 + 4);
            Pagination.Last();
        } else if (Pagination.page > Pagination.size - Pagination.step * 2) {
            Pagination.First();
            Pagination.Add(Pagination.size - Pagination.step * 2 - 2, Pagination.size + 1);
        } else {
            Pagination.First();
            Pagination.Add(Pagination.page - Pagination.step, Pagination.page + Pagination.step + 1);
            Pagination.Last();
        }
        Pagination.Finish();
    },



    // --------------------
    // Initialization
    // --------------------

    // binding buttons
    Buttons: function(e) {
        var nav = e.getElementsByTagName('a');
        nav[0].addEventListener('click', Pagination.Prev, false);
        nav[1].addEventListener('click', Pagination.Next, false);
    },

    // create skeleton
    Create: function(e) {

        var html = [
            '<a>&#9668;</a>', // previous button
            '<span></span>', // pagination container
            '<a>&#9658;</a>' // next button
        ];

        e.innerHTML = html.join('');
        Pagination.e = e.getElementsByTagName('span')[0];
        Pagination.Buttons(e);
    },

    // init
    Init: function(e, data) {
        Pagination.Extend(data);
        Pagination.Create(e);
        Pagination.Start();
    }
};

var paginationInit = function() {
    Pagination.Init(document.getElementById('pagination'), {
        /* size: 30, // pages size
         page: 1,  // selected page
         step: 3   // pages before and after current*/
    });
};

// change input to editable function
function editableContent() {
    $("#base_table > tbody > tr > td ").each(function() {
        if (!$(this).attr('data-id')) {
            if ($(this).attr('data-actions') != 'false') {
                if ($(this).children("input").prop('disabled')) {
                    $(this).children("input").prop('disabled', false);
                } else {
                    $(this).children("input").prop('disabled', true);
                    $(this).children("input").css("border", "2px solid darkgray");
                }
            }
        }
    });
}

// number types array for field_type from DB
var number_types = ["double",
    "tinyint",
    "smallint",
    "mediumint",
    "int",
    "bigint",
    "decimal",
    "float",
    "real",
    "numeric",
    "bit",
    "integer",
    "dec",
    "fixed",
    "double precision",
    "bool",
    "boolean"
];

// check response from DB
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// create table with info from DB
function createTableInfo() {
    var table = $("#editable_content").attr("data-table_name");
    var limit = Pagination.page - 1;

    $.ajax({
        type: 'POST',
        context: this,
        url: 'ajax.php',
        data: {
            'table_name': table,
            'limit': limit,
            'event': 'get_info',
            'action': 'search'
        },
        success: function(response) {
            if (IsJsonString(response)) {
                $("#empty_info").remove();

                column_counter = 0;
                response = JSON.parse(response);
                var table_name = response['table'];
                $("#count_rows").val(response['count_rows']);
                $('#editable_content').remove();
                if ($('#add_record'))
                    $('#add_record').remove();
                $('#base_table > thead').empty();
                $('#base_table > tbody').empty();
                $('#base').append("<button data-table_name='" + table_name + "' id='editable_content'>Edit</button>");
                $('#base').append("<button data-table_name='" + table_name + "' id='add_record'>Add</button>");
                $('#base_table > thead').append("<tr style='height:20px;font-size:15px;color: #4e4e4e;background:#eee;'>");
                for (var i = 0; i < response['thead'].length; i++) {
                    var column_name = response['thead'][i];
                    if (fields_arr.includes(column_name)) {
                        column_counter++;
                        $('#base_table > thead > tr').append("<th style='text-align:center'>" + column_name + "</th>");
                    }
                }
                $('#base_table > thead > tr').append("<th style='text-align:center'>Действия</th>");
                $('#base_table > thead > tr').append("</tr>");

                for (var i = 0; i < response['tbody'].length; i++) {
                    $('#base_table > tbody').append("<tr data-rowid='" + i + "' style='height: 42px;border-bottom: 1px solid #e8e8e8;'>");
                    for (var k = 0; k < response['tbody'][i].length; k++) {
                        var key = response['tbody'][i][k]['key'];
                        var value = response['tbody'][i][k]['value'];
                        var type = response['tbody'][i][k]['type'];
                        var primary = response['tbody'][i][k]['primary'];
                        if (fields_arr.includes(key)) {
                            if (primary) {
                                $('#base_table > tbody > tr[data-rowid="' + i + '"]').append("<td data-id='" + value + "' style='text-align:center'>" + value + "</td>");
                            } else {
                                 $('#base_table > tbody > tr[data-rowid="' + i + '"]').append("<td data-column-name='" + key + "' data-column-type='" + type + "' style='text-align:center'><input class='table_input' type='text'  value='" + value + "'/></td>");
                            }
                         }
                    }
                    $('#base_table > tbody > tr[data-rowid="' + i + '"]').append("<td data-actions='false' style='text-align:center'><button class='save_info'>Save</button><button class='delete_info'>Delete</button><button class='copy_info'>Copy</button></td>");
                    $('#base_table > tbody').append("</tr>");
                }
            } else {
                //debugger;
                $('#editable_content').remove();
                if ($('#add_record'))
                    $('#add_record').remove();

                $('#base').append("<button data-table_name='" + table + "' id='add_record'>Add</button>");
                $('#base_table > tbody').empty();
                $('#base_table > thead').empty();
                $('#base_table').append("<h3 id='empty_info' class='empty_info'>Table is empty!</h3>");
            }
            editableContent();
        },
        error: function(response) {
        }
    });
}


// popup error Window frunction
function errorView(error) {
    $("#error").css("display", "block");
    $("#error_message").text(error);
}

$(document).ready(function() {
    // validation inputs
    $('body').on('keyup', 'input', function(evt) {
        var a = evt.target.checkValidity();
        if (evt.target.checkValidity() == false) {
            evt.target.style.border = "2px solid darkred";
            evt.target.style.padding = "5px";
            $(".save_info,.delete_info").each(function() {
                $(this).prop('disabled', true);
            });
            $("#add_to_base").prop('disabled', true);
        } else {
            evt.target.style.border = "2px solid green";
            evt.target.style.padding = "5px";
            $(".save_info,.delete_info").each(function() {
                $(this).prop('disabled', false);
            });
            $("#add_to_base").prop('disabled', false);
        }
    });

    // add record to DB 
    $('body').on('click', "#add_to_base", function(event) {
        var table = $("#add_to_base").attr("data-table_name");
        var data = {};
        $("#record_table > tbody > tr").each(function() {
            var column = '';
            var type = '';
            $(this).find("td[data-column-name]").each(function() {
                column = $(this).attr("data-column-name");
                type = $(this).attr("data-column-type");
            });
            $(this).find("td > input").each(function() {
                data[column] = {
                    'type': type,
                    'value': $(this).val()
                };
            });
        });
        $.ajax({
            type: 'POST',
            url: 'ajax.php',
            data: {
                'table_name': table,
                'event':'get_info',
                'action': 'add_row',
                'data': data
            },
            success: function(response) {
                if (IsJsonString(response)) {
                    if (response) {
                        $("#added_record").css("display", "block");
                        $("#record").css("display", "none");
                        createTableInfo();
                    }
                } else {
                    errorView(response);
                }
            },
            error: function(response) {
                errorView(response);
            }
        });
    });

    // create window for New Row add
    function tableForNewData(data_value, table) {
        if (table) {
            $.ajax({
                type: 'POST',
                url: 'ajax.php',
                data: {
                    'table_name': table,
                    'event': 'get_info',
                    'action': 'get_columns'
                },
                success: function(response) {
                    if (IsJsonString(response)) {
                        response = JSON.parse(response);
                        $("#record_table > tbody").empty();

                        if (response) {
                            $("#add_to_base").remove();
                            var table_name = response['table'];
                            value = '';
                            for (var i = 0; i < response['column_names'].length; i++) {
                                var field_name = response['column_names'][i];
                                if (field_name != 'id')
                                    if (field_name in data_value) {
                                        value = data_value[field_name];
                                    } else {
                                        value = null;
                                    }
                                if (response['column_types'][i].indexOf("(") == -1) {
                                    var field_type = response['column_types'][i];
                                } else {
                                    var field_type = response['column_types'][i].substring(0, response['column_types'][i].indexOf("("));
                                }
                                  if (field_name != 'id') {
                                    if ((field_type == 'datetime') || (field_type == 'timestamp')) {
                                        $("#record_table > tbody").append("<tr><td class='table_cell' data-column-name='" + field_name + "' data-column-type='" + field_type + "' style='text-align: center;'>" + field_name + "</td><td style='text-align: center;'>" + field_type + "</td><td style='text-align:center'>Format: YYYY-MM-DD HH:MM:SS</td><td style='text-align: center;'><input class='table_input' type='text' required='required' pattern='(\\d{4})-(\\d{2})-(\\d{2}) (\\d{2}):(\\d{2}):(\\d{2})' style='width:inherit' value=" + value + " /></td></tr>");
                                    } else {
                                        if (number_types.includes(field_type)) {
                                            $("#record_table > tbody").append("<tr><td class='table_cell' data-column-name='" + field_name + "' data-column-type='" + field_type + "' style='text-align: center;'>" + field_name + "</td><td style='text-align: center;'>" + field_type + "</td><td style='text-align:center'>Format: only number!</td><td style='text-align: center;'><input class='table_input' type='number' required='required' name='fields_check' style='width:inherit' value=" + value + "  /></td></tr>");
                                        } else {
                                            if (field_type == 'time') {
                                                $("#record_table > tbody").append("<tr><td class='table_cell' data-column-name='" + field_name + "' data-column-type='" + field_type + "' style='text-align: center;'>" + field_name + "</td><td style='text-align: center;'>" + field_type + "</td><td style='text-align:center'>Format: HH:MM:SS</td><td style='text-align: center;'><input class='table_input' type='text' required='required' pattern='(\\d{2}):(\\d{2}):(\\d{2})' style='width:inherit' value=" + value + "  /></td></tr>");
                                            } else {
                                                if (field_type == 'year') {
                                                    $("#record_table > tbody").append("<tr><td class='table_cell' data-column-name='" + field_name + "' data-column-type='" + field_type + "' style='text-align: center;'>" + field_name + "</td><td style='text-align: center;'>" + field_type + "</td><td style='text-align:center'>Format: YYYY</td><td style='text-align: center;'><input class='table_input' type='text' required='required' pattern='(\\d{4})' style='width:inherit' value=" + value + "  /></td></tr>");
                                                } else {
                                                    if (field_type == 'date') {
                                                        $("#record_table > tbody").append("<tr><td class='table_cell' data-column-name='" + field_name + "' data-column-type='" + field_type + "' style='text-align: center;'>" + field_name + "</td><td style='text-align: center;'>" + field_type + "</td><td style='text-align:center'>Format: YYYY-MM-DD</td><td style='text-align: center;'><input class='table_input' required='required' type='text' pattern='(\\d{4})-(\\d{2})-(\\d{2})' style='width:inherit' value=" + value + " /></td></tr>");
                                                    } else {
                                                        $("#record_table > tbody").append("<tr><td class='table_cell' data-column-name='" + field_name + "' data-column-type='" + field_type + "' style='text-align: center;'>" + field_name + "</td><td style='text-align: center;'>" + field_type + "</td><td style='text-align:center'>Format: Text!</td><td style='text-align: center;'><input class='table_input' required='required' type='text' name='fields_check' style='width:inherit' value=" + value + " /></td></tr>");
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            $("#record > div").append("<button id='add_to_base' data-table_name='" + table_name + "' style='background: #606061;color: #FFFFFF;line-height: 25px;'>Add</button>");
                            $("#record").css("display", "block");
                        } else {
                            errorView(response);
                        }
                    } else {
                        errorView(response);
                    }
                },
                error: function(response) {
                    errorView(response);
                }
            });
        } else {
            console.log("!!!!!");
        }
    }

    // last_info 
    function lastInfo(table_name) {
        return $.ajax({
            type: 'POST',
            url: 'ajax.php',
            context: this,
            data: {
                'table_name': table_name,
                'event':'get_info',
                'action': 'get_last_row'
            },
            success: function(data_response) {
                if (IsJsonString(data_response)) {
                    console.log(data_response);
                    data_response = JSON.parse(data_response);
                    data_value = data_response['data'][0];
                    tableForNewData(data_value, table_name);
                } else {
                    tableForNewData({}, table_name);
                }
            },
            error: function(data_response) {
                console.log(data_response);
            }
        });
    }

    // popup window for add record in DB table
    $('body').on('click', "#add_record", function(event) {
        var table = $("#add_record").attr("data-table_name");
        lastInfo(table);

    });

    // delete popup window for record in DB table
    $('body').on('click', "button.delete_info", function(event) {
        var table = $("#editable_content").attr("data-table_name");
        var id = $(this).parents('tr').find('td[data-id]').text();
        $("#delete").css("display", "block");
        $("#delete_id").val(id);
    });

    // delete record in DB table
    $('body').on('click', "#delete_record", function(event) {
        var table = $("#editable_content").attr("data-table_name");
        $("#empty_info").remove();
        var id = $("#delete_id").val();
        $.ajax({
            type: 'POST',
            context: this,
            url: 'ajax.php',
            data: {
                'table_name': table,
                'limit': 0,
                'event':'get_info',
                'action': 'delete_row',
                'id': id
            },
            success: function(response) {
                if (response) {
                    $("#deleted_record").css("display", "block");
                    $("#delete").css("display", "none");
                    createTableInfo();
                } else {
                    errorView(response);
                }
            },
            error: function(response) {
                errorView(response);
            }
        });
    });

    // copy record in DB 
     $('body').on('click', "button.copy_info", function(event) {
        var table = $("#editable_content").attr("data-table_name");
        var id = $(this).parents('tr').find('td[data-id]').text(); 
        $.ajax({
            type: 'POST',
            context: this,
            url: 'ajax.php',
            data: {
                'table_name': table,
                'limit': 0,
                'event':'get_info',
                'action': 'get_info_for_copy',
                'id': id
            },
            success: function(response) {
                if (response) {
                    $("#copied_record").css("display", "block");
                     createTableInfo();
                } else {
                    errorView(response);
                }
            },
            error: function(response) {
                errorView(response);
            }
        });
     });

    // update record in DB table
    $('body').on('click', "button.save_info", function(event) {
        var table = $("#editable_content").attr("data-table_name");
        var id = $(this).parents('tr').find('td[data-id]').text();
        var data_sent = {
            'id': id
        };
        $(this).parents('tr').find('td[data-column-name]').each(function() {
            var key = $(this).attr('data-column-name');
            var type = $(this).attr('data-column-type');
            var val = $(this).children('input').val();
            var data_value = {
                'type': type,
                'value': val
            };
            data_sent[key] = data_value;
        });
        $.ajax({
            type: 'POST',
            context: this,
            url: 'ajax.php',
            data: {
                'table_name': table,
                'limit': 0,
                'event':'get_info',
                'action': 'update_row',
                'data': data_sent
            },
            success: function(response) {
                if (response) {
                    $("#updated_record").css("display", "block");
                } else {
                    errorView(response);
                }
            },
            error: function(response) {
                errorView(response);
            }
        });
    });

    // change edit props for inputs event
    $('body').on('click', "#editable_content", function(event) {
        editableContent();
    });

    // check/uncheck all columns from table event
    $('body').on('click', "#check_fields", function(event) {
        $("#fields_table > tbody > tr > td >input").each(function() {
            if (!$(this).prop('disabled')) {
                if ($(this).prop('checked')) {
                    $(this).prop('checked', false);
                } else {
                    $(this).prop('checked', true);
                }
            }
        });
    });

    // change columns from table event
    $('body').on('click', "#select_fields", function(event) {
        var table = $("#editable_content").attr("data-table_name");
        selectFields(table);
    });

    // create information table  event
    $('body').on('click', "#check_table_columns", function(event) {
        var checkedData = {};
        $("#fields").css("display", "none");
        $("#empty_info").remove();
        var table = $("#check_table_columns").attr("data-table_name");
        checkedData[table] = {};
        fields_arr = [];
        $("[name=fields_check]").each(function() {
            if ($(this).prop('checked')) {
                checkedData[table][$(this).val()] = true;
                fields_arr.push($(this).val());
            } else {
                checkedData[table][$(this).val()] = false;
            }
        });
        //debugger;
        checkedData = JSON.stringify(checkedData);
        localStorage.setItem(table, checkedData);
        $.ajax({
            type: 'POST',
            context: this,
            url: 'ajax.php',
            data: {
                'table_name': table,
                'limit': 0,
                'event': 'get_info',
                'action': 'search'
            },
            success: function(response) {
                if (IsJsonString(response)) {

                    column_counter = 0;
                    response = JSON.parse(response);
                    $("#count_rows").val(response['count_rows']);
                    var table_name = response['table'];
                    $('#editable_content').remove();
                    $('#select_fields').remove();
                    if ($('#add_record'))
                        $('#add_record').remove();
                    $("#empty_info").remove();
                    $('#base_table > thead').empty();
                    $('#base_table > tbody').empty();
                    $('#base').append("<button data-table_name='" + table_name + "' id='editable_content'>Edit</button>");
                    $('#base').append("<button data-table_name='" + table_name + "' id='add_record'>Add</button>");
                    $('#base').append("<button data-table_name='" + table_name + "' id='select_fields'>Select fields</button>");
                    $('#base_table > thead').append("<tr style='height:20px;font-size:15px;color: #4e4e4e;background:#eee;'>");
                    for (var i = 0; i < response['thead'].length; i++) {
                        var column_name = response['thead'][i];
                        if (fields_arr.includes(column_name)) {
                            column_counter++;
                            $('#base_table > thead > tr').append("<th style='text-align:center'>" + column_name + "</th>");
                        }
                    }

                    $('#base_table > thead > tr').append("<th style='text-align:center'>Actions</th>");
                    $('#base_table > thead > tr').append("</tr>");

                    var count_rows = $("#count_rows").val();
                    if (count_rows > response['tbody'].length) {
                        var info_length = response['tbody'].length;
                        var count_pages = count_rows / info_length;
                        Pagination.size = Math.round(count_pages);
                        Pagination.step = 1;
                        Pagination.page = 1;
                        Pagination.Init(document.getElementById('pagination'), {
                            step: Pagination.step,
                            size: Pagination.size,
                            page: Pagination.page
                        });
                    }
                    for (var i = 0; i < response['tbody'].length; i++) {
                        $('#base_table > tbody').append("<tr data-rowid='" + i + "' style='height: 42px;border-bottom: 1px solid #e8e8e8;'>");
                        for (var k = 0; k < response['tbody'][i].length; k++) {
                            var field_name = response['tbody'][i][k]['key'];
                            var value = response['tbody'][i][k]['value'];
                            var field_type = response['tbody'][i][k]['type'];

                            var primary = response['tbody'][i][k]['primary'];
                            if (fields_arr.includes(field_name)) { 
                                if (primary) {
                                    $('#base_table > tbody > tr[data-rowid="' + i + '"]').append("<td data-id='" + value + "' style='text-align:center'>" + value + "</td>");
                                } else 
                                if ((field_type == 'datetime') || (field_type == 'timestamp')) {
                                    $('#base_table > tbody > tr[data-rowid="' + i + '"]').append("<td class='table_cell' data-column-name='" + field_name + "' data-column-type='" + field_type + "' ><input class='table_input' type='text' pattern='(\\d{4})-(\\d{2})-(\\d{2}) (\\d{2}):(\\d{2}):(\\d{2})'  disabled value='" + value + "'/></td>");
                                } else {
                                    if (number_types.includes(field_type)) {
                                        $('#base_table > tbody > tr[data-rowid="' + i + '"]').append("<td class='table_cell' data-column-name='" + field_name + "' data-column-type='" + field_type + "' ><input class='table_input' type='number' name='fields_check' disabled value='" + value + "'/></td>");
                                    } else {
                                        if (field_type == 'time') {
                                            $('#base_table > tbody > tr[data-rowid="' + i + '"]').append("<td class='table_cell' data-column-name='" + field_name + "' data-column-type='" + field_type + "' ><input class='table_input' type='text' pattern='(\\d{2}):(\\d{2}):(\\d{2})' disabled value='" + value + "'/></td>");
                                        } else {
                                            if (field_type == 'year') {
                                                $('#base_table > tbody > tr[data-rowid="' + i + '"]').append("<td class='table_cell' data-column-name='" + field_name + "' data-column-type='" + field_type + "' ><input class='table_input' type='text' pattern='(\\d{4})' disabled value='" + value + "'/></td>");
                                            } else {
                                                if (field_type == 'date') {
                                                    $('#base_table > tbody > tr[data-rowid="' + i + '"]').append("<td class='table_cell' data-column-name='" + field_name + "' data-column-type='" + field_type + "' ><input class='table_input' type='text' pattern='(\\d{4})-(\\d{2})-(\\d{2})' disabled value='" + value + "'/></td>");
                                                } else {
                                                    $('#base_table > tbody > tr[data-rowid="' + i + '"]').append("<td class='table_cell' data-column-name='" + field_name + "' data-column-type='" + field_type + "' ><input class='table_input' type='text' name='fields_check' disabled value='" + value + "'/></td>");
                                                }
                                            }
                                        }
                                    }
                                }
                            } 
                        }
                        $('#base_table > tbody > tr[data-rowid="' + i + '"]').append("<td data-actions='false' style='text-align:center'><button class='save_info'>Save</button><button class='delete_info'>Delete</button><button class='copy_info'>Copy row</button></td>");
                        $('#base_table > tbody').append("</tr>");
                    }

                } else if (response == '') {
                    //debugger;
                    $('#editable_content').remove();
                    $('#select_fields').remove();
                    if ($('#add_record'))
                        $('#add_record').remove();
                    $("#empty_info").remove();
                    $('#base').append("<button data-table_name='" + table + "' id='add_record'>Add</button>");
                    $('#base_table > tbody').empty();
                    $('#base_table > thead').empty();
                    $('#pagination').append("<h3 id='empty_info' class='empty_info'>Table is empty!</h3>");
                } else {
                    errorView(response);
                }
            },
            error: function(response) {
                errorView(response);
            }
        });
    });

    /* Closing windows */
    $("#closeModalFields").click(function() {
        $("#fields").css("display", "none");
    });

    $("#closeModalRecord").click(function() {
        $("#record").css("display", "none");
    });

    $("#closeModalDelete").click(function() {
        $("#delete").css("display", "none");
    });

    $("#closeModalDeletedRecord").click(function() {
        $("#deleted_record").css("display", "none");
    });

    $("#closeModalAddedRecord").click(function() {
        $("#added_record").css("display", "none");
    });

    $("#closeModalUpdatedRecord").click(function() {
        $("#updated_record").css("display", "none");
    });

    $("#closeModalCopyRecord").click(function() {
        $("#copied_record").css("display", "none");
    });

    $("#closeModalError").click(function() {
        $("#error").css("display", "none");
    });
    /* end events closinq windows */

// change base event
    $('#bases').change(function() {
        var base_name = this.value;
        $("#tables_select").empty();
        $("#tables_select").remove();
        $('#editable_content').remove();
        if ($('#add_record'))
            $('#add_record').remove();
        if ($('#select_fiels'))
            $('#select_fiels').remove();
        $("#empty_info").remove();
        $('#base_table > thead').empty();
        $('#base_table > tbody').empty();
        $.ajax({
            type: 'POST',
            url: 'ajax.php',
            data: {
                'base_name': base_name,
                'event': 'get_base'
            },
            success: function(response) {
                $.ajax({
                    type: 'POST',
                    url: 'ajax.php',
                    data: {
                        'base_name': base_name,
                        'event': 'get_tables'
                    },
                    success: function(response) {
                        if (IsJsonString(response)) {
                            response = JSON.parse(response);
                            createSelectTables(response);
                        } else {
                            errorView(response);
                        }
                    },
                    error: function(response) {
                        errorView(response);
                    }
                });
            },
            error: function(response) {
                errorView(response);
            }
        });
    });

// change table event
    $('body').on('change', "#tables", function(event) {
        var table = this.value;
        selectFields(table);
    });

});
// select fields event
function selectFields(table) {
    $("#check_fields").remove();
    $.ajax({
        type: 'POST',
        url: 'ajax.php',
        data: {
            'table_name': table,
            'event': 'get_info',
            'action': 'get_columns'
        },
        success: function(response) {
            if (IsJsonString(response)) {
                response = JSON.parse(response);
                $("#fields_table > tbody").empty();
                if (response) {
                    var checked = "";
                    var table_name = response['table'];
                    var checkedData = localStorage.getItem(table_name);
                    if (checkedData) {
                        checkedData = JSON.parse(checkedData);
                        checkedData = checkedData[table_name];
                    }
                    for (var i = 0; i < response['column_names'].length; i++) {
                        var field_name = response['column_names'][i];
                        var primary = response['column_primaries'][i];
                        if (primary) {
                            $("#fields_table > tbody").append("<tr><td style='width:250px;text-align: center;'>" + field_name + "</td><td style='width:250px;text-align: center;'><input type='checkbox' checked disabled name='fields_check' value='" + field_name + "'/></td></tr>");
                        } else {
                            if (checkedData)
                                if (checkedData[field_name]) {
                                    checked = "checked";
                                } else {
                                    checked = "";
                                }
                            $("#fields_table > tbody").append("<tr><td style='width:250px;text-align: center;'>" + field_name + "</td><td style='width:250px;text-align: center;'><input type='checkbox' " + checked + " name='fields_check' value='" + field_name + "'/></td></tr>");
                        }
                    }
                    $("#check_table_columns").remove();
                    $("#fields > div").append("<button id='check_table_columns' data-table_name='" + table_name + "' style='background: #606061;color: #FFFFFF;line-height: 25px;'>Select</button>");
                    $("#fields").css("display", "block");
                    $("#fields > div > h3").append("<button id='check_fields' class='btn'>Select All/Deselect All</button>");
                } else {
                    errorView(response);
                }
            }
        },
        error: function(response) {
            errorView(response);
        }
    });
}

// create select with tables
function createSelectTables(response) {
    var tables = response['tables'];
    $("#base").append("<div id='tables_select'><span class='select_label'>Select table</span>");
    $("#tables_select").append("<select class='main_select' id='tables'><option value='0'></option>");
    for (var i = 0; i < tables.length; i++) {
        var table_name = tables[i]['table_name'];
        $("#tables").append("<option value='" + table_name + "'>" + table_name + "</option>");
    }
    $("#tables_select").append("</select></div>");
}

// clear localStorage 
window.onbeforeunload = function(e) {
    localStorage.clear();
}