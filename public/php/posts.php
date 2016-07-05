<?php

include 'db_interface.php';
include 'images.php';

function getComments($postID, $comType) {
    if (!empty($postID) and !empty($comType)) {
        $stmt = DBIface::connect()->prepare("SELECT * FROM UNI_POST_COM WHERE POST_ID=:postID AND COM_TYPE=:comType ".
            "ORDER BY COM_TIME DESC limit 50");
        $stmt->bindValue(":postID", $postID, PDO::PARAM_INT);
        $stmt->bindValue(":comType", $comType, PDO::PARAM_STR);
        if ($stmt->execute()) {
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }
    return false;
}

function getNotifications($userID) {
    if (!empty($userID)) {
        $stmt = DBIface::connect()->prepare("SELECT * FROM UNI_NOTIFICATIONS WHERE USER_ID=:userID");
        $stmt->bindValue(":userID", $userID, PDO::PARAM_INT);
        if ($stmt->execute()) {
			$stmtN = DBIface::connect()->prepare("DELETE FROM UNI_NOTIFICATIONS WHERE USER_ID=:userID");
			$stmtN->bindValue(":userID", $userID, PDO::PARAM_INT);
			$stmtN->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }
    return false;
}

function postComment($postID, $user, $comment, $comType, $userID) {
    if (!empty($postID) and !empty($user) and !empty($comment) and !empty($comType)) {
        $currTime = round(microtime(true) * 1000);
        $stmt = DBIface::connect()->prepare("INSERT INTO UNI_POST_COM ".
            "(POST_ID, COM_USER, COM_TXT, COM_TIME, COM_TYPE, USER_ID) ".
            "VALUES(:postID, :user, :comment, ".$currTime.", :comType, :userID)");
        $stmt->bindValue(":postID", $postID, PDO::PARAM_INT);
        $stmt->bindValue(":user", $user, PDO::PARAM_STR);
        $stmt->bindValue(":comment", $comment, PDO::PARAM_STR);
        $stmt->bindValue(":comType", $comType, PDO::PARAM_STR);
		$stmt->bindValue(":userID", $userID, PDO::PARAM_STR);
		
		// INSERT NOTIFICATION:
		$userIDN = 0;
		$stmtN = '';
		if($comType == "Post"){
			$stmtN = DBIface::connect()->prepare("SELECT * FROM UNI_POSTS WHERE POST_ID=:mainID");
			$stmtN->bindValue(":mainID", $postID, PDO::PARAM_STR);
			if ($stmtN->execute()) {
				$row = $stmtN->fetch(PDO::FETCH_ASSOC);
				if ($row) {
					$userIDN = (int) $row["POST_USERID"];
				}
			}else{
				echo "FAILED!";
			}
		} else {
			$stmtN = DBIface::connect()->prepare("SELECT * FROM UNI_EVENTS WHERE EVENT_ID=:mainID");
			$stmtN->bindValue(":mainID", $postID, PDO::PARAM_STR);
			if ($stmtN->execute()) {
				$row = $stmtN->fetch(PDO::FETCH_ASSOC);
				if ($row) {
					$userIDN = (int) $row["USER_ID"];
				}
			} else {
				echo "FAILED!";
			}
		}
		echo ($userIDN . ' - ' . $userID);
		if($userIDN != $userID){
			$notifText = ($user." has commented on your ".$comType);
			$stmtNN = DBIface::connect()->prepare("INSERT INTO UNI_NOTIFICATIONS ".
				"(USER_ID, NOTIFICATION_TEXT) ".
				"VALUES(:userID, :notifText)");
			$stmtNN->bindValue(":userID", $userIDN, PDO::PARAM_INT);
			$stmtNN->bindValue(":notifText", $notifText, PDO::PARAM_STR);
			if($stmtNN->execute()){
				// GOOD
			}
		}
        return $stmt->execute();
    }
    return false;
}

function postReport($repName, $repID, $repeName, $repeID, $reptxt) {
    if (!empty($repID) and !empty($repeID)) {
        $stmt = DBIface::connect()->prepare("INSERT INTO UNI_REPORTS ".
            "(REPORTER_NAME, REPORTER_ID, REPORTEE_NAME, REPORTEE_ID, REPORT_TEXT) ".
            "VALUES(:repName, :repID, :repeName, :repeID, :repTxt)");
        $stmt->bindValue(":repName", $repName, PDO::PARAM_STR);
        $stmt->bindValue(":repID", $repID, PDO::PARAM_INT);
        $stmt->bindValue(":repeName", $repeName, PDO::PARAM_STR);
        $stmt->bindValue(":repeID", $repeID, PDO::PARAM_INT);
		$stmt->bindValue(":repTxt", $reptxt, PDO::PARAM_STR);
        return $stmt->execute();
    }
    return false;
}

function postEvent($user, $userID, $eventName, $eventDesc, $eventTime, $frag) {
    if (!empty($user) and !empty($userID) and !empty($eventName)
        and !empty($eventDesc) and !empty($eventTime) and !empty($frag)) {
        $stmt = DBIface::connect()->prepare("INSERT INTO UNI_EVENTS ".
            "(USER_NAME, USER_ID, EVENT_NAME, EVENT_DESCR, EVENT_TIME, EVENT_EMAIL_FRAG) ".
            "VALUES(:user, :userID, :eventName, :eventDesc, :eventTime, :frag)");
        $stmt->bindValue(":user", $user, PDO::PARAM_STR);
        $stmt->bindValue(":userID", $userID, PDO::PARAM_INT);
        $stmt->bindValue(":eventName", $eventName, PDO::PARAM_STR);
        $stmt->bindValue(":eventDesc", $eventDesc, PDO::PARAM_STR);
        $stmt->bindValue(":eventTime", $eventTime, PDO::PARAM_STR); // Presume time is in ms, if not change this type
        $stmt->bindValue(":frag", $frag, PDO::PARAM_STR); // I think this is supposed to be a string?
        return $stmt->execute();
    }
    return false;
}

function postPublish($user, $email, $postText, $frag, $image, $userID) {
    // Is $user needed? It's not called in the original code except to check if it's empty
    if (!empty($user) and !empty($email) and !empty($postText) and !empty($frag) and !empty($userID)) {
        $stmt = DBIface::connect()->prepare("SELECT * FROM UNI_USERS WHERE USER_EMAIL=:email LIMIT 1");
        $stmt->bindValue(":email", $email, PDO::PARAM_STR);
        if ($stmt->execute()) {
            $userName = "";
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $userName = $row["USER_NAME"];
            }
            $currTime = round(microtime(true) * 1000);
            $stmt = DBIface::connect()->prepare("INSERT INTO UNI_POSTS ".
                "(POST_USERNAME, POST_TEXT, POST_TIME, POST_EMAIL_FRAG, POST_IMG, POST_EMAIL, POST_USERID) ".
                "VALUES(:userName, :postText, ".$currTime.", :frag, '', :email, :userID)");
            $stmt->bindValue(":userName", $user, PDO::PARAM_STR);
            $stmt->bindValue(":postText", $postText, PDO::PARAM_STR);
            $stmt->bindValue(":frag", $frag, PDO::PARAM_STR);
            $stmt->bindValue(":email", $email, PDO::PARAM_STR);
			 $stmt->bindValue(":userID", $userID, PDO::PARAM_STR);
            if ($stmt->execute()) {
                if (!empty($image)) {
                    $postID = DBIface::connect()->lastInsertId();
                    $imagePath = "http://cyberkomm.ch/sidney/php/uni/images/post_images/post_image_".$postID.".png";
                    $stmt = DBIface::connect()->prepare("UPDATE UNI_POSTS SET POST_IMG=:imagePath WHERE POST_ID=:postID");
                    $stmt->bindValue(":imagePath", $imagePath, PDO::PARAM_STR);
                    $stmt->bindValue(":postID", $postID, PDO::PARAM_INT);
                    $stmt->execute();
                    $imagePath = __DIR__."/../images/post_images/post_image_".$postID.".png";
                    saveImage($image, $imagePath);
                }
                return true;
            }
        }
    }
    return false;
}
