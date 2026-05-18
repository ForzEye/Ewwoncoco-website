<?php
use Illuminate\Support\Facades\Storage;

$files = ['products/coconut_original.png', 'products/coconut_lime.png', 'products/coconut_pudding.png'];

foreach ($files as $f) {
    $exists = Storage::disk('s3')->exists($f);
    echo "File $f: " . ($exists ? "EXISTS" : "MISSING") . "\n";
}
