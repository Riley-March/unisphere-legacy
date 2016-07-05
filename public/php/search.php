<?php

include 'db_interface.php';

function searchEvents($srchStr, $frag, $start, $max, $userEmail) {
    if (!empty($frag)) {
        if (empty($start)) $start = 0;
        if (empty($max)) $max = 0;
        $currTime = round((microtime(true) * 1000) - 3600000);
        if (empty($srchStr)) {
            $stmt = DBIface::connect()->prepare("SELECT * FROM UNI_EVENTS WHERE EVENT_EMAIL_FRAG=:frag ".
                "AND EVENT_TIME > ".$currTime." ORDER BY EVENT_TIME ASC limit :offset,:limit");
        } else {
            $stmt = DBIface::connect()->prepare("SELECT * FROM UNI_EVENTS WHERE (USER_NAME LIKE :srchStrUser OR ".
                "EVENT_NAME LIKE :srchStrEvent OR EVENT_DESCR LIKE :srchStrDesc) AND EVENT_EMAIL_FRAG=:frag AND EVENT_TIME > ".$currTime." LIMIT :offset,:limit");
            $stmt->bindValue(":srchStrUser", "%".$srchStr."%", PDO::PARAM_STR);
            $stmt->bindValue(":srchStrEvent", "%".$srchStr."%", PDO::PARAM_STR);
            $stmt->bindValue(":srchStrDesc", "%".$srchStr."%", PDO::PARAM_STR);
        }
        $stmt->bindValue(":frag", $frag, PDO::PARAM_STR);
        $stmt->bindValue(":offset", $start, PDO::PARAM_INT);
        $stmt->bindValue(":limit", $max, PDO::PARAM_INT);
        if ($stmt->execute()) {
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $userID = 0;
            $stmt = DBIface::connect()->prepare("SELECT * FROM UNI_USERS WHERE USER_ID=:userID LIMIT 1");
            $stmt->bindParam(":userID", $userID, PDO::PARAM_INT);
            
			$eventID = 0;
			$stmtPostComs = DBIface::connect()->prepare("SELECT COUNT(1) FROM UNI_POST_COM WHERE POST_ID=:eventID AND COM_TYPE='Event'");
            $stmtPostComs->bindParam(":eventID", $eventID, PDO::PARAM_INT);
			
			// EVENT GOERS
			$stmtUserVotes = DBIface::connect()->prepare("SELECT * FROM UNI_VOTES_E WHERE USER_EMAIL=:userEmail ".
                "AND EVENT_ID=:eventID LIMIT 1");
            $stmtUserVotes->bindParam(":userEmail", $userEmail, PDO::PARAM_STR);
            $stmtUserVotes->bindParam(":eventID", $eventID, PDO::PARAM_INT);
			
			// AMOUNT GOERS
			$stmtPostVotes = DBIface::connect()->prepare("SELECT COUNT(1) FROM UNI_VOTES_E WHERE EVENT_ID=:eventID");
            $stmtPostVotes->bindParam(":eventID", $eventID, PDO::PARAM_INT);
			
			$results = "";
            foreach ($rows as $row) {
                $userID = $row['USER_ID'];
                if ($stmt->execute()) {
                    $userAlias = "";
                    $userName = "";
                    $userRow = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($userRow) {
                        $userAlias = $userRow["USER_ALIAS"];
                        $userName = $userRow["USER_NAME"];
                    }
					$eventID = $row['EVENT_ID'];
					$comAmount = 0;
                    if ($stmtPostComs->execute()) {
                        $countRow = $stmtPostComs->fetch(PDO::FETCH_NUM);
                        if ($countRow) {
                            $comAmount = $countRow[0];
                        }
                    } else return false;
					$hasVoted = 0;
                    if ($stmtUserVotes->execute()) {
                        if ($stmtUserVotes->fetch()) {
                            $hasVoted = 1;
                        }
                    } else return false;
                    $voteAmount = 0;
                    if ($stmtPostVotes->execute()) {
                        $countRow = $stmtPostVotes->fetch(PDO::FETCH_NUM);
                        if ($countRow) {
                            $voteAmount = $countRow[0];
                        }
                    } else return false;
                    $results = $results.$row['EVENT_ID']."^".$userName."^".$row['EVENT_NAME']."^".$row['EVENT_DESCR'].
                        "^".$row['EVENT_TIME']."^".$userAlias."^".$row['USER_ID']."^".$comAmount."^".$voteAmount."^".$hasVoted."|";
                } else return false;
            }
            return $results;
        }
    }
    return false;
}

function searchNew($srchStr, $userEmail, $frag, $start, $max) {
    if (!empty($frag) and !empty($userEmail)) {
        if (empty($start)) $start = 0;
        if (empty($max)) $max = 0;
        if (empty($srchStr)) {
            $stmt = DBIface::connect()->prepare("SELECT * FROM UNI_POSTS WHERE POST_EMAIL_FRAG=:frag ".
                "ORDER BY POST_ID DESC LIMIT :offset,:limit");
        } else {
            $stmt = DBIface::connect()->prepare("SELECT * FROM UNI_POSTS WHERE (POST_USERNAME LIKE :srchStrUser ".
                "OR POST_TEXT LIKE :srchStrText) AND POST_EMAIL_FRAG=:frag LIMIT :offset,:limit");
            $stmt->bindValue(":srchStrUser", "%".$srchStr."%", PDO::PARAM_STR);
            $stmt->bindValue(":srchStrText", "%".$srchStr."%", PDO::PARAM_STR);
        }
        $stmt->bindValue(":frag", $frag, PDO::PARAM_STR);
        $stmt->bindValue(":offset", $start, PDO::PARAM_INT);
        $stmt->bindValue(":limit", $max, PDO::PARAM_INT);
        if ($stmt->execute()) {
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $postEmail = "";
            $postID = 0;
            $stmtUserDetails = DBIface::connect()->prepare("SELECT * FROM UNI_USERS WHERE USER_EMAIL=:postEmail LIMIT 1");
            $stmtUserDetails->bindParam(":postEmail", $postEmail, PDO::PARAM_STR);
            
			$stmtUserVotes = DBIface::connect()->prepare("SELECT * FROM UNI_VOTES_P WHERE USER_EMAIL=:userEmail ".
                "AND POST_ID=:postID LIMIT 1");
            $stmtUserVotes->bindParam(":userEmail", $userEmail, PDO::PARAM_STR);
            $stmtUserVotes->bindParam(":postID", $postID, PDO::PARAM_INT);
            
			$stmtPostVotes = DBIface::connect()->prepare("SELECT COUNT(1) FROM UNI_VOTES_P WHERE POST_ID=:postID");
            $stmtPostVotes->bindParam(":postID", $postID, PDO::PARAM_INT);
            
			$stmtPostComs = DBIface::connect()->prepare("SELECT COUNT(1) FROM UNI_POST_COM WHERE POST_ID=:postID AND COM_TYPE='Post'");
            $stmtPostComs->bindParam(":postID", $postID, PDO::PARAM_INT);
			
			$results = "";
            foreach ($rows as $row) {
                $postEmail = $row['POST_EMAIL'];
                if ($stmtUserDetails->execute()) {
                    $userAlias = "";
                    $userName = "";
                    $userID = "";
                    $userRow = $stmtUserDetails->fetch(PDO::FETCH_ASSOC);
                    if ($userRow) {
                        $userAlias = $userRow["USER_ALIAS"];
                        $userName = $userRow["USER_NAME"];
                        $userID = $userRow["USER_ID"];
                    }
                    $hasVoted = 0;
                    $postID = $row['POST_ID'];
                    if ($stmtUserVotes->execute()) {
                        if ($stmtUserVotes->fetch()) {
                            $hasVoted = 1;
                        }
                    } else return false;
                    $voteAmount = 0;
                    if ($stmtPostVotes->execute()) {
                        $countRow = $stmtPostVotes->fetch(PDO::FETCH_NUM);
                        if ($countRow) {
                            $voteAmount = $countRow[0];
                        }
                    } else return false;
					$comAmount = 0;
                    if ($stmtPostComs->execute()) {
                        $countRow = $stmtPostComs->fetch(PDO::FETCH_NUM);
                        if ($countRow) {
                            $comAmount = $countRow[0];
                        }
                    } else return false;
                } else return false;
                $results = $results.$row['POST_ID']."^".$userName."^".$row['POST_TEXT']."^".$row['POST_TIME'].
                    "^".$userAlias."^".$row['POST_IMG']."^".$userID."^".$voteAmount."^".$hasVoted."^".$comAmount."|";
            }
            return $results;
        }
    }
    return false;
}

function searchUsers($srchStr, $userEmail, $frag, $start, $max) {
    if (!empty($frag) and !empty($userEmail)) {
        if (empty($start)) $start = 0;
        if (empty($max)) $max = 0;
        if (empty($srchStr)) {
            $stmt = DBIface::connect()->prepare("SELECT * FROM UNI_USERS WHERE USER_EMAIL_FRAG=:frag ".
                "AND VERIFIED_NUM=1 ORDER BY USER_NAME ASC LIMIT :offset,:limit");
        } else {
            $stmt = DBIface::connect()->prepare("SELECT * FROM UNI_USERS WHERE (USER_NAME LIKE :srchStrUser ".
                "OR USER_DESCRIPTION LIKE :srchStrDesc) AND VERIFIED_NUM=1 AND USER_EMAIL_FRAG=:frag ".
                " ORDER BY USER_NAME ASC LIMIT :offset,:limit");
            $stmt->bindValue(":srchStrUser", "%".$srchStr."%", PDO::PARAM_STR);
            $stmt->bindValue(":srchStrDesc", "%".$srchStr."%", PDO::PARAM_STR);
        }
        $stmt->bindValue(":frag", $frag, PDO::PARAM_STR);
        $stmt->bindValue(":offset", $start, PDO::PARAM_INT);
        $stmt->bindValue(":limit", $max, PDO::PARAM_INT);
        if ($stmt->execute()) {
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $userID = 0;
            $stmtUserVotes = DBIface::connect()->prepare("SELECT * FROM UNI_VOTES WHERE USER_EMAIL=:userEmail ".
                "AND USER_ID=:userID LIMIT 1");
            $stmtUserVotes->bindParam(":userEmail", $userEmail, PDO::PARAM_STR);
            $stmtUserVotes->bindParam(":userID", $userID, PDO::PARAM_INT);
            $stmtAllVotes = DBIface::connect()->prepare("SELECT COUNT(1) FROM UNI_VOTES WHERE USER_ID=:userID");
            $stmtAllVotes->bindParam(":userID", $userID, PDO::PARAM_INT);
            $results = "";
            foreach ($rows as $row) {
                $userID = $row['USER_ID'];
                $hasVoted = 0;
                if ($stmtUserVotes->execute()) {
                    if ($stmtUserVotes->fetch()) {
                        $hasVoted = 1;
                    }
                } else return false;
                $voteAmount = 0;
                if ($stmtAllVotes->execute()) {
                    $countRow = $stmtAllVotes->fetch(PDO::FETCH_NUM);
                    if ($countRow) {
                        $voteAmount = $countRow[0];
                    }
                } else return false;
                $results = $results.$row['USER_ID']."^".$row['USER_NAME']."^".$row['USER_DESCRIPTION']."^".""."^".
                    $row['USER_ALIAS']."^".$voteAmount."^".$hasVoted."|";
            }
            return $results;
        }
    }
    return false;
}
