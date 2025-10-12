<?php
    $CACHES = array(
        // CSS
        "assets/style/main.css" => "12.10.25.2",

        // JS
        "assets/scripts/lib/browser.js" => "12.10.25.2",
        "assets/scripts/lib/datetime.js" => "12.10.25.2",
        "assets/scripts/diary/main.js" => "12.10.25.2",
        "assets/scripts/diary/pageload.js" => "12.10.25.2",
    );

    /**
     * This functions prepares path to include file with inserting cache salt.
     * 
     * Cache salt is a number represents a date of last change of the file (or random number if file is unlisted).
     * @param string $filename Path to style or script to include (starts with "assets/...")
     * @return string Path with cache salt at the end (e.g. "assets/style.css?2756328")
     */
    function include_file(string $filename) : string {
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