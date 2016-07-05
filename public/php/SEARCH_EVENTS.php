<?php

include 'search.php';

$result = searchEvents($_POST['SEARCH_TEXT'], $_POST['EMAIL_FRAG'], (int)$_POST['GET_START'], (int)$_POST['GET_MAX'], $_POST['USER']);
if (is_string($result)) {
    echo $result;
} else {
    echo "Failed. SQL related Error.";
}
