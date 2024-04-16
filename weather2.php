<?php
// Shashank Pandey
// 2408414
$servername = "localhost";
$username = "root";
$password = "";
$database = "weather_db";

$conn = mysqli_connect($servername, $username, $password, $database);

header('Content-Type: application/json');

if ($conn) {
    // "SQL connected successfully";
} else {
    echo "Failed to connect" . mysqli_connect_error();
}

if (isset($_GET['q']) && !empty($_GET['q'])) {
    $city = $_GET['q'];
} else {
    $city = "dibrugarh";
}

$resultToday = mysqli_query($conn, "SELECT * FROM weather WHERE city = '$city' AND date >= CURDATE()");

if ($resultToday && mysqli_num_rows($resultToday) > 0) {
    $selectRecentData = "SELECT city, temperature, humidity, pressure, wind_speed, weather_description, icon, DATE(date) AS date FROM weather WHERE city='$city' AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(date)";
    $result = mysqli_query($conn, $selectRecentData);

    if (mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        $json_data = json_encode($rows);
        echo $json_data;
    } else {
        echo json_encode(array('error' => 'No data found for the city in the last 7 days'));
    }
} else {
    $apiKey = "f1e32b83ca13f5d5ac6bbe001d9d095c";
    $weather_url = "https://api.openweathermap.org/data/2.5/weather?q=$city&units=metric&appid=$apiKey";
    $data = json_decode(file_get_contents($weather_url), true);

    if (isset($data['main'])) {
        $temperature = $data['main']['temp'];
        $name = $data['name'];
        $humidity = $data['main']['humidity'];
        $pressure = $data['main']['pressure'];
        $wind_speed = $data['wind']['speed'];
        $weather_description = $data['weather'][0]['description'] ?? 'Unknown';
        $icon = $data['weather'][0]['icon'] ?? '01d';

        $insertData = "INSERT INTO weather (city, temperature, humidity, pressure, wind_speed, weather_description, icon, date) VALUES ('$city', '$temperature', '$humidity', '$pressure', '$wind_speed', '$weather_description', '$icon', NOW())";

        if (mysqli_query($conn, $insertData)) {
            $selectRecentData = "SELECT city, temperature, humidity, pressure, wind_speed, weather_description, icon, DATE(date) AS date FROM weather WHERE city='$city' AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(date)";
            $result = mysqli_query($conn, $selectRecentData);

            if (mysqli_num_rows($result) > 0) {
                while ($row = mysqli_fetch_assoc($result)) {
                    $rows[] = $row;
                }
                $json_data = json_encode($rows);
                echo $json_data;
            } else {
                echo json_encode(array('error' => 'No data found for the city in the last 7 days'));
            }
        } else {
            echo json_encode(array('error' => 'Error updating database: ' . mysqli_error($conn)));
        }
    } else {
        echo json_encode(array('error' => 'City not found'));
    }
}
?>
