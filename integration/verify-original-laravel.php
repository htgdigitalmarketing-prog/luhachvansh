<?php
// Run only via PHP CLI in a PRIVATE directory alongside original public_html.
// No credentials, private records, HTML, session tokens or exception messages output.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
if (time() >= strtotime('2026-10-15T00:00:00Z')) { exit; }
umask(0077);
ini_set('display_errors', '0');
ini_set('log_errors', '0');
error_reporting(0);
$reportFile = __DIR__ . '/laravel-auth-check-php' . PHP_MAJOR_VERSION . PHP_MINOR_VERSION . '.json';
if (is_file($reportFile)) { exit; }
$lock = fopen(__DIR__ . '/laravel-check.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) { exit; }
$phase = 'preflight';
$result = ['checkedAt' => gmdate('c'), 'php' => PHP_VERSION, 'checks' => [], 'routes' => []];
$saved = false;
$pdo = null;
$save = function () use (&$result, &$saved, $reportFile) {
    if ($saved) { return; }
    $result['finishedAt'] = gmdate('c');
    file_put_contents($reportFile, json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    chmod($reportFile, 0600);
    $saved = true;
};
register_shutdown_function(function () use (&$result, &$phase, &$saved, $save) {
    if (!$saved) {
        $e = error_get_last();
        $result['ok'] = false;
        $result['error'] = ['phase' => $phase, 'type' => $e ? $e['type'] : 'early_exit'];
        if ($e) {
            $result['error']['file'] = basename($e['file']);
            $result['error']['line'] = $e['line'];
            $result['error']['category'] = 'other_fatal';
            foreach (['Return type','During inheritance','Declaration of','Class','Interface','Trait','syntax error','Allowed memory','Permission denied','Failed opening','undefined function'] as $label) {
                if (strpos($e['message'], $label) !== false) { $result['error']['category'] = $label; break; }
            }
        }
        $save();
    }
});
ob_start();
try {
    $root = realpath(__DIR__ . '/../public_html');
    if (!$root || !is_file($root . '/artisan') || !is_file($root . '/vendor/autoload.php')) {
        throw new RuntimeException('Unexpected original application location');
    }
    chdir($root);
    define('LARAVEL_START', microtime(true));
    require $root . '/vendor/autoload.php';
    $app = require $root . '/bootstrap/app.php';
    $app->instance('request', Illuminate\Http\Request::create('https://luhachvansh.com/', 'GET'));
    $phase = 'bootstrap';
    $console = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $console->bootstrap();
    $result['checks']['laravelBoot'] = true;
    $result['laravel'] = $app->version();
    // These overrides live only in this CLI process; original .env is never changed.
    $app['config']->set('app.debug', false);
    $app['config']->set('session.driver', 'array');
    $app['config']->set('cache.default', 'array');
    $phase = 'database';
    if ($app['config']->get('database.connections.mysql.database') !== 'u112235086_luhach') {
        throw new RuntimeException('Unexpected database');
    }
    $cfg = $app['config']->get('database.connections.mysql');
    $result['configuration'] = [
        'cached' => $app->configurationIsCached(),
        'host' => $cfg['host'], 'port' => $cfg['port'],
        'database' => $cfg['database'], 'username' => $cfg['username']
    ];
    $rawEnv = file_get_contents($root . '/.env');
    $rawPassword = null;
    if (preg_match('/^DB_PASSWORD=(.*)$/m', $rawEnv, $m)) {
        $rawPassword = rtrim($m[1], "\r");
        $quoted = strlen($rawPassword) >= 2 && ($rawPassword[0] === '"' || $rawPassword[0] === "'") && substr($rawPassword, -1) === $rawPassword[0];
        if ($quoted) { $rawPassword = substr($rawPassword, 1, -1); }
        $result['configuration']['passwordQuoted'] = $quoted;
        $result['configuration']['passwordMatchesLiteralSaved'] = hash_equals((string) $cfg['password'], $rawPassword);
    }
    unset($rawEnv, $m);
    $authAttempts = ['configured' => [$cfg['host'], $cfg['password']]];
    if ($cfg['host'] !== 'localhost') { $authAttempts['localhost'] = ['localhost', $cfg['password']]; }
    if ($rawPassword !== null && !$quoted && !hash_equals((string) $cfg['password'], $rawPassword)) {
        $authAttempts['literalSaved'] = [$cfg['host'], $rawPassword];
    }
    $result['authChecks'] = [];
    foreach ($authAttempts as $label => $attempt) {
        try {
            $testPdo = new PDO('mysql:host=' . $attempt[0] . ';port=' . $cfg['port'] . ';dbname=' . $cfg['database'] . ';charset=' . $cfg['charset'], $cfg['username'], $attempt[1], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 5]);
            $result['authChecks'][$label] = ['ok' => (int) $testPdo->query('SELECT 1')->fetchColumn() === 1];
            $testPdo = null;
        } catch (PDOException $authError) {
            $result['authChecks'][$label] = ['ok' => false, 'code' => (string) $authError->getCode(), 'driverCode' => isset($authError->errorInfo[1]) ? (int) $authError->errorInfo[1] : null];
        }
    }
    unset($authAttempts, $attempt, $rawPassword, $cfg);
    if (!$result['authChecks']['configured']['ok'] && isset($result['authChecks']['localhost']) && $result['authChecks']['localhost']['ok']) {
        $app['config']->set('database.connections.mysql.host', 'localhost');
        Illuminate\Support\Facades\DB::purge();
        $result['candidateHostOverride'] = 'localhost (CLI memory only; original .env unchanged)';
    }
    $connection = Illuminate\Support\Facades\DB::connection();
    $pdo = $connection->getPdo();
    $pdo->exec('SET TRANSACTION READ ONLY');
    $pdo->beginTransaction();
    $identity = $connection->selectOne('SELECT DATABASE() AS database_name');
    $result['checks']['originalDatabase'] = $identity->database_name === 'u112235086_luhach';
    if (!$result['checks']['originalDatabase']) { throw new RuntimeException('Unexpected selected database'); }
    $result['counts'] = [];
    foreach (['about','history','village','gallery','news','team','members','shaheed','village_gallery','only_village'] as $table) {
        $result['counts'][$table] = (int) $connection->table($table)->count();
    }
    $phase = 'migration_status';
    $result['checks']['migrationStatusExit'] = $console->call('migrate:status');
    $phase = 'public_routes';
    $http = $app->make(Illuminate\Contracts\Http\Kernel::class);
    foreach (['/', '/history', '/present', '/team', '/memories', '/shaheed', '/achievers/all', '/login'] as $path) {
        $request = Illuminate\Http\Request::create('https://luhachvansh.com' . $path, 'GET');
        $response = $http->handle($request);
        $status = $response->getStatusCode();
        $body = $response->getContent();
        $result['routes'][$path] = ['status' => $status, 'bytes' => strlen($body), 'sha256' => hash('sha256', $body)];
        unset($body, $response, $request);
    }
    $result['ok'] = $result['checks']['originalDatabase'] && $result['checks']['migrationStatusExit'] === 0;
    foreach ($result['routes'] as $route) { $result['ok'] = $result['ok'] && $route['status'] === 200 && $route['bytes'] > 1000; }
} catch (Throwable $e) {
    $result['ok'] = false;
    $result['error'] = ['phase' => $phase, 'class' => get_class($e), 'code' => (string) $e->getCode()];
    if ($e instanceof PDOException && isset($e->errorInfo[1])) { $result['error']['driverCode'] = (int) $e->errorInfo[1]; }
} finally {
    if ($pdo && $pdo->inTransaction()) { $pdo->rollBack(); }
    while (ob_get_level()) { ob_end_clean(); }
    $save();
    echo json_encode($result, JSON_UNESCAPED_SLASHES), PHP_EOL;
    flock($lock, LOCK_UN);
    fclose($lock);
}
