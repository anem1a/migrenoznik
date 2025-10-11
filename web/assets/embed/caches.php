<?php
    $CACHES = array(
        // CSS
        "assets/style/main.css" => "11.10.25.1",

        // JS
        "assets/scripts/lib/browser.js" => "11.10.25.1",
        "assets/scripts/diary/pageload.js" => "11.10.25.1",
    );

    function include_file($filename) {
        global $CACHES;
        if (array_key_exists($filename, $CACHES)) {
            return $filename . "?" . str_replace(".", "", $CACHES[$filename]);
        }
        $today = date("Ymd");
        srand($today);
        $random = rand();
        return $filename . "?" . $random;
    }
?>