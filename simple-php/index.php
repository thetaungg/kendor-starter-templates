<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PHP Application</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            text-align: center;
            background: white;
            padding: 3rem;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 600px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #667eea;
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            color: #666;
        }
        .info {
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 5px;
            margin: 1rem 0;
            text-align: left;
        }
        .info code {
            background: #e0e0e0;
            padding: 0.2rem 0.5rem;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>PHP Application</h1>
        <p>Welcome to your PHP application running in php-wasm!</p>
        
        <div class="info">
            <strong>PHP Version:</strong> <?php echo phpversion(); ?><br>
            <strong>Server Time:</strong> <?php echo date('Y-m-d H:i:s'); ?><br>
            <strong>Current File:</strong> <code><?php echo __FILE__; ?></code>
        </div>
        
        <div class="info">
            <h3>Try it out:</h3>
            <p>Edit <code>index.php</code> to see your changes!</p>
            <p>You can use all PHP features without any dependencies.</p>
        </div>
    </div>
</body>
</html>
