<?php
// Example PHP file
// This demonstrates basic PHP functionality

function greet($name) {
    return "Hello, " . $name . "!";
}

$names = ["Alice", "Bob", "Charlie"];

echo "<h1>PHP Examples</h1>";
echo "<ul>";

foreach ($names as $name) {
    echo "<li>" . greet($name) . "</li>";
}

echo "</ul>";

// Show PHP info
echo "<h2>PHP Information</h2>";
echo "<pre>";
echo "PHP Version: " . phpversion() . "\n";
echo "Server Software: " . $_SERVER['SERVER_SOFTWARE'] ?? 'php-wasm' . "\n";
echo "Current Time: " . date('Y-m-d H:i:s') . "\n";
echo "</pre>";
?>
