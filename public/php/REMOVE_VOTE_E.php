<?php

include 'vote.php';

if(removeVote((int)$_POST['EVENT_ID'], $_POST['USER'], "event")){
    echo 'Success';
} else {
    echo 'Failed';
}
