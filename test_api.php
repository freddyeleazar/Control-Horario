<?php
// Test script to verify API functionality
echo "<h2>Testing Violin Lessons API</h2>";

// Test 1: Check if data directory exists
$dataDir = __DIR__ . '/data';
echo "<h3>1. Data Directory Test</h3>";
if (file_exists($dataDir)) {
    echo "✅ Data directory exists: " . $dataDir . "<br>";
} else {
    echo "❌ Data directory does not exist: " . $dataDir . "<br>";
}

// Test 2: Check if CSV file exists
$csvFile = $dataDir . '/records.csv';
echo "<h3>2. CSV File Test</h3>";
if (file_exists($csvFile)) {
    echo "✅ CSV file exists: " . $csvFile . "<br>";
    echo "File size: " . filesize($csvFile) . " bytes<br>";
} else {
    echo "❌ CSV file does not exist: " . $csvFile . "<br>";
}

// Test 3: Test API endpoint by including it directly
echo "<h3>3. Direct API Test</h3>";
try {
    // Simulate GET request
    $_SERVER['REQUEST_METHOD'] = 'GET';
    ob_start();
    include('api/records.php');
    $output = ob_get_clean();
    
    echo "✅ API executed successfully<br>";
    echo "Response: " . htmlspecialchars($output) . "<br>";
    
    $data = json_decode($output, true);
    if ($data && isset($data['success'])) {
        echo "✅ API response is valid JSON<br>";
        echo "Success: " . ($data['success'] ? 'true' : 'false') . "<br>";
        echo "Records count: " . (is_array($data['data']) ? count($data['data']) : 0) . "<br>";
    }
} catch (Exception $e) {
    echo "❌ API test failed: " . $e->getMessage() . "<br>";
}

// Test 4: Check if data directory was created
echo "<h3>4. Data Directory After API Call</h3>";
if (file_exists($dataDir)) {
    echo "✅ Data directory now exists: " . $dataDir . "<br>";
} else {
    echo "❌ Data directory still does not exist<br>";
}

// Test 5: Check CSV content
echo "<h3>5. CSV Content Test</h3>";
if (file_exists($csvFile)) {
    $content = file_get_contents($csvFile);
    echo "✅ CSV file exists<br>";
    echo "CSV Content:<br>";
    echo "<pre>" . htmlspecialchars($content) . "</pre>";
} else {
    echo "❌ CSV file not found<br>";
}

// Test 6: Test creating a record
echo "<h3>6. Create Test Record</h3>";
try {
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $testRecord = [
        'date' => '2025-06-05',
        'duration' => '1:30',  
        'notes' => 'Test lesson from direct API test'
    ];
    
    // Mock the input
    $tempInput = tmpfile();
    fwrite($tempInput, json_encode($testRecord));
    rewind($tempInput);
    
    ob_start();
    include('api/records.php');
    $output = ob_get_clean();
    
    fclose($tempInput);
    
    echo "✅ POST API executed<br>";
    echo "Response: " . htmlspecialchars($output) . "<br>";
    
} catch (Exception $e) {
    echo "❌ POST API test failed: " . $e->getMessage() . "<br>";
}

// Test 7: Final CSV check
echo "<h3>7. Final CSV Content</h3>";
if (file_exists($csvFile)) {
    $content = file_get_contents($csvFile);
    echo "✅ CSV file exists after POST<br>";
    echo "File size: " . filesize($csvFile) . " bytes<br>";
    echo "CSV Content:<br>";
    echo "<pre>" . htmlspecialchars($content) . "</pre>";
} else {
    echo "❌ CSV file still not found<br>";
}
?>
