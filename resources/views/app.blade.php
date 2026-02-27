<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Internal Publishing</title>
</head>
<body>
    <div id="root"></div>

    <script>
        window.__vite_plugin_react_preamble_installed__ = true;
    </script>
    @vite('resources/js/appE.jsx')
</body>
</html>

{{-- <!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Internal Publishing</title>
    @vite('resources/js/appE.jsx')
    
    <script>
        window.__vite_plugin_react_preamble_installed__ = true;
    </script>
</head>
<body>
    <div id="root"></div>
</body>
</html> --}}