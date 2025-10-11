<?php 
    require_once __DIR__ . "/caches.php";

    $FAVICONS_PNG = ["120x120"];
    $FAVICONS_TOUCH = ["180x180"];
?>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Play:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/<?php echo include_file("assets/style/main.css"); ?>">

    <?php
        foreach ($FAVICONS_PNG as $item) {
    ?>
    <link type="image/png" sizes="<?php echo $item; ?>" rel="icon" href="<?php echo $path_to_root; ?>assets/images/favicons/favicon-<?php echo $item; ?>.png">
    <?php
        }

        foreach ($FAVICONS_TOUCH as $item) {
    ?>
    <link sizes="<?php echo $item; ?>" rel="apple-touch-icon" href="<?php echo $path_to_root; ?>assets/images/favicons/apple-<?php echo $item; ?>.png">
    <?php
        }
    ?>

    <script src="/<?php echo include_file("assets/scripts/lib/browser.js"); ?>"></script>
    <script src="/<?php echo include_file("assets/scripts/diary/pageload.js"); ?>"></script>

    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0">
	<meta name="keywords" content="дневник мигрени, мигренозник, дневник">
	<meta name="description" content="Мигренозник &mdash; дневник мигрени">
    <link rel="manifest" href="manifest.json" crossorigin="use-credentials"  />
    <title>Мигренозник &mdash; дневник мигрени</title>
</head>