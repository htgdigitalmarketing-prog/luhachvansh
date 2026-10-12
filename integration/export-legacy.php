<?php
// Run only on the existing Laravel host, from CLI. No route is added.
// php integration/export-legacy.php /absolute/private-directory-outside-webroot
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$root = realpath(__DIR__.'/..');
$requested = isset($argv[1]) ? $argv[1] : '';
$parent = realpath(dirname($requested));
if (!$requested || !$parent || file_exists($requested)) throw new RuntimeException('Choose a NEW export directory with an existing private parent outside the website.');
$out = $parent.DIRECTORY_SEPARATOR.basename($requested);
$norm = function($p) { return strtolower(str_replace('\\','/',$p)); };
if ($norm($parent)===$norm($root) || strpos($norm($parent),$norm($root).'/')===0) throw new RuntimeException('Export must be outside the website root.');
require $root.'/vendor/autoload.php';
$app=require $root.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
mkdir($out,0700);
$manifest=['created_utc'=>gmdate('c'),'tables'=>[],'media'=>[],'excluded'=>'users, passwords, sessions, invitations, tokens and environment secrets'];
$tables=['members','village','village_gallery','news','gallery','history','about','team','shaheed','district','only_village','join_us'];
try {
 if(DB::connection()->getDriverName()==='mysql') { DB::statement('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ'); DB::statement('SET TRANSACTION READ ONLY'); }
 DB::beginTransaction();
 foreach($tables as $table) {
  if(!Schema::hasTable($table)) { $manifest['tables'][$table]=['missing'=>true];continue; }
  $file=$out.'/'.$table.'.jsonl';$handle=fopen($file,'xb');$count=0;
  foreach(DB::table($table)->cursor() as $row) {
   $values=(array)$row;
   foreach(array_keys($values) as $key) if(preg_match('/password|token|secret|two_factor|remember_/i',$key)) unset($values[$key]);
   $line=json_encode($values,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR)."\n";
   if(fwrite($handle,$line)!==strlen($line)) throw new RuntimeException('Export write failed');$count++;
  }
  fclose($handle);chmod($file,0600);$manifest['tables'][$table]=['rows'=>$count,'sha256'=>hash_file('sha256',$file)];
 }
 DB::rollBack(); // Source database is never changed.
 foreach(['frontend/img','public/frontend/img'] as $relative) {
  $base=$root.'/'.$relative;if(!is_dir($base))continue;
  $iterator=new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base,FilesystemIterator::SKIP_DOTS));
  foreach($iterator as $file) {
   if(!$file->isFile()||$file->isLink()||!in_array(strtolower($file->getExtension()),['jpg','jpeg','png','webp','gif','svg','pdf','ico','avif','bmp','tif','tiff']))continue;
   $real=$file->getRealPath();if(strpos($norm($real),$norm($root).'/')!==0)continue;
   $rel=substr(str_replace('\\','/',$real),strlen(str_replace('\\','/',$root))+1);
   $dest=$out.'/media/'.$rel;if(!is_dir(dirname($dest)))mkdir(dirname($dest),0700,true);
   if(!copy($real,$dest))throw new RuntimeException('Media copy failed');chmod($dest,0600);
   $manifest['media'][]=['path'=>$rel,'bytes'=>filesize($dest),'sha256'=>hash_file('sha256',$dest)];
  }
 }
 file_put_contents($out.'/COMPLETE.json',json_encode($manifest,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));chmod($out.'/COMPLETE.json',0600);
 echo 'Private export completed: '.count($manifest['tables']).' tables checked; '.count($manifest['media'])." media files. No source changes.\n";
} catch(Throwable $e) {
 if(DB::transactionLevel()>0)DB::rollBack();
 fwrite(STDERR,"Export incomplete. Do not import this folder. Check locally; no source rows were changed.\n");exit(1);
}
